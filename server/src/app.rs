use std::{sync::Arc, time::Duration};

use anyhow::Result;
use axum::{
    extract::DefaultBodyLimit,
    http::{header, HeaderValue, StatusCode},
    middleware,
    routing::{get, post},
    Router,
};
use sqlx::SqlitePool;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer, set_header::SetResponseHeaderLayer, timeout::TimeoutLayer,
    trace::TraceLayer,
};

use crate::{
    auth, captcha::CaptchaVerifier, config::Config, contacts, posts, ratelimit::RateLimiter,
    security, static_files,
};

const API_BODY_LIMIT: usize = 32 * 1024;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub config: Arc<Config>,
    pub captcha: Arc<dyn CaptchaVerifier>,
    pub login_ip_limiter: Arc<RateLimiter>,
    pub login_user_limiter: Arc<RateLimiter>,
    pub submit_limiter: Arc<RateLimiter>,
    /// bcrypt hash used when the username doesn't exist, to keep login timing uniform.
    pub dummy_hash: String,
}

impl AppState {
    pub async fn new(
        db: SqlitePool,
        config: Config,
        captcha: Arc<dyn CaptchaVerifier>,
    ) -> Result<Self> {
        Ok(Self {
            db,
            config: Arc::new(config),
            captcha,
            login_ip_limiter: Arc::new(RateLimiter::new(10, Duration::from_secs(15 * 60))),
            login_user_limiter: Arc::new(RateLimiter::new(30, Duration::from_secs(15 * 60))),
            submit_limiter: Arc::new(RateLimiter::new(5, Duration::from_secs(60 * 60))),
            dummy_hash: auth::hash_password("not-a-real-password".into()).await?,
        })
    }
}

pub fn router(state: AppState) -> Router {
    let api = Router::new()
        .route("/auth/login", post(auth::login))
        .route("/auth/logout", post(auth::logout))
        .route("/auth/session", get(auth::session))
        .route("/posts/get/all", get(posts::list))
        .route("/posts/add", post(posts::add))
        .route("/posts/remove", post(posts::remove))
        .route("/modals/submit", post(contacts::submit))
        .route("/modals/get/all", get(contacts::list))
        .route("/modals/remove", post(contacts::remove))
        .route("/modals/toggle", post(contacts::toggle))
        .fallback(|| async { crate::error::AppError::NotFound })
        .layer(middleware::from_fn_with_state(
            state.clone(),
            security::require_same_origin,
        ))
        .layer(DefaultBodyLimit::max(API_BODY_LIMIT))
        .layer(SetResponseHeaderLayer::overriding(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-store"),
        ));

    let common = ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(20),
        ))
        .layer(CompressionLayer::new());

    let mut app = Router::new()
        .nest("/api", api)
        .route("/healthz", get(healthz))
        .fallback(static_files::serve)
        .with_state(state);

    for (name, value) in security::headers() {
        app = app.layer(SetResponseHeaderLayer::if_not_present(name, value));
    }
    app.layer(common)
}

/// Used by Railway before switching traffic to a new deploy: only report
/// healthy when the database file can actually be read and written.
async fn healthz(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> (StatusCode, &'static str) {
    let check = async {
        let mut tx = state.db.begin().await?;
        sqlx::query("SELECT count(*) FROM users")
            .execute(&mut *tx)
            .await?;
        sqlx::query("CREATE TEMP TABLE IF NOT EXISTS _health (x)")
            .execute(&mut *tx)
            .await?;
        tx.rollback().await
    };
    match check.await {
        Ok(()) => (StatusCode::OK, "ok"),
        Err(e) => {
            tracing::error!(error = ?e, "health check failed");
            (StatusCode::SERVICE_UNAVAILABLE, "database unavailable")
        }
    }
}
