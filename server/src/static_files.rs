//! Serves the frontend's static export (`next build` with `output: "export"`).

use axum::{
    body::Body,
    extract::{Request, State},
    http::{header, HeaderValue, Method, StatusCode, Uri},
    response::{IntoResponse, Redirect, Response},
};
use axum_extra::extract::cookie::CookieJar;
use tower::ServiceExt;
use tower_http::services::{ServeDir, ServeFile};

use crate::{app::AppState, auth::session_from_jar};

/// Pages that require a logged-in admin. Checked on the decoded, lowercased
/// path so `/%64ashboard` or `/Dashboard` can't sneak past.
fn is_admin_page(decoded_lower: &str) -> bool {
    decoded_lower == "/dashboard"
        || decoded_lower.starts_with("/dashboard/")
        || decoded_lower.starts_with("/dashboard.")
}

/// Plain path segments only: no traversal, no encoded tricks.
fn is_plain_path(path: &str) -> bool {
    path.starts_with('/')
        && !path.contains("..")
        && !path.contains('\\')
        && !path.contains('\0')
        && !path.contains("//")
}

pub async fn serve(State(state): State<AppState>, jar: CookieJar, mut req: Request) -> Response {
    if !matches!(*req.method(), Method::GET | Method::HEAD) {
        return StatusCode::METHOD_NOT_ALLOWED.into_response();
    }

    let raw = req.uri().path().to_string();
    let Ok(decoded) = percent_encoding::percent_decode_str(&raw)
        .decode_utf8()
        .map(|s| s.into_owned())
    else {
        return StatusCode::BAD_REQUEST.into_response();
    };
    if !is_plain_path(&decoded) {
        return StatusCode::BAD_REQUEST.into_response();
    }

    if is_admin_page(&decoded.to_lowercase()) {
        match session_from_jar(&state, &jar).await {
            Ok(Some(_)) => {}
            Ok(None) => return Redirect::to("/login").into_response(),
            Err(e) => return crate::error::AppError::Internal(e).into_response(),
        }
    }

    // "/privacy" -> "/privacy.html" (Next export writes one .html per route).
    let dir = &state.config.static_dir;
    let last = decoded.rsplit('/').next().unwrap_or("");
    if !decoded.ends_with('/')
        && !last.contains('.')
        && dir.join(format!("{}.html", &decoded[1..])).is_file()
    {
        let mut rewritten = format!("{decoded}.html");
        if let Some(q) = req.uri().query() {
            rewritten = format!("{rewritten}?{q}");
        }
        if let Ok(uri) = rewritten.parse::<Uri>() {
            *req.uri_mut() = uri;
        }
    }

    let immutable = decoded.starts_with("/_next/static/");
    let mut res = match ServeDir::new(dir).oneshot(req).await {
        Ok(r) => r.map(Body::new),
        Err(never) => match never {},
    };

    if res.status() == StatusCode::NOT_FOUND {
        let not_found = dir.join("404.html");
        if not_found.is_file() {
            let req = Request::builder()
                .uri("/")
                .body(Body::empty())
                .unwrap_or_default();
            let Ok(r) = ServeFile::new(not_found).oneshot(req).await;
            res = r.map(Body::new);
            *res.status_mut() = StatusCode::NOT_FOUND;
        }
    }

    let cache = if immutable && res.status().is_success() {
        "public, max-age=31536000, immutable"
    } else {
        "no-cache"
    };
    res.headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static(cache));
    res
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn admin_pages() {
        for p in [
            "/dashboard",
            "/dashboard/",
            "/dashboard/modals",
            "/dashboard.html",
            "/dashboard.txt",
            "/dashboard/modals.html",
        ] {
            assert!(is_admin_page(p), "{p}");
        }
        for p in ["/", "/login", "/privacy", "/dashboardish"] {
            assert!(!is_admin_page(p), "{p}");
        }
    }

    #[test]
    fn plain_paths() {
        assert!(is_plain_path("/_next/static/chunks/app/(admin)/page.js"));
        for p in [
            "/../etc/passwd",
            "/a/../../b",
            "/a\\b",
            "//evil",
            "relative",
        ] {
            assert!(!is_plain_path(p), "{p}");
        }
    }
}
