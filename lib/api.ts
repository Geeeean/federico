// The Rust server serves both the site and the API, so calls are same-origin.
export const API_URL = "/api"

/**
 * fetch() wrapper for our API: sends JSON with the right Content-Type (the
 * server rejects anything else) and sends admins back to the login page when
 * their session has expired.
 */
export const apiFetch = async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")

    const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: "same-origin" })

    if (response.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/login"
    }
    return response
}
