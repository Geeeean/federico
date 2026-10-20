use std::{net::SocketAddr, sync::Arc};

use anyhow::{bail, Context, Result};
use federico_server::{app, auth, captcha::Recaptcha, config::Config, db, import};
use tokio::io::AsyncBufReadExt;
use tracing_subscriber::EnvFilter;

const USAGE: &str = "usage:
  federico-server                        start the web server
  federico-server import <file.json>     import data exported from the old database
  federico-server set-password <user>    set an admin password (read from stdin) and end their sessions";

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info,tower_http=info,sqlx=warn")),
        )
        .init();

    let args: Vec<String> = std::env::args().skip(1).collect();
    match args
        .iter()
        .map(String::as_str)
        .collect::<Vec<_>>()
        .as_slice()
    {
        [] | ["serve"] => serve().await,
        ["import", file] => {
            let pool = db::connect(&database_path()).await?;
            let raw = std::fs::read_to_string(file).with_context(|| format!("reading {file}"))?;
            let (u, p, c) = import::run(&pool, serde_json::from_str(&raw)?).await?;
            println!("imported {u} users, {p} posts, {c} contact forms");
            Ok(())
        }
        ["set-password", user] => {
            let mut line = String::new();
            eprintln!("new password for {user} (input is read from stdin):");
            tokio::io::BufReader::new(tokio::io::stdin())
                .read_line(&mut line)
                .await?;
            let password = line.trim_end_matches(['\r', '\n']);
            if password.chars().count() < 12 {
                bail!("password must be at least 12 characters");
            }
            let pool = db::connect(&database_path()).await?;
            auth::set_password(&pool, user, password).await?;
            println!("password updated, existing sessions ended");
            Ok(())
        }
        _ => bail!("{USAGE}"),
    }
}

fn database_path() -> std::path::PathBuf {
    std::env::var("DATABASE_PATH")
        .ok()
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "./data/app.db".into())
        .into()
}

async fn serve() -> Result<()> {
    let config = Config::from_env()?;
    if !config.static_dir.join("index.html").is_file() {
        tracing::warn!(dir = %config.static_dir.display(), "static dir has no index.html, did you build the frontend?");
    }
    let pool = db::connect(&config.database_path).await?;

    if let Some((user, pass)) = &config.admin_seed {
        if auth::seed_admin(&pool, user, pass).await? {
            tracing::info!("created admin user from SYS_ADMIN_USERNAME");
        }
    }

    let captcha = Arc::new(Recaptcha::new(
        config.recaptcha_secret.clone(),
        config.recaptcha_min_score,
    )?);
    let bind = config.bind;
    let state = app::AppState::new(pool.clone(), config, captcha).await?;
    let router = app::router(state);

    let listener = tokio::net::TcpListener::bind(bind).await?;
    tracing::info!(%bind, "listening");
    axum::serve(
        listener,
        router.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;
    pool.close().await;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        let _ = tokio::signal::ctrl_c().await;
    };
    #[cfg(unix)]
    let term = async {
        if let Ok(mut s) = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        {
            s.recv().await;
        }
    };
    #[cfg(not(unix))]
    let term = std::future::pending::<()>();
    tokio::select! { _ = ctrl_c => {}, _ = term => {} }
    tracing::info!("shutting down");
}
