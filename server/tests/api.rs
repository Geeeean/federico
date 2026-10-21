//! End-to-end tests of the HTTP API and static serving, run against an
//! in-memory SQLite database and a fake reCAPTCHA verifier.

use std::{
    path::Path,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::Duration,
};

use axum::{
    body::Body,
    http::{header, Method, Request, StatusCode},
    Router,
};
use federico_server::{
    app::{router, AppState},
    auth,
    captcha::{BoxFuture, CaptchaVerifier},
    config::Config,
    db, import,
};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use tower::ServiceExt;

const ORIGIN: &str = "https://www.example.test";
const ADMIN: &str = "admin";
const PASSWORD: &str = "correct horse battery staple";

struct FakeCaptcha(AtomicBool);

impl CaptchaVerifier for FakeCaptcha {
    fn verify<'a>(&'a self, token: &'a str, _ip: &'a str) -> BoxFuture<'a, anyhow::Result<bool>> {
        let ok = self.0.load(Ordering::SeqCst) && token == "good-token";
        Box::pin(async move { Ok(ok) })
    }
}

struct TestApp {
    router: Router,
    state: AppState,
    captcha: Arc<FakeCaptcha>,
    _static: tempfile::TempDir,
}

fn write(dir: &Path, rel: &str, body: &str) {
    let p = dir.join(rel);
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, body).unwrap();
}

async fn setup_with(ttl: Duration) -> TestApp {
    let static_dir = tempfile::tempdir().unwrap();
    let d = static_dir.path();
    write(d, "index.html", "HOME");
    write(d, "privacy.html", "PRIVACY");
    write(d, "login.html", "LOGIN");
    write(d, "dashboard.html", "DASHBOARD");
    write(d, "dashboard/modals.html", "MODALS");
    write(d, "404.html", "NOT FOUND PAGE");
    write(d, "_next/static/chunks/app.js", "js");

    let config = Config {
        bind: "127.0.0.1:0".parse().unwrap(),
        database_path: ":memory:".into(),
        static_dir: d.to_path_buf(),
        allowed_origin: ORIGIN.into(),
        cookie_secure: true,
        session_ttl: ttl,
        recaptcha_secret: "unused".into(),
        recaptcha_min_score: 0.5,
        client_ip_header: Some("x-real-ip".into()),
        admin_seed: None,
    };
    let pool = db::connect_memory().await.unwrap();
    auth::seed_admin(&pool, ADMIN, PASSWORD).await.unwrap();
    let captcha = Arc::new(FakeCaptcha(AtomicBool::new(true)));
    let state = AppState::new(pool, config, captcha.clone()).await.unwrap();
    TestApp {
        router: router(state.clone()),
        state,
        captcha,
        _static: static_dir,
    }
}

async fn setup() -> TestApp {
    setup_with(Duration::from_secs(3600)).await
}

struct Res {
    status: StatusCode,
    headers: axum::http::HeaderMap,
    body: String,
}

impl Res {
    fn json(&self) -> Value {
        serde_json::from_str(&self.body).unwrap_or_else(|_| panic!("not json: {}", self.body))
    }
}

impl TestApp {
    async fn send(&self, req: Request<Body>) -> Res {
        let res = self.router.clone().oneshot(req).await.unwrap();
        let status = res.status();
        let headers = res.headers().clone();
        let bytes = res.into_body().collect().await.unwrap().to_bytes();
        Res {
            status,
            headers,
            body: String::from_utf8_lossy(&bytes).into_owned(),
        }
    }

    async fn get(&self, path: &str, cookie: Option<&str>) -> Res {
        let mut b = Request::get(path);
        if let Some(c) = cookie {
            b = b.header(header::COOKIE, c);
        }
        self.send(b.body(Body::empty()).unwrap()).await
    }

    async fn post(&self, path: &str, body: Value, cookie: Option<&str>) -> Res {
        self.post_from(path, body, cookie, "203.0.113.1").await
    }

    async fn post_from(&self, path: &str, body: Value, cookie: Option<&str>, ip: &str) -> Res {
        let mut b = Request::post(path)
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::ORIGIN, ORIGIN)
            .header("x-real-ip", ip);
        if let Some(c) = cookie {
            b = b.header(header::COOKIE, c);
        }
        self.send(b.body(Body::from(body.to_string())).unwrap())
            .await
    }

    /// Logs in and returns the `name=value` cookie pair.
    async fn login(&self) -> String {
        let res = self
            .post(
                "/api/auth/login",
                json!({ "username": ADMIN, "password": PASSWORD }),
                None,
            )
            .await;
        assert_eq!(res.status, StatusCode::OK, "{}", res.body);
        let set_cookie = res
            .headers
            .get(header::SET_COOKIE)
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
        set_cookie.split(';').next().unwrap().to_string()
    }

    async fn count(&self, table: &str) -> i64 {
        sqlx::query_scalar(&format!("SELECT count(*) FROM {table}"))
            .fetch_one(&self.state.db)
            .await
            .unwrap()
    }
}

fn contact(overrides: Value) -> Value {
    let mut form = json!({
        "name": "Mario Rossi",
        "email": "mario.rossi@example.com",
        "telephone": "+39 351 000 0000",
        "description": "Buongiorno,\nvorrei una consulenza.",
        "terms": true
    });
    for (k, v) in overrides.as_object().unwrap() {
        form[k] = v.clone();
    }
    json!({ "data": { "formValues": form }, "token": "good-token" })
}

// ---------------------------------------------------------------- general

#[tokio::test]
async fn health_and_security_headers() {
    let app = setup().await;
    let res = app.get("/healthz", None).await;
    assert_eq!(res.status, StatusCode::OK);
    for h in [
        "content-security-policy",
        "x-content-type-options",
        "x-frame-options",
        "referrer-policy",
        "strict-transport-security",
        "permissions-policy",
    ] {
        assert!(res.headers.contains_key(h), "missing {h}");
    }
    let csp = res.headers["content-security-policy"].to_str().unwrap();
    assert!(csp.contains("frame-ancestors 'none'") && csp.contains("object-src 'none'"));
}

#[tokio::test]
async fn api_responses_are_not_cached_and_unknown_routes_are_json_404() {
    let app = setup().await;
    let res = app.get("/api/posts/get/all", None).await;
    assert_eq!(res.headers[header::CACHE_CONTROL], "no-store");
    let res = app.get("/api/nope", None).await;
    assert_eq!(res.status, StatusCode::NOT_FOUND);
    assert_eq!(res.json()["error"], "Not found");
}

// ---------------------------------------------------------------- authorization

#[tokio::test]
async fn admin_endpoints_require_a_session() {
    let app = setup().await;
    let bogus = "__Host-session=".to_string() + &"a".repeat(64);
    for cookie in [
        None,
        Some(bogus.as_str()),
        Some("__Host-session=garbage"),
        Some("session=x"),
    ] {
        assert_eq!(
            app.get("/api/modals/get/all", cookie).await.status,
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            app.get("/api/auth/session", cookie).await.status,
            StatusCode::UNAUTHORIZED
        );
        for (path, body) in [
            (
                "/api/posts/add",
                json!({ "post": { "title": "t", "description": "d", "link": "https://x.com" } }),
            ),
            ("/api/posts/remove", json!({ "post": { "id": 1 } })),
            ("/api/modals/remove", json!({ "modal": { "id": 1 } })),
            (
                "/api/modals/toggle",
                json!({ "modal": { "id": 1, "newViewed": true } }),
            ),
        ] {
            let res = app.post(path, body, cookie).await;
            assert_eq!(
                res.status,
                StatusCode::UNAUTHORIZED,
                "{path} with {cookie:?}"
            );
        }
    }
    assert_eq!(app.count("posts").await, 0);
}

#[tokio::test]
async fn login_sets_a_hardened_cookie() {
    let app = setup().await;
    let res = app
        .post(
            "/api/auth/login",
            json!({ "username": ADMIN, "password": PASSWORD }),
            None,
        )
        .await;
    assert_eq!(res.status, StatusCode::OK);
    let c = res.headers[header::SET_COOKIE].to_str().unwrap();
    assert!(c.starts_with("__Host-session="), "{c}");
    for attr in [
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        "Path=/",
        "Max-Age=",
    ] {
        assert!(c.contains(attr), "missing {attr} in {c}");
    }
    assert!(!c.contains("Domain"), "__Host- cookies must not set Domain");
}

#[tokio::test]
async fn wrong_credentials_are_rejected_the_same_way() {
    let app = setup().await;
    for (u, p) in [
        (ADMIN, "wrong"),
        ("nobody", PASSWORD),
        ("' OR 1=1 --", "x"),
        ("", ""),
        (ADMIN, &"x".repeat(10_000)),
    ] {
        let res = app
            .post(
                "/api/auth/login",
                json!({ "username": u, "password": p }),
                None,
            )
            .await;
        assert!(
            matches!(
                res.status,
                StatusCode::UNAUTHORIZED | StatusCode::PAYLOAD_TOO_LARGE
            ),
            "{u}: {}",
            res.status
        );
        assert!(!res.headers.contains_key(header::SET_COOKIE));
    }
}

#[tokio::test]
async fn session_works_until_logout() {
    let app = setup().await;
    let cookie = app.login().await;
    let res = app.get("/api/auth/session", Some(&cookie)).await;
    assert_eq!(res.status, StatusCode::OK);
    assert_eq!(res.json()["username"], ADMIN);

    let res = app.post("/api/auth/logout", json!({}), Some(&cookie)).await;
    assert_eq!(res.status, StatusCode::OK);
    assert!(res.headers[header::SET_COOKIE]
        .to_str()
        .unwrap()
        .contains("Max-Age=0"));

    // The old cookie is dead server-side, even if a browser kept it.
    assert_eq!(
        app.get("/api/auth/session", Some(&cookie)).await.status,
        StatusCode::UNAUTHORIZED
    );
}

#[tokio::test]
async fn sessions_expire() {
    let app = setup_with(Duration::from_secs(1)).await;
    let cookie = app.login().await;
    assert_eq!(
        app.get("/api/auth/session", Some(&cookie)).await.status,
        StatusCode::OK
    );
    tokio::time::sleep(Duration::from_millis(2100)).await;
    assert_eq!(
        app.get("/api/auth/session", Some(&cookie)).await.status,
        StatusCode::UNAUTHORIZED
    );
}

#[tokio::test]
async fn changing_password_ends_sessions() {
    let app = setup().await;
    let cookie = app.login().await;
    auth::set_password(&app.state.db, ADMIN, "a brand new password")
        .await
        .unwrap();
    assert_eq!(
        app.get("/api/auth/session", Some(&cookie)).await.status,
        StatusCode::UNAUTHORIZED
    );
    let res = app
        .post(
            "/api/auth/login",
            json!({ "username": ADMIN, "password": PASSWORD }),
            None,
        )
        .await;
    assert_eq!(res.status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn login_is_rate_limited_per_ip() {
    let app = setup().await;
    for _ in 0..10 {
        let res = app
            .post_from(
                "/api/auth/login",
                json!({ "username": ADMIN, "password": "wrong" }),
                None,
                "198.51.100.7",
            )
            .await;
        assert_eq!(res.status, StatusCode::UNAUTHORIZED);
    }
    // Even the right password is refused once the IP is blocked.
    let res = app
        .post_from(
            "/api/auth/login",
            json!({ "username": ADMIN, "password": PASSWORD }),
            None,
            "198.51.100.7",
        )
        .await;
    assert_eq!(res.status, StatusCode::TOO_MANY_REQUESTS);
    // Another IP is unaffected.
    let res = app
        .post_from(
            "/api/auth/login",
            json!({ "username": ADMIN, "password": PASSWORD }),
            None,
            "198.51.100.8",
        )
        .await;
    assert_eq!(res.status, StatusCode::OK);
}

// ---------------------------------------------------------------- CSRF / request shape

#[tokio::test]
async fn cross_origin_and_non_json_posts_are_blocked() {
    let app = setup().await;
    let body = contact(json!({})).to_string();

    let no_origin = Request::post("/api/modals/submit")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(body.clone()))
        .unwrap();
    assert_eq!(app.send(no_origin).await.status, StatusCode::FORBIDDEN);

    let evil = Request::post("/api/modals/submit")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::ORIGIN, "https://evil.example")
        .body(Body::from(body.clone()))
        .unwrap();
    assert_eq!(app.send(evil).await.status, StatusCode::FORBIDDEN);

    let lookalike = Request::post("/api/modals/submit")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::ORIGIN, format!("{ORIGIN}.evil.example"))
        .body(Body::from(body.clone()))
        .unwrap();
    assert_eq!(app.send(lookalike).await.status, StatusCode::FORBIDDEN);

    // An HTML form can only send text/plain or urlencoded bodies.
    let form = Request::post("/api/modals/submit")
        .header(header::CONTENT_TYPE, "text/plain")
        .header(header::ORIGIN, ORIGIN)
        .body(Body::from(body))
        .unwrap();
    assert_eq!(
        app.send(form).await.status,
        StatusCode::UNSUPPORTED_MEDIA_TYPE
    );

    assert_eq!(app.count("contact_forms").await, 0);
}

#[tokio::test]
async fn oversized_bodies_are_rejected() {
    let app = setup().await;
    let res = app
        .post(
            "/api/modals/submit",
            contact(json!({ "description": "x".repeat(64 * 1024) })),
            None,
        )
        .await;
    assert_eq!(res.status, StatusCode::PAYLOAD_TOO_LARGE);
    assert_eq!(app.count("contact_forms").await, 0);
}

#[tokio::test]
async fn malformed_json_is_a_clean_400() {
    let app = setup().await;
    let req = Request::post("/api/modals/submit")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::ORIGIN, ORIGIN)
        .body(Body::from("{not json"))
        .unwrap();
    let res = app.send(req).await;
    assert_eq!(res.status, StatusCode::BAD_REQUEST);
    assert_eq!(res.json()["error"], "Bad syntax");
}

// ---------------------------------------------------------------- contact form

#[tokio::test]
async fn contact_form_is_stored_as_unread() {
    let app = setup().await;
    let res = app
        .post("/api/modals/submit", contact(json!({})), None)
        .await;
    assert_eq!(res.status, StatusCode::OK, "{}", res.body);

    let cookie = app.login().await;
    let modals = app.get("/api/modals/get/all", Some(&cookie)).await.json();
    let m = &modals["modals"][0];
    assert_eq!(m["name"], "Mario Rossi");
    assert_eq!(m["viewed"], false);
    assert_eq!(m["description"], "Buongiorno,\nvorrei una consulenza.");
    assert!(
        m["checked"].as_str().unwrap().ends_with('Z'),
        "ISO timestamp expected"
    );
}

#[tokio::test]
async fn contact_form_rejects_extra_fields() {
    // The old Next.js route wrote the client's object straight into the DB.
    let app = setup().await;
    for extra in [
        json!({ "viewed": true }),
        json!({ "id": 999 }),
        json!({ "checked": "2020-01-01T00:00:00Z" }),
    ] {
        let res = app
            .post("/api/modals/submit", contact(extra.clone()), None)
            .await;
        assert_eq!(res.status, StatusCode::BAD_REQUEST, "{extra}");
    }
    let mut body = contact(json!({}));
    body["isAdmin"] = json!(true);
    assert_eq!(
        app.post("/api/modals/submit", body, None).await.status,
        StatusCode::BAD_REQUEST
    );
    assert_eq!(app.count("contact_forms").await, 0);
}

#[tokio::test]
async fn contact_form_validates_input() {
    let app = setup().await;
    for bad in [
        json!({ "terms": false }),
        json!({ "name": "" }),
        json!({ "name": "   " }),
        json!({ "name": "x".repeat(201) }),
        json!({ "email": "not-an-email" }),
        json!({ "telephone": "abc" }),
        json!({ "name": "evil\u{0000}" }),
        json!({ "description": "x".repeat(5001) }),
    ] {
        let res = app
            .post_from(
                "/api/modals/submit",
                contact(bad.clone()),
                None,
                &format!("192.0.2.{}", bad.to_string().len() % 250),
            )
            .await;
        assert_eq!(res.status, StatusCode::BAD_REQUEST, "{bad}: {}", res.body);
    }
    let mut missing = contact(json!({}));
    missing["data"]["formValues"]
        .as_object_mut()
        .unwrap()
        .remove("email");
    assert_eq!(
        app.post_from("/api/modals/submit", missing, None, "192.0.2.251")
            .await
            .status,
        StatusCode::BAD_REQUEST
    );
    assert_eq!(app.count("contact_forms").await, 0);
}

#[tokio::test]
async fn contact_form_requires_a_valid_captcha() {
    let app = setup().await;
    let mut wrong = contact(json!({}));
    wrong["token"] = json!("bad-token");
    assert_eq!(
        app.post("/api/modals/submit", wrong, None).await.status,
        StatusCode::FORBIDDEN
    );

    let mut empty = contact(json!({}));
    empty["token"] = json!("");
    assert_eq!(
        app.post("/api/modals/submit", empty, None).await.status,
        StatusCode::FORBIDDEN
    );

    app.captcha.0.store(false, Ordering::SeqCst);
    assert_eq!(
        app.post("/api/modals/submit", contact(json!({})), None)
            .await
            .status,
        StatusCode::FORBIDDEN
    );
    assert_eq!(app.count("contact_forms").await, 0);
}

#[tokio::test]
async fn contact_form_is_rate_limited() {
    let app = setup().await;
    for _ in 0..5 {
        assert_eq!(
            app.post("/api/modals/submit", contact(json!({})), None)
                .await
                .status,
            StatusCode::OK
        );
    }
    assert_eq!(
        app.post("/api/modals/submit", contact(json!({})), None)
            .await
            .status,
        StatusCode::TOO_MANY_REQUESTS
    );
    assert_eq!(app.count("contact_forms").await, 5);
}

#[tokio::test]
async fn admin_can_toggle_and_remove_messages() {
    let app = setup().await;
    app.post("/api/modals/submit", contact(json!({})), None)
        .await;
    let cookie = app.login().await;
    let id = app.get("/api/modals/get/all", Some(&cookie)).await.json()["modals"][0]["id"]
        .as_i64()
        .unwrap();

    let res = app
        .post(
            "/api/modals/toggle",
            json!({ "modal": { "id": id, "newViewed": true } }),
            Some(&cookie),
        )
        .await;
    assert_eq!(res.status, StatusCode::OK);
    assert_eq!(
        app.get("/api/modals/get/all", Some(&cookie)).await.json()["modals"][0]["viewed"],
        true
    );

    assert_eq!(
        app.post(
            "/api/modals/toggle",
            json!({ "modal": { "id": 999, "newViewed": true } }),
            Some(&cookie)
        )
        .await
        .status,
        StatusCode::NOT_FOUND
    );
    assert_eq!(
        app.post(
            "/api/modals/remove",
            json!({ "modal": { "id": id } }),
            Some(&cookie)
        )
        .await
        .status,
        StatusCode::OK
    );
    assert_eq!(
        app.post(
            "/api/modals/remove",
            json!({ "modal": { "id": id } }),
            Some(&cookie)
        )
        .await
        .status,
        StatusCode::NOT_FOUND
    );
    assert_eq!(app.count("contact_forms").await, 0);
}

// ---------------------------------------------------------------- posts

#[tokio::test]
async fn posts_crud() {
    let app = setup().await;
    let cookie = app.login().await;
    let res = app.post("/api/posts/add", json!({ "post": { "title": "Novità", "description": "Testo", "link": "https://example.com/a" } }), Some(&cookie)).await;
    assert_eq!(res.status, StatusCode::OK, "{}", res.body);
    let id = res.json()["posts"]["id"].as_i64().unwrap();

    // Public list needs no login.
    let list = app.get("/api/posts/get/all", None).await.json();
    assert_eq!(list["posts"][0]["title"], "Novità");

    assert_eq!(
        app.post(
            "/api/posts/remove",
            json!({ "post": { "id": id } }),
            Some(&cookie)
        )
        .await
        .status,
        StatusCode::OK
    );
    assert_eq!(
        app.post(
            "/api/posts/remove",
            json!({ "post": { "id": id } }),
            Some(&cookie)
        )
        .await
        .status,
        StatusCode::NOT_FOUND
    );
    assert_eq!(
        app.get("/api/posts/get/all", None).await.json()["posts"],
        json!([])
    );
}

#[tokio::test]
async fn posts_reject_dangerous_links_and_bad_input() {
    let app = setup().await;
    let cookie = app.login().await;
    for link in [
        "javascript:alert(document.cookie)",
        "data:text/html,<script>alert(1)</script>",
        "/relative",
        "  ",
        "vbscript:x",
    ] {
        let res = app
            .post(
                "/api/posts/add",
                json!({ "post": { "title": "t", "description": "d", "link": link } }),
                Some(&cookie),
            )
            .await;
        assert_eq!(res.status, StatusCode::BAD_REQUEST, "{link}");
    }
    for post in [
        json!({ "title": "", "description": "d", "link": "https://x.com" }),
        json!({ "title": "x".repeat(201), "description": "d", "link": "https://x.com" }),
        json!({ "title": "t", "description": "d", "link": "https://x.com", "id": 5 }),
    ] {
        assert_eq!(
            app.post("/api/posts/add", json!({ "post": post }), Some(&cookie))
                .await
                .status,
            StatusCode::BAD_REQUEST
        );
    }
    assert_eq!(app.count("posts").await, 0);
}

// ---------------------------------------------------------------- static files

#[tokio::test]
async fn static_pages_resolve_like_next() {
    let app = setup().await;
    assert_eq!(app.get("/", None).await.body, "HOME");
    assert_eq!(app.get("/privacy", None).await.body, "PRIVACY");
    assert_eq!(app.get("/privacy.html", None).await.body, "PRIVACY");
    assert_eq!(app.get("/login", None).await.body, "LOGIN");

    let missing = app.get("/does-not-exist", None).await;
    assert_eq!(missing.status, StatusCode::NOT_FOUND);
    assert_eq!(missing.body, "NOT FOUND PAGE");

    let js = app.get("/_next/static/chunks/app.js", None).await;
    assert_eq!(js.status, StatusCode::OK);
    assert!(js.headers[header::CACHE_CONTROL]
        .to_str()
        .unwrap()
        .contains("immutable"));
    assert_eq!(
        app.get("/", None).await.headers[header::CACHE_CONTROL],
        "no-cache"
    );
}

#[tokio::test]
async fn dashboard_pages_redirect_when_logged_out() {
    let app = setup().await;
    for path in [
        "/dashboard",
        "/dashboard/",
        "/dashboard/modals",
        "/dashboard.html",
        "/Dashboard",
        "/DASHBOARD/modals",
        "/%64ashboard",
        "/dashboard%2Fmodals",
    ] {
        let res = app.get(path, None).await;
        assert!(res.status.is_redirection(), "{path} gave {}", res.status);
        assert_eq!(res.headers[header::LOCATION], "/login", "{path}");
    }
    // Router prefetches get a 401, never a redirect that could be cached as the page.
    write(app._static.path(), "dashboard.txt", "RSC");
    for path in [
        "/dashboard.txt",
        "/dashboard?_rsc=abc",
        "/dashboard/__next._tree.txt",
    ] {
        let res = app.get(path, None).await;
        assert_eq!(res.status, StatusCode::UNAUTHORIZED, "{path}");
    }
    let rsc = Request::get("/dashboard")
        .header("rsc", "1")
        .body(Body::empty())
        .unwrap();
    assert_eq!(app.send(rsc).await.status, StatusCode::UNAUTHORIZED);

    let cookie = app.login().await;
    assert_eq!(app.get("/dashboard", Some(&cookie)).await.body, "DASHBOARD");
    assert_eq!(app.get("/dashboard.txt", Some(&cookie)).await.body, "RSC");
    assert_eq!(
        app.get("/dashboard/modals", Some(&cookie)).await.body,
        "MODALS"
    );
}

#[tokio::test]
async fn path_traversal_is_refused() {
    let app = setup().await;
    for path in [
        "/../Cargo.toml",
        "/..%2f..%2fetc%2fpasswd",
        "/%2e%2e/%2e%2e/etc/passwd",
        "/a/..%5c..%5cx",
        "/%00",
    ] {
        let res = app.get(path, None).await;
        assert!(
            matches!(res.status, StatusCode::BAD_REQUEST | StatusCode::NOT_FOUND),
            "{path} gave {}",
            res.status
        );
        assert!(!res.body.contains("[package]") && !res.body.contains("root:"));
    }
}

#[tokio::test]
async fn static_files_only_accept_get() {
    let app = setup().await;
    let req = Request::builder()
        .method(Method::DELETE)
        .uri("/")
        .body(Body::empty())
        .unwrap();
    assert_eq!(app.send(req).await.status, StatusCode::METHOD_NOT_ALLOWED);
}

// ---------------------------------------------------------------- import

#[tokio::test]
async fn import_keeps_existing_bcrypt_passwords() {
    let pool = db::connect_memory().await.unwrap();
    let legacy_hash = bcrypt::hash("legacy password", 10).unwrap();
    let data: import::Export = serde_json::from_value(json!({
        "users": [{ "username": "federico", "password": legacy_hash }],
        "posts": [{ "id": 16, "title": "a", "description": "b", "link": "https://x.com" }],
        "contactForms": [{ "id": 11, "name": "n", "email": "e@x.com", "telephone": "123456", "description": null, "viewed": false, "checked": "2026-08-20T03:47:18.523Z" }]
    }))
    .unwrap();
    assert_eq!(import::run(&pool, data).await.unwrap(), (1, 1, 1));

    let id: i64 = sqlx::query_scalar("SELECT id FROM contact_forms")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(id, 11, "ids are preserved");
    let hash: String = sqlx::query_scalar("SELECT password_hash FROM users")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert!(bcrypt::verify("legacy password", &hash).unwrap());

    // A second import must not duplicate or overwrite anything.
    let again: import::Export = serde_json::from_value(json!({ "posts": [{ "id": 1, "title": "a", "description": "b", "link": "https://x.com" }] })).unwrap();
    assert!(import::run(&pool, again).await.is_err());
}

#[tokio::test]
async fn successful_logins_do_not_count_towards_the_limit() {
    let app = setup().await;
    for _ in 0..15 {
        app.login().await;
    }
    // Failures still accumulate after that.
    for _ in 0..10 {
        let res = app
            .post(
                "/api/auth/login",
                json!({ "username": ADMIN, "password": "wrong" }),
                None,
            )
            .await;
        assert_eq!(res.status, StatusCode::UNAUTHORIZED);
    }
    let res = app
        .post(
            "/api/auth/login",
            json!({ "username": ADMIN, "password": PASSWORD }),
            None,
        )
        .await;
    assert_eq!(res.status, StatusCode::TOO_MANY_REQUESTS);
}

#[tokio::test]
async fn public_images_are_cached_for_a_day_but_pages_are_not() {
    let app = setup().await;
    write(app._static.path(), "hero-640.webp", "img");
    let img = app.get("/hero-640.webp", None).await;
    assert_eq!(img.headers[header::CACHE_CONTROL], "public, max-age=86400");
    assert_eq!(
        app.get("/", None).await.headers[header::CACHE_CONTROL],
        "no-cache"
    );
    assert_eq!(
        app.get("/missing.webp", None).await.headers[header::CACHE_CONTROL],
        "no-cache"
    );
}
