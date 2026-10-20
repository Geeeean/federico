use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::Result;
use axum::{
    extract::{FromRef, FromRequestParts, State},
    http::request::Parts,
    Json,
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use serde::Deserialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use sqlx::SqlitePool;

use crate::{
    app::AppState,
    error::{AppError, AppResult},
    extract::{ApiJson, ClientIp},
};

pub const BCRYPT_COST: u32 = 12;
const MAX_CREDENTIAL_LEN: usize = 256;

/// `__Host-` prefix: browser only accepts it with Secure, Path=/ and no Domain.
/// Local http development falls back to a plain name.
pub fn cookie_name(secure: bool) -> &'static str {
    if secure {
        "__Host-session"
    } else {
        "session"
    }
}

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn hash_token(token: &str) -> String {
    hex::encode(Sha256::digest(token.as_bytes()))
}

fn new_token() -> Result<String> {
    let mut buf = [0u8; 32];
    getrandom::fill(&mut buf).map_err(|e| anyhow::anyhow!("rng failure: {e}"))?;
    Ok(hex::encode(buf))
}

pub async fn hash_password(password: String) -> Result<String> {
    Ok(tokio::task::spawn_blocking(move || bcrypt::hash(password, BCRYPT_COST)).await??)
}

async fn verify_password(password: String, hash: String) -> Result<bool> {
    // bcrypt is deliberately slow; keep it off the async workers.
    Ok(
        tokio::task::spawn_blocking(move || bcrypt::verify(password, &hash).unwrap_or(false))
            .await?,
    )
}

/// Creates the admin user if it doesn't exist yet. Never overwrites an existing password.
pub async fn seed_admin(db: &SqlitePool, username: &str, password: &str) -> Result<bool> {
    let exists: Option<i64> = sqlx::query_scalar("SELECT id FROM users WHERE username = ?")
        .bind(username)
        .fetch_optional(db)
        .await?;
    if exists.is_some() {
        return Ok(false);
    }
    let hash = hash_password(password.to_string()).await?;
    sqlx::query("INSERT INTO users (username, password_hash) VALUES (?, ?)")
        .bind(username)
        .bind(hash)
        .execute(db)
        .await?;
    Ok(true)
}

/// Sets a new password and logs the user out everywhere.
pub async fn set_password(db: &SqlitePool, username: &str, password: &str) -> Result<()> {
    let hash = hash_password(password.to_string()).await?;
    let mut tx = db.begin().await?;
    let res = sqlx::query("UPDATE users SET password_hash = ? WHERE username = ?")
        .bind(&hash)
        .bind(username)
        .execute(&mut *tx)
        .await?;
    if res.rows_affected() == 0 {
        sqlx::query("INSERT INTO users (username, password_hash) VALUES (?, ?)")
            .bind(username)
            .bind(&hash)
            .execute(&mut *tx)
            .await?;
    }
    sqlx::query("DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE username = ?)")
        .bind(username)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(())
}

/// Proof that the request carries a valid admin session. Use it as a handler
/// argument to protect a route.
#[derive(Debug, Clone)]
pub struct AdminSession {
    pub user_id: i64,
    pub username: String,
}

pub async fn session_from_jar(state: &AppState, jar: &CookieJar) -> Result<Option<AdminSession>> {
    let Some(cookie) = jar.get(cookie_name(state.config.cookie_secure)) else {
        return Ok(None);
    };
    let token = cookie.value();
    if token.len() != 64 || !token.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Ok(None);
    }
    let row: Option<(i64, String)> = sqlx::query_as(
        "SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?",
    )
    .bind(hash_token(token))
    .bind(now_secs())
    .fetch_optional(&state.db)
    .await?;
    Ok(row.map(|(user_id, username)| AdminSession { user_id, username }))
}

impl<S> FromRequestParts<S> for AdminSession
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        let jar = CookieJar::from_headers(&parts.headers);
        session_from_jar(&state, &jar)
            .await?
            .ok_or(AppError::Unauthorized)
    }
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LoginBody {
    username: String,
    password: String,
}

pub async fn login(
    State(state): State<AppState>,
    ClientIp(ip): ClientIp,
    jar: CookieJar,
    ApiJson(body): ApiJson<LoginBody>,
) -> AppResult<(CookieJar, Json<Value>)> {
    let user_key = body.username.to_lowercase();
    if !state.login_ip_limiter.check(&ip) || !state.login_user_limiter.check(&user_key) {
        return Err(AppError::TooManyRequests);
    }
    if body.username.is_empty()
        || body.password.is_empty()
        || body.username.len() > MAX_CREDENTIAL_LEN
        || body.password.len() > MAX_CREDENTIAL_LEN
    {
        return Err(AppError::Unauthorized);
    }

    let user: Option<(i64, String)> =
        sqlx::query_as("SELECT id, password_hash FROM users WHERE username = ?")
            .bind(&body.username)
            .fetch_optional(&state.db)
            .await?;

    // Always run bcrypt so response time doesn't reveal whether the username exists.
    let (user_id, hash) = match user {
        Some((id, h)) => (Some(id), h),
        None => (None, state.dummy_hash.clone()),
    };
    let ok = verify_password(body.password, hash).await?;
    let Some(user_id) = user_id.filter(|_| ok) else {
        tracing::warn!(%ip, "failed admin login");
        return Err(AppError::Unauthorized);
    };

    // Only failed attempts should count towards the limits.
    state.login_user_limiter.reset(&user_key);
    state.login_ip_limiter.reset(&ip);

    let token = new_token()?;
    let ttl = state.config.session_ttl.as_secs() as i64;
    let now = now_secs();
    sqlx::query("DELETE FROM sessions WHERE expires_at <= ?")
        .bind(now)
        .execute(&state.db)
        .await?;
    sqlx::query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(hash_token(&token))
        .bind(user_id)
        .bind(now + ttl)
        .execute(&state.db)
        .await?;

    tracing::info!(%ip, "admin login");
    let cookie = Cookie::build((cookie_name(state.config.cookie_secure), token))
        .http_only(true)
        .secure(state.config.cookie_secure)
        .same_site(SameSite::Strict)
        .path("/")
        .max_age(time::Duration::seconds(ttl))
        .build();
    Ok((jar.add(cookie), Json(json!({ "msg": "Logged in" }))))
}

pub async fn logout(
    State(state): State<AppState>,
    jar: CookieJar,
) -> AppResult<(CookieJar, Json<Value>)> {
    let name = cookie_name(state.config.cookie_secure);
    if let Some(c) = jar.get(name) {
        sqlx::query("DELETE FROM sessions WHERE token_hash = ?")
            .bind(hash_token(c.value()))
            .execute(&state.db)
            .await?;
    }
    let removal = Cookie::build((name, ""))
        .path("/")
        .secure(state.config.cookie_secure)
        .http_only(true)
        .same_site(SameSite::Strict)
        .build();
    Ok((jar.remove(removal), Json(json!({ "msg": "Logged out" }))))
}

pub async fn session(admin: AdminSession) -> Json<Value> {
    Json(json!({ "username": admin.username }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_is_random_hex() {
        let a = new_token().unwrap();
        let b = new_token().unwrap();
        assert_eq!(a.len(), 64);
        assert!(a.bytes().all(|c| c.is_ascii_hexdigit()));
        assert_ne!(a, b);
        assert_ne!(hash_token(&a), a, "only the hash is stored");
    }
}
