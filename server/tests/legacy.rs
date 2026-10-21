//! Tests for the Postgres -> SQLite migration against a real Postgres.
//! Set LEGACY_TEST_DATABASE_URL (CI does); skipped otherwise.

use federico_server::{auth, db, legacy};
use sqlx::{postgres::PgPoolOptions, Executor, PgPool, Row, SqlitePool};

/// The old Prisma schema as it exists in production.
const PRISMA_SCHEMA: &str = r#"
CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "username" TEXT NOT NULL UNIQUE, "password" TEXT NOT NULL);
CREATE TABLE "Post" ("id" SERIAL PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL, "link" TEXT NOT NULL);
CREATE TABLE "ContactForm" (
    "id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "telephone" TEXT NOT NULL,
    "description" TEXT, "viewed" BOOLEAN NOT NULL DEFAULT false,
    "checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
"#;

/// Fresh schema per test so tests can run in parallel on one server.
async fn legacy_db() -> Option<(PgPool, String)> {
    let Ok(base) = std::env::var("LEGACY_TEST_DATABASE_URL") else {
        eprintln!("LEGACY_TEST_DATABASE_URL not set, skipping");
        return None;
    };
    let schema = format!("t{}", hex::encode(rand_bytes()));
    let admin = PgPoolOptions::new()
        .max_connections(1)
        .connect(&base)
        .await
        .unwrap();
    admin
        .execute(format!("CREATE SCHEMA {schema}").as_str())
        .await
        .unwrap();
    admin.close().await;

    let sep = if base.contains('?') { '&' } else { '?' };
    let url = format!("{base}{sep}options=-c%20search_path%3D{schema}");
    let pg = PgPoolOptions::new()
        .max_connections(1)
        .connect(&url)
        .await
        .unwrap();
    pg.execute(PRISMA_SCHEMA).await.unwrap();
    Some((pg, url))
}

fn rand_bytes() -> [u8; 6] {
    let mut b = [0u8; 6];
    getrandom::fill(&mut b).unwrap();
    b
}

async fn seed(pg: &PgPool) {
    let hash = bcrypt::hash("the real admin password", 4).unwrap();
    sqlx::query(r#"INSERT INTO "User" VALUES ('8b6c1e0a-uuid', 'federico', $1)"#)
        .bind(hash)
        .execute(pg)
        .await
        .unwrap();
    pg.execute(
        r#"INSERT INTO "Post" (id, title, description, link) VALUES
            (16, 'Lo Studio sostiene...', 'Descrizione con "virgolette" e àèìòù', 'https://example.com/a'),
            (17, 'Natale in carcere', E'Riga 1\nRiga 2', 'https://example.com/b');
           INSERT INTO "ContactForm" (id, name, email, telephone, description, viewed, checked) VALUES
            (7,  'Test',  't@example.com', '123456', 'ciao', true,  '2024-09-25 17:30:04.925'),
            (8,  'Anna',  'a@example.com', '333111', NULL,   false, '2025-05-26 07:37:21.688'),
            (11, 'Nicola','n@example.com', '351007', E'Buongiorno.\nGrazie', false, '2026-08-20 05:47:18.523');
           SELECT setval('"ContactForm_id_seq"', 11);"#,
    )
    .await
    .unwrap();
}

async fn contacts(sqlite: &SqlitePool) -> Vec<(i64, String, Option<String>, bool, String)> {
    sqlx::query("SELECT id, name, description, viewed, created_at FROM contact_forms ORDER BY id")
        .fetch_all(sqlite)
        .await
        .unwrap()
        .iter()
        .map(|r| (r.get(0), r.get(1), r.get(2), r.get(3), r.get(4)))
        .collect()
}

#[tokio::test]
async fn copies_everything_exactly() {
    let Some((pg, url)) = legacy_db().await else {
        return;
    };
    seed(&pg).await;
    let sqlite = db::connect_memory().await.unwrap();

    let r = legacy::sync_from_url(&sqlite, &url).await.unwrap();
    assert_eq!((r.users_added, r.posts_added, r.contacts_added), (1, 2, 3));
    assert_eq!(r.legacy_counts, (1, 2, 3));

    assert_eq!(
        contacts(&sqlite).await,
        vec![
            (
                7,
                "Test".into(),
                Some("ciao".into()),
                true,
                "2024-09-25T17:30:04.925Z".into()
            ),
            (
                8,
                "Anna".into(),
                None,
                false,
                "2025-05-26T07:37:21.688Z".into()
            ),
            (
                11,
                "Nicola".into(),
                Some("Buongiorno.\nGrazie".into()),
                false,
                "2026-08-20T05:47:18.523Z".into()
            ),
        ],
        "ids, timestamps (UTC, ms), NULLs, newlines and viewed flags are preserved"
    );

    let posts: Vec<(i64, String, String)> =
        sqlx::query_as("SELECT id, title, description FROM posts ORDER BY id")
            .fetch_all(&sqlite)
            .await
            .unwrap();
    assert_eq!(
        posts[0],
        (
            16,
            "Lo Studio sostiene...".into(),
            "Descrizione con \"virgolette\" e àèìòù".into()
        )
    );
    assert_eq!(posts[1].2, "Riga 1\nRiga 2");

    let hash: String =
        sqlx::query_scalar("SELECT password_hash FROM users WHERE username = 'federico'")
            .fetch_one(&sqlite)
            .await
            .unwrap();
    assert!(
        bcrypt::verify("the real admin password", &hash).unwrap(),
        "existing password keeps working"
    );

    // New rows on the new site continue after the highest old id.
    sqlx::query(
        "INSERT INTO contact_forms (name, email, telephone) VALUES ('x', 'x@x.com', '12345')",
    )
    .execute(&sqlite)
    .await
    .unwrap();
    let max: i64 = sqlx::query_scalar("SELECT max(id) FROM contact_forms")
        .fetch_one(&sqlite)
        .await
        .unwrap();
    assert_eq!(max, 12);
}

#[tokio::test]
async fn running_again_adds_nothing() {
    let Some((pg, _)) = legacy_db().await else {
        return;
    };
    seed(&pg).await;
    let sqlite = db::connect_memory().await.unwrap();
    legacy::sync(&sqlite, &pg).await.unwrap();
    let before = contacts(&sqlite).await;
    for _ in 0..3 {
        let r = legacy::sync(&sqlite, &pg).await.unwrap();
        assert_eq!((r.users_added, r.posts_added, r.contacts_added), (0, 0, 0));
    }
    assert_eq!(contacts(&sqlite).await, before);
}

#[tokio::test]
async fn picks_up_messages_that_arrive_later() {
    let Some((pg, _)) = legacy_db().await else {
        return;
    };
    seed(&pg).await;
    let sqlite = db::connect_memory().await.unwrap();
    legacy::sync(&sqlite, &pg).await.unwrap();

    pg.execute(r#"INSERT INTO "ContactForm" (name, email, telephone) VALUES ('Late', 'l@example.com', '999999')"#)
        .await
        .unwrap();
    let r = legacy::sync(&sqlite, &pg).await.unwrap();
    assert_eq!(r.contacts_added, 1);
    assert!(contacts(&sqlite)
        .await
        .iter()
        .any(|c| c.0 == 12 && c.1 == "Late"));
}

#[tokio::test]
async fn id_clash_during_switch_loses_nothing() {
    // Both sites received a message during the switch and both gave it id 12.
    let Some((pg, _)) = legacy_db().await else {
        return;
    };
    seed(&pg).await;
    let sqlite = db::connect_memory().await.unwrap();
    legacy::sync(&sqlite, &pg).await.unwrap();

    sqlx::query(
        "INSERT INTO contact_forms (name, email, telephone) VALUES ('NewSite', 'n@x.com', '12345')",
    )
    .execute(&sqlite)
    .await
    .unwrap();
    pg.execute(r#"INSERT INTO "ContactForm" (name, email, telephone) VALUES ('OldSite', 'o@x.com', '67890')"#)
        .await
        .unwrap();

    let r = legacy::sync(&sqlite, &pg).await.unwrap();
    assert_eq!(r.contacts_added, 1);
    let names: Vec<String> = contacts(&sqlite).await.into_iter().map(|c| c.1).collect();
    assert!(
        names.contains(&"NewSite".to_string()) && names.contains(&"OldSite".to_string()),
        "{names:?}"
    );
    assert_eq!(names.len(), 5);
}

#[tokio::test]
async fn never_overwrites_an_existing_admin() {
    let Some((pg, _)) = legacy_db().await else {
        return;
    };
    seed(&pg).await;
    let sqlite = db::connect_memory().await.unwrap();
    auth::seed_admin(&sqlite, "federico", "a newer password set here")
        .await
        .unwrap();

    let r = legacy::sync(&sqlite, &pg).await.unwrap();
    assert_eq!(r.users_added, 0);
    let hash: String = sqlx::query_scalar("SELECT password_hash FROM users")
        .fetch_one(&sqlite)
        .await
        .unwrap();
    assert!(bcrypt::verify("a newer password set here", &hash).unwrap());
}

#[tokio::test]
async fn the_legacy_connection_is_read_only() {
    let Some((pg, url)) = legacy_db().await else {
        return;
    };
    seed(&pg).await;
    let sqlite = db::connect_memory().await.unwrap();
    legacy::sync_from_url(&sqlite, &url).await.unwrap();
    let count: i64 = sqlx::query_scalar(r#"SELECT count(*) FROM "ContactForm""#)
        .fetch_one(&pg)
        .await
        .unwrap();
    assert_eq!(count, 3, "Postgres is left exactly as it was");
}

#[tokio::test]
async fn unreachable_database_is_an_error() {
    let sqlite = db::connect_memory().await.unwrap();
    let err = legacy::sync_from_url(&sqlite, "postgres://nobody:x@127.0.0.1:1/none").await;
    assert!(
        err.is_err(),
        "startup must fail rather than serve with missing data"
    );
}
