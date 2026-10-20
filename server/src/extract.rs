use std::net::{IpAddr, SocketAddr};

use axum::{
    extract::{
        rejection::JsonRejection, ConnectInfo, FromRef, FromRequest, FromRequestParts, Request,
    },
    http::request::Parts,
};
use serde::de::DeserializeOwned;

use crate::{app::AppState, error::AppError};

/// Like `axum::Json`, but rejections become our JSON error responses and
/// the request must declare `Content-Type: application/json`.
pub struct ApiJson<T>(pub T);

impl<S, T> FromRequest<S> for ApiJson<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        match axum::Json::<T>::from_request(req, state).await {
            Ok(axum::Json(v)) => Ok(ApiJson(v)),
            Err(JsonRejection::MissingJsonContentType(_)) => Err(AppError::UnsupportedMediaType),
            Err(e) if e.status() == axum::http::StatusCode::PAYLOAD_TOO_LARGE => {
                Err(AppError::PayloadTooLarge)
            }
            Err(_) => Err(AppError::BadRequest("Bad syntax")),
        }
    }
}

/// Best-effort client IP, used only as a rate-limit key.
#[derive(Clone, Debug)]
pub struct ClientIp(pub String);

impl<S> FromRequestParts<S> for ClientIp
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        if let Some(header) = state.config.client_ip_header.as_deref() {
            if let Some(ip) = parts
                .headers
                .get(header)
                .and_then(|v| v.to_str().ok())
                // X-Forwarded-For style lists: the last hop was added by our proxy.
                .and_then(|v| v.rsplit(',').next())
                .and_then(|v| v.trim().parse::<IpAddr>().ok())
            {
                return Ok(ClientIp(ip.to_string()));
            }
        }
        let peer = parts
            .extensions
            .get::<ConnectInfo<SocketAddr>>()
            .map(|c| c.0.ip().to_string())
            .unwrap_or_else(|| "unknown".to_string());
        Ok(ClientIp(peer))
    }
}
