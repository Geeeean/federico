use std::{env, net::SocketAddr, path::PathBuf, time::Duration};

use anyhow::{bail, Context, Result};

/// Runtime configuration, read once from environment variables at startup.
#[derive(Clone, Debug)]
pub struct Config {
    pub bind: SocketAddr,
    pub database_path: PathBuf,
    pub static_dir: PathBuf,
    /// Exact origin (scheme://host[:port]) that is allowed to make state-changing requests.
    pub allowed_origin: String,
    pub cookie_secure: bool,
    pub session_ttl: Duration,
    pub recaptcha_secret: String,
    pub recaptcha_min_score: f64,
    /// Header set by the reverse proxy with the real client IP (e.g. "x-real-ip").
    /// When unset the TCP peer address is used.
    pub client_ip_header: Option<String>,
    pub admin_seed: Option<(String, String)>,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let port: u16 = env_or("PORT", "8080")
            .parse()
            .context("PORT must be a number")?;
        let host = env_or("BIND_HOST", "0.0.0.0");
        let bind: SocketAddr = format!("{host}:{port}")
            .parse()
            .context("invalid BIND_HOST/PORT")?;

        let allowed_origin = required("ALLOWED_ORIGIN")?;
        let parsed = url::Url::parse(&allowed_origin).context("ALLOWED_ORIGIN must be a URL")?;
        if parsed.path() != "/" || allowed_origin.ends_with('/') {
            bail!("ALLOWED_ORIGIN must be an origin like https://example.com (no path or trailing slash)");
        }

        let cookie_secure = env_or("COOKIE_SECURE", "true") != "false";
        if !cookie_secure && parsed.scheme() == "https" {
            bail!("COOKIE_SECURE=false is only allowed with an http:// origin (local development)");
        }

        let ttl_hours: u64 = env_or("SESSION_TTL_HOURS", "12")
            .parse()
            .context("SESSION_TTL_HOURS must be a number")?;
        let recaptcha_min_score: f64 = env_or("RECAPTCHA_MIN_SCORE", "0.3")
            .parse()
            .context("RECAPTCHA_MIN_SCORE must be a number")?;

        let admin_seed = match (
            env::var("SYS_ADMIN_USERNAME"),
            env::var("SYS_ADMIN_PASSWORD"),
        ) {
            (Ok(u), Ok(p)) if !u.is_empty() && !p.is_empty() => Some((u, p)),
            _ => None,
        };

        Ok(Self {
            bind,
            database_path: env_or("DATABASE_PATH", "./data/app.db").into(),
            static_dir: env_or("STATIC_DIR", "./out").into(),
            allowed_origin,
            cookie_secure,
            session_ttl: Duration::from_secs(ttl_hours.clamp(1, 24 * 7) * 3600),
            recaptcha_secret: required("RECAPTCHA_SECRET")?,
            recaptcha_min_score,
            client_ip_header: env::var("CLIENT_IP_HEADER")
                .ok()
                .filter(|s| !s.is_empty())
                .map(|s| s.to_ascii_lowercase()),
            admin_seed,
        })
    }
}

fn env_or(key: &str, default: &str) -> String {
    env::var(key)
        .ok()
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| default.to_string())
}

fn required(key: &str) -> Result<String> {
    env::var(key)
        .ok()
        .filter(|v| !v.is_empty())
        .with_context(|| format!("missing required env var {key}"))
}
