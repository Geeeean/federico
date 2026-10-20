//! Contact form submissions ("modals" in the frontend's naming).

use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{
    app::AppState,
    auth::AdminSession,
    error::{AppError, AppResult},
    extract::{ApiJson, ClientIp},
    validate,
};

#[derive(Serialize, sqlx::FromRow, Debug)]
pub struct Contact {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub telephone: String,
    pub description: Option<String>,
    pub viewed: bool,
    /// Submission time (ISO 8601). Named `checked` for frontend compatibility.
    #[serde(rename = "checked")]
    pub created_at: String,
}

const SELECT: &str =
    "SELECT id, name, email, telephone, description, viewed, created_at FROM contact_forms";

/// Only these fields are accepted from the public form. Anything else
/// (id, viewed, timestamps...) is rejected instead of being written to the DB.
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FormValues {
    name: String,
    email: String,
    telephone: String,
    #[serde(default)]
    description: Option<String>,
    terms: bool,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SubmitData {
    #[serde(rename = "formValues")]
    form_values: FormValues,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SubmitBody {
    data: SubmitData,
    token: String,
}

pub async fn submit(
    State(state): State<AppState>,
    ClientIp(ip): ClientIp,
    ApiJson(body): ApiJson<SubmitBody>,
) -> AppResult<Json<Value>> {
    if !state.submit_limiter.check(&ip) {
        return Err(AppError::TooManyRequests);
    }

    let f = body.data.form_values;
    if !f.terms {
        return Err(AppError::BadRequest("Terms must be accepted"));
    }
    let name = validate::text(&f.name, 200, "Invalid name")?;
    let email = validate::email(&f.email)?;
    let telephone = validate::telephone(&f.telephone)?;
    let description =
        validate::multiline_opt(f.description.as_deref(), 5000, "Invalid description")?;

    if body.token.is_empty() || body.token.len() > 4096 {
        return Err(AppError::Forbidden);
    }
    // Validate input before calling Google, so junk requests cost nothing.
    if !state.captcha.verify(&body.token, &ip).await? {
        return Err(AppError::Forbidden);
    }

    sqlx::query(
        "INSERT INTO contact_forms (name, email, telephone, description) VALUES (?, ?, ?, ?)",
    )
    .bind(name)
    .bind(email)
    .bind(telephone)
    .bind(description)
    .execute(&state.db)
    .await?;
    tracing::info!("new contact form submission");
    Ok(Json(json!({ "msg": "Created new contact modal row" })))
}

pub async fn list(State(state): State<AppState>, _admin: AdminSession) -> AppResult<Json<Value>> {
    let modals: Vec<Contact> = sqlx::query_as(&format!("{SELECT} ORDER BY id"))
        .fetch_all(&state.db)
        .await?;
    Ok(Json(
        json!({ "msg": "Modals retrieved successfully", "modals": modals }),
    ))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModalId {
    id: i64,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoveBody {
    modal: ModalId,
}

pub async fn remove(
    State(state): State<AppState>,
    _admin: AdminSession,
    ApiJson(body): ApiJson<RemoveBody>,
) -> AppResult<Json<Value>> {
    let row: Option<Contact> = sqlx::query_as("DELETE FROM contact_forms WHERE id = ? RETURNING id, name, email, telephone, description, viewed, created_at")
        .bind(body.modal.id)
        .fetch_optional(&state.db)
        .await?;
    let row = row.ok_or(AppError::NotFound)?;
    Ok(Json(json!({ "msg": "Modal deleted", "remove": row })))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Toggle {
    id: i64,
    #[serde(rename = "newViewed")]
    new_viewed: bool,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ToggleBody {
    modal: Toggle,
}

pub async fn toggle(
    State(state): State<AppState>,
    _admin: AdminSession,
    ApiJson(body): ApiJson<ToggleBody>,
) -> AppResult<Json<Value>> {
    let row: Option<Contact> =
        sqlx::query_as("UPDATE contact_forms SET viewed = ? WHERE id = ? RETURNING id, name, email, telephone, description, viewed, created_at")
            .bind(body.modal.new_viewed)
            .bind(body.modal.id)
            .fetch_optional(&state.db)
            .await?;
    let row = row.ok_or(AppError::NotFound)?;
    Ok(Json(json!({ "msg": "Modal updated", "remove": row })))
}
