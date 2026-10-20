//! Input validation helpers. Everything user-supplied is trimmed, length-capped
//! and checked before it reaches the database.

use crate::error::AppError;

pub fn text(value: &str, max_chars: usize, field_err: &'static str) -> Result<String, AppError> {
    let v = value.trim();
    if v.is_empty() || v.chars().count() > max_chars || has_control_chars(v, false) {
        return Err(AppError::BadRequest(field_err));
    }
    Ok(v.to_string())
}

/// Like `text`, but allows newlines/tabs and may be empty (returns None).
pub fn multiline_opt(
    value: Option<&str>,
    max_chars: usize,
    field_err: &'static str,
) -> Result<Option<String>, AppError> {
    let v = value.unwrap_or("").trim();
    if v.is_empty() {
        return Ok(None);
    }
    if v.chars().count() > max_chars || has_control_chars(v, true) {
        return Err(AppError::BadRequest(field_err));
    }
    Ok(Some(v.to_string()))
}

pub fn multiline(
    value: &str,
    max_chars: usize,
    field_err: &'static str,
) -> Result<String, AppError> {
    multiline_opt(Some(value), max_chars, field_err)?.ok_or(AppError::BadRequest(field_err))
}

fn has_control_chars(v: &str, allow_newlines: bool) -> bool {
    v.chars()
        .any(|c| c.is_control() && !(allow_newlines && matches!(c, '\n' | '\r' | '\t')))
}

pub fn email(value: &str) -> Result<String, AppError> {
    const ERR: &str = "Invalid email";
    let v = text(value, 254, ERR)?;
    let (local, domain) = v.split_once('@').ok_or(AppError::BadRequest(ERR))?;
    if local.is_empty()
        || domain.len() < 3
        || !domain.contains('.')
        || domain.contains('@')
        || v.chars().any(char::is_whitespace)
    {
        return Err(AppError::BadRequest(ERR));
    }
    Ok(v)
}

pub fn telephone(value: &str) -> Result<String, AppError> {
    const ERR: &str = "Invalid telephone";
    let v = text(value, 40, ERR)?;
    let digits = v.chars().filter(char::is_ascii_digit).count();
    if digits < 5
        || !v
            .chars()
            .all(|c| c.is_ascii_digit() || " +-()./".contains(c))
    {
        return Err(AppError::BadRequest(ERR));
    }
    Ok(v)
}

/// Only absolute http(s) links: blocks `javascript:`, `data:` and similar,
/// since the link is rendered as an <a href> on the public page.
pub fn http_url(value: &str) -> Result<String, AppError> {
    const ERR: &str = "Invalid link";
    let v = text(value, 2000, ERR)?;
    let parsed = url::Url::parse(&v).map_err(|_| AppError::BadRequest(ERR))?;
    if !matches!(parsed.scheme(), "http" | "https") || parsed.host_str().is_none() {
        return Err(AppError::BadRequest(ERR));
    }
    Ok(parsed.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn urls() {
        assert!(http_url("https://example.com/a?b=c").is_ok());
        assert!(http_url("  http://example.com ").is_ok());
        for bad in [
            "javascript:alert(1)",
            "JaVaScRiPt:alert(1)",
            "data:text/html,x",
            "/relative",
            "ftp://x.com",
            "https://",
            "vbscript:x",
            "",
        ] {
            assert!(http_url(bad).is_err(), "{bad} should be rejected");
        }
    }

    #[test]
    fn emails() {
        assert!(email("mario.rossi@gmail.com").is_ok());
        for bad in ["", "no-at", "@x.com", "a@b", "a b@c.com", "a@b@c.com"] {
            assert!(email(bad).is_err(), "{bad} should be rejected");
        }
    }

    #[test]
    fn phones() {
        assert!(telephone("+39 351 007 7615").is_ok());
        assert!(telephone("(06) 123-4567").is_ok());
        for bad in ["", "123", "call me", "+39 <script>"] {
            assert!(telephone(bad).is_err(), "{bad} should be rejected");
        }
    }

    #[test]
    fn text_limits() {
        assert!(text("ok", 5, "e").is_ok());
        assert!(text("toolong", 5, "e").is_err());
        assert!(text("   ", 5, "e").is_err());
        assert!(text("a\u{0000}b", 5, "e").is_err());
        assert!(text("a\nb", 5, "e").is_err());
        assert_eq!(
            multiline_opt(Some("a\nb"), 5, "e").unwrap().as_deref(),
            Some("a\nb")
        );
        assert_eq!(multiline_opt(None, 5, "e").unwrap(), None);
        assert_eq!(
            text("àèìòù", 5, "e").unwrap(),
            "àèìòù",
            "counts chars, not bytes"
        );
    }
}
