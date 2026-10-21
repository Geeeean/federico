# Studio Legale Federico - Website

Website for **Studio Legale Federico & Partners**: a public landing page plus a small admin panel to publish news and read contact form requests.

## How it's built

| Part | Folder | What it is |
|---|---|---|
| Frontend | `app/`, `components/` | Next.js, built as a **static export** (`out/`). Next only runs at build time. |
| Backend | `server/` | Rust ([axum](https://github.com/tokio-rs/axum)) binary that serves `out/` and the `/api` routes. |
| Database | file on disk | SQLite (`DATABASE_PATH`), migrations in `server/migrations/`. |

In production the whole site is one ~7 MB binary using about 10 MB of RAM.

### Security measures
- Admin sessions: random 256-bit token in an `HttpOnly`, `Secure`, `SameSite=Strict` `__Host-` cookie; only its SHA-256 is stored. Sessions expire (`SESSION_TTL_HOURS`) and end on logout or password change.
- Passwords: bcrypt. Login runs bcrypt even for unknown usernames (uniform timing) and is rate limited per IP and per username.
- Writes require `Content-Type: application/json` and an `Origin` equal to `ALLOWED_ORIGIN` (CSRF).
- Inputs are length-limited and validated; unknown JSON fields are rejected; news links must be `http(s)`.
- Contact form: reCAPTCHA v3 (score + action checked), rate limited per IP.
- `/dashboard*` pages redirect to `/login` without a session; the API checks the session on every admin call.
- Strict security headers (CSP, HSTS, `frame-ancestors 'none'`, nosniff, ...), 32 KB request limit, 20 s timeout.
- Runtime image is distroless and runs as a non-root user.

## Local development

```sh
npm ci
npm run build                      # -> out/

cd server
ALLOWED_ORIGIN=http://localhost:8080 COOKIE_SECURE=false \
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe \
SYS_ADMIN_USERNAME=admin SYS_ADMIN_PASSWORD=change-me-locally \
STATIC_DIR=../out cargo run
```
Then open http://localhost:8080. (`6LeIxAc...` is Google's public reCAPTCHA test secret, which accepts any token.)

## Configuration (environment variables)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ALLOWED_ORIGIN` | yes | | e.g. `https://www.studiolegalefederico.eu` |
| `RECAPTCHA_SECRET` | yes | | reCAPTCHA secret key |
| `RECAPTCHA_MIN_SCORE` | | `0.3` | lower = fewer real clients blocked, more spam |
| `DATABASE_PATH` | | `./data/app.db` | `/data/app.db` in Docker |
| `STATIC_DIR` | | `./out` | |
| `PORT` / `BIND_HOST` | | `8080` / `0.0.0.0` | |
| `COOKIE_SECURE` | | `true` | `false` only for http://localhost |
| `SESSION_TTL_HOURS` | | `12` | 1 to 168 |
| `CLIENT_IP_HEADER` | | | header with the real client IP behind a proxy, e.g. `x-real-ip` |
| `LEGACY_DATABASE_URL` | | | only for the manual `sync-legacy` command (old Postgres DB) |
| `SYS_ADMIN_USERNAME` / `SYS_ADMIN_PASSWORD` | | | creates the admin on first start if missing; never overwrites |

The frontend's public reCAPTCHA site key is in `.env.production`.

## Admin tasks

```sh
# change the admin password (ends all their sessions)
echo 'new long password' | federico-server set-password <username>

# one-off import from the old Postgres export (refuses a non-empty DB)
federico-server import export.json
```

## Tests

```sh
cd server && cargo test            # API + security tests (in-memory DB)
# migration tests need a Postgres: LEGACY_TEST_DATABASE_URL=postgres://... cargo test --test legacy
npx playwright test                # browser tests, against a running server on :8081
```
CI (`.github/workflows/ci.yml`) runs rustfmt, clippy, the Rust tests, `cargo audit`, the TypeScript check, `npm audit`, the static build, the browser tests on desktop and mobile, and a Docker build, on every PR and weekly.

## Deploy & operations

- Railway deploys `master` only after GitHub CI passes ("wait for CI" is on).
- The service has a volume at `/data`, so Railway stops the old container before starting the new one: expect a few seconds of downtime per deploy. `/healthz` checks the database, so a deploy that can't use it is never marked healthy.
- Backups of the `/data` volume: daily (kept 6 days) and weekly (kept 27 days), plus a manual one taken right after the migration. Restore from the volume's Backups tab in Railway.
- Railway ignores `railway.json`; build/start settings live in the service settings (Dockerfile, no custom start command, health check `/healthz`).


`docker build .` produces the production image. On Railway: attach a volume at `/data` and set the variables above.
