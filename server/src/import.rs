//! One-off import of the data exported from the old Postgres database.
//!
//! Expected JSON: { "users": [{username, password}], "posts": [{id, title, description, link}],
//!                  "contactForms": [{id, name, email, telephone, description, viewed, checked}] }
//! `password` is the existing bcrypt hash, so current admin credentials keep working.

use anyhow::{bail, Context, Result};
use serde::Deserialize;
use sqlx::SqlitePool;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Export {
    #[serde(default)]
    pub users: Vec<User>,
    #[serde(default)]
    pub posts: Vec<Post>,
    #[serde(default)]
    pub contact_forms: Vec<Contact>,
}

#[derive(Deserialize)]
pub struct User {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct Post {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub link: String,
}

#[derive(Deserialize)]
pub struct Contact {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub telephone: String,
    pub description: Option<String>,
    pub viewed: bool,
    pub checked: String,
}

/// Imports everything in one transaction. Refuses to run on a non-empty database.
pub async fn run(db: &SqlitePool, data: Export) -> Result<(usize, usize, usize)> {
    let mut tx = db.begin().await?;
    let existing: i64 = sqlx::query_scalar("SELECT (SELECT count(*) FROM users) + (SELECT count(*) FROM posts) + (SELECT count(*) FROM contact_forms)")
        .fetch_one(&mut *tx)
        .await?;
    if existing > 0 {
        bail!("database is not empty, refusing to import");
    }
    for u in &data.users {
        if !u.password.starts_with("$2") {
            bail!("user {} has no bcrypt hash", u.username);
        }
        sqlx::query("INSERT INTO users (username, password_hash) VALUES (?, ?)")
            .bind(&u.username)
            .bind(&u.password)
            .execute(&mut *tx)
            .await?;
    }
    for p in &data.posts {
        sqlx::query("INSERT INTO posts (id, title, description, link) VALUES (?, ?, ?, ?)")
            .bind(p.id)
            .bind(&p.title)
            .bind(&p.description)
            .bind(&p.link)
            .execute(&mut *tx)
            .await
            .with_context(|| format!("post {}", p.id))?;
    }
    for c in &data.contact_forms {
        sqlx::query("INSERT INTO contact_forms (id, name, email, telephone, description, viewed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(c.id)
            .bind(&c.name)
            .bind(&c.email)
            .bind(&c.telephone)
            .bind(&c.description)
            .bind(c.viewed)
            .bind(&c.checked)
            .execute(&mut *tx)
            .await
            .with_context(|| format!("contact {}", c.id))?;
    }
    tx.commit().await?;
    Ok((data.users.len(), data.posts.len(), data.contact_forms.len()))
}
