use std::{future::Future, pin::Pin, time::Duration};

use anyhow::Result;
use serde::Deserialize;

pub type BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;

/// Verifies a reCAPTCHA token. A trait so tests can swap in a fake.
pub trait CaptchaVerifier: Send + Sync {
    /// Returns Ok(true) only when the token is valid for the contact form.
    fn verify<'a>(&'a self, token: &'a str, client_ip: &'a str) -> BoxFuture<'a, Result<bool>>;
}

pub const EXPECTED_ACTION: &str = "form_submit";

pub struct Recaptcha {
    http: reqwest::Client,
    secret: String,
    min_score: f64,
}

impl Recaptcha {
    pub fn new(secret: String, min_score: f64) -> Result<Self> {
        let http = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()?;
        Ok(Self {
            http,
            secret,
            min_score,
        })
    }
}

#[derive(Deserialize, Debug)]
pub struct SiteVerifyResponse {
    pub success: bool,
    pub score: Option<f64>,
    pub action: Option<String>,
    #[serde(rename = "error-codes", default)]
    pub error_codes: Vec<String>,
}

/// Pure decision logic, unit-tested separately from the HTTP call.
pub fn accept(res: &SiteVerifyResponse, min_score: f64) -> bool {
    if !res.success {
        return false;
    }
    // v3 tokens carry a score and an action; enforce them when present.
    if let Some(score) = res.score {
        if score < min_score {
            return false;
        }
    }
    if let Some(action) = &res.action {
        if action != EXPECTED_ACTION {
            return false;
        }
    }
    true
}

impl CaptchaVerifier for Recaptcha {
    fn verify<'a>(&'a self, token: &'a str, client_ip: &'a str) -> BoxFuture<'a, Result<bool>> {
        Box::pin(async move {
            let res: SiteVerifyResponse = self
                .http
                .post("https://www.google.com/recaptcha/api/siteverify")
                .form(&[
                    ("secret", self.secret.as_str()),
                    ("response", token),
                    ("remoteip", client_ip),
                ])
                .send()
                .await?
                .error_for_status()?
                .json()
                .await?;
            let ok = accept(&res, self.min_score);
            if !ok {
                tracing::info!(score = ?res.score, action = ?res.action, errors = ?res.error_codes, "captcha rejected");
            }
            Ok(ok)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn res(success: bool, score: Option<f64>, action: Option<&str>) -> SiteVerifyResponse {
        SiteVerifyResponse {
            success,
            score,
            action: action.map(String::from),
            error_codes: vec![],
        }
    }

    #[test]
    fn decision() {
        assert!(!accept(&res(false, Some(0.9), Some("form_submit")), 0.5));
        assert!(accept(&res(true, Some(0.9), Some("form_submit")), 0.5));
        assert!(!accept(&res(true, Some(0.1), Some("form_submit")), 0.5));
        assert!(!accept(&res(true, Some(0.9), Some("login")), 0.5));
        assert!(accept(&res(true, None, None), 0.5));
    }
}
