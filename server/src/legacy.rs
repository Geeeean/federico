//! One-way copy of the data from the old Next.js/Prisma Postgres database.
//!
//! Safe to run any number of times: a row is only inserted when an identical
//! row isn't already in SQLite, so repeated runs never duplicate anything and
//! rows that arrived in Postgres between runs are picked up. Nothing is ever
//! written to Postgres (the session is read-only).

use anyhow::{bail, Context, Result};
use sqlx::{postgres::PgPoolOptions, Executor, PgPool, Row, SqlitePool};

#[derive(Debug, Default, PartialEq, Eq)]
pub struct SyncReport {
    pub users_added: u64,
    pub posts_added: u64,
    pub contacts_added: u64,
    pub legacy_counts: (i64, i64, i64),
}

pub async fn sync_from_url(sqlite: &SqlitePool, url: &str) -> Result<SyncReport> {
    let pg = PgPoolOptions::new()
        .max_connections(1)
        .acquire_timeout(std::time::Duration::from_secs(15))
        .after_connect(|conn, _| {
            Box::pin(async move {
                conn.execute("SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY")
                    .await?;
                Ok(())
            })
        })
        .connect(url)
        .await
        .context("connecting to the legacy Postgres database")?;
    let report = sync(sqlite, &pg).await;
    pg.close().await;
    report
}

pub async fn sync(sqlite: &SqlitePool, pg: &PgPool) -> Result<SyncReport> {
    // `checked` is a timestamp without time zone holding UTC (Prisma's convention),
    // so format it in SQL instead of letting a client library guess a time zone.
    let users = sqlx::query(r#"SELECT username, password FROM "User" ORDER BY username"#)
        .fetch_all(pg)
        .await?;
    let posts = sqlx::query(r#"SELECT id, title, description, link FROM "Post" ORDER BY id"#)
        .fetch_all(pg)
        .await?;
    let contacts = sqlx::query(
        r#"SELECT id, name, email, telephone, description, viewed,
                  to_char(checked, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at
           FROM "ContactForm" ORDER BY id"#,
    )
    .fetch_all(pg)
    .await?;

    let mut report = SyncReport {
        legacy_counts: (
            users.len() as i64,
            posts.len() as i64,
            contacts.len() as i64,
        ),
        ..Default::default()
    };

    let mut tx = sqlite.begin().await?;

    for u in &users {
        let username: String = u.try_get("username")?;
        let hash: String = u.try_get("password")?;
        if !hash.starts_with("$2") {
            bail!("legacy user {username} has no bcrypt hash");
        }
        // Never overwrite a user (and password) that already exists here.
        let res =
            sqlx::query("INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)")
                .bind(&username)
                .bind(&hash)
                .execute(&mut *tx)
                .await?;
        report.users_added += res.rows_affected();
    }

    for p in &posts {
        let id: i32 = p.try_get("id")?;
        let title: String = p.try_get("title")?;
        let description: String = p.try_get("description")?;
        let link: String = p.try_get("link")?;
        let exists: Option<i64> = sqlx::query_scalar(
            "SELECT id FROM posts WHERE title = ? AND description = ? AND link = ?",
        )
        .bind(&title)
        .bind(&description)
        .bind(&link)
        .fetch_optional(&mut *tx)
        .await?;
        if exists.is_some() {
            continue;
        }
        insert_keeping_id(
            &mut tx,
            "posts",
            id,
            "INSERT INTO posts (id, title, description, link) VALUES (?, ?, ?, ?)",
            "INSERT INTO posts (title, description, link) VALUES (?, ?, ?)",
            &[&title, &description, &link],
        )
        .await?;
        report.posts_added += 1;
    }

    for c in &contacts {
        let id: i32 = c.try_get("id")?;
        let name: String = c.try_get("name")?;
        let email: String = c.try_get("email")?;
        let telephone: String = c.try_get("telephone")?;
        let description: Option<String> = c.try_get("description")?;
        let viewed: bool = c.try_get("viewed")?;
        let created_at: String = c.try_get("created_at")?;

        let exists: Option<i64> = sqlx::query_scalar(
            "SELECT id FROM contact_forms WHERE name = ? AND email = ? AND telephone = ?
             AND description IS ? AND created_at = ?",
        )
        .bind(&name)
        .bind(&email)
        .bind(&telephone)
        .bind(&description)
        .bind(&created_at)
        .fetch_optional(&mut *tx)
        .await?;
        if exists.is_some() {
            continue;
        }
        // Keep the old id when it's free; if the new site already used it
        // (a message arrived on both during the switch), take a new one.
        let free: bool = sqlx::query_scalar("SELECT count(*) = 0 FROM contact_forms WHERE id = ?")
            .bind(id)
            .fetch_one(&mut *tx)
            .await?;
        let q = if free {
            sqlx::query(
                "INSERT INTO contact_forms (id, name, email, telephone, description, viewed, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(id)
        } else {
            sqlx::query(
                "INSERT INTO contact_forms (name, email, telephone, description, viewed, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)",
            )
        };
        q.bind(&name)
            .bind(&email)
            .bind(&telephone)
            .bind(&description)
            .bind(viewed)
            .bind(&created_at)
            .execute(&mut *tx)
            .await
            .with_context(|| format!("copying contact form {id}"))?;
        report.contacts_added += 1;
    }

    tx.commit().await?;
    Ok(report)
}

async fn insert_keeping_id(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    table: &str,
    id: i32,
    with_id: &str,
    without_id: &str,
    values: &[&String],
) -> Result<()> {
    let free: bool = sqlx::query_scalar(&format!("SELECT count(*) = 0 FROM {table} WHERE id = ?"))
        .bind(id)
        .fetch_one(&mut **tx)
        .await?;
    let mut q = if free {
        sqlx::query(with_id).bind(id)
    } else {
        sqlx::query(without_id)
    };
    for v in values {
        q = q.bind(*v);
    }
    q.execute(&mut **tx).await?;
    Ok(())
}
