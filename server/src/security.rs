use axum::{
    extract::{Request, State},
    http::{header, HeaderName, HeaderValue, Method},
    middleware::Next,
    response::{IntoResponse, Response},
};

use crate::{app::AppState, error::AppError};

/// Rejects state-changing requests that don't come from our own origin (CSRF defence,
/// on top of SameSite=Strict cookies and the JSON content-type requirement).
pub async fn require_same_origin(
    State(state): State<AppState>,
    req: Request,
    next: Next,
) -> Response {
    if matches!(*req.method(), Method::GET | Method::HEAD | Method::OPTIONS) {
        return next.run(req).await;
    }
    let origin = req
        .headers()
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok());
    if origin != Some(state.config.allowed_origin.as_str()) {
        tracing::warn!(?origin, path = %req.uri().path(), "blocked cross-origin request");
        return AppError::Forbidden.into_response();
    }
    next.run(req).await
}

pub const CSP: &str = concat!(
    "default-src 'self'; ",
    // Next's static export inlines small bootstrap scripts, so 'unsafe-inline' is needed for scripts.
    "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net; ",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ",
    "font-src 'self' data: https://fonts.gstatic.com; ",
    "img-src 'self' data: https:; ",
    "connect-src 'self' https://www.google.com https://www.recaptcha.net; ",
    "frame-src https://www.google.com https://recaptcha.google.com https://www.recaptcha.net; ",
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
);

pub fn headers() -> Vec<(HeaderName, HeaderValue)> {
    vec![
        (
            header::CONTENT_SECURITY_POLICY,
            HeaderValue::from_static(CSP),
        ),
        (
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ),
        (header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY")),
        (
            header::REFERRER_POLICY,
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ),
        (
            header::STRICT_TRANSPORT_SECURITY,
            HeaderValue::from_static("max-age=31536000; includeSubDomains"),
        ),
        (
            HeaderName::from_static("permissions-policy"),
            HeaderValue::from_static("camera=(), microphone=(), geolocation=(), payment=()"),
        ),
        (
            HeaderName::from_static("cross-origin-opener-policy"),
            HeaderValue::from_static("same-origin"),
        ),
    ]
}
