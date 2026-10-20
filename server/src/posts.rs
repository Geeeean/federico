use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{
    app::AppState,
    auth::AdminSession,
    error::{AppError, AppResult},
    extract::ApiJson,
    validate,
};

#[derive(Serialize, sqlx::FromRow, Debug)]
pub struct Post {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub link: String,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<Value>> {
    let posts: Vec<Post> =
        sqlx::query_as("SELECT id, title, description, link FROM posts ORDER BY id")
            .fetch_all(&state.db)
            .await?;
    Ok(Json(
        json!({ "msg": "Posts retrieved successfully", "posts": posts }),
    ))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NewPost {
    title: String,
    description: String,
    link: String,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AddBody {
    post: NewPost,
}

pub async fn add(
    State(state): State<AppState>,
    _admin: AdminSession,
    ApiJson(body): ApiJson<AddBody>,
) -> AppResult<Json<Value>> {
    let title = validate::text(&body.post.title, 200, "Invalid title")?;
    let description = validate::multiline(&body.post.description, 2000, "Invalid description")?;
    let link = validate::http_url(&body.post.link)?;

    let post: Post = sqlx::query_as("INSERT INTO posts (title, description, link) VALUES (?, ?, ?) RETURNING id, title, description, link")
        .bind(title)
        .bind(description)
        .bind(link)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(json!({ "msg": "Post created", "posts": post })))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PostId {
    id: i64,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoveBody {
    post: PostId,
}

pub async fn remove(
    State(state): State<AppState>,
    _admin: AdminSession,
    ApiJson(body): ApiJson<RemoveBody>,
) -> AppResult<Json<Value>> {
    let post: Option<Post> =
        sqlx::query_as("DELETE FROM posts WHERE id = ? RETURNING id, title, description, link")
            .bind(body.post.id)
            .fetch_optional(&state.db)
            .await?;
    let post = post.ok_or(AppError::NotFound)?;
    Ok(Json(json!({ "msg": "Post deleted", "remove": post })))
}
