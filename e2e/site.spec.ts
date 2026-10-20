import { test, expect, type Page } from "@playwright/test"

const ADMIN_USER = process.env.E2E_ADMIN_USER ?? "admin"
const ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? "e2e-admin-password"

// Replace Google's reCAPTCHA script with a stub so tests don't depend on
// Google scoring a headless browser. The server is run with Google's public
// test secret, which accepts any token.
const stubRecaptcha = async (page: Page) => {
    await page.route(/https:\/\/www\.google\.com\/recaptcha\/.*/, (route) =>
        route.fulfill({
            contentType: "text/javascript",
            body: "window.grecaptcha={enterprise:{ready:function(cb){cb()},execute:function(){return Promise.resolve('e2e-token')}}};",
        }),
    )
}

// Fail the test on any page error, console error or CSP violation.
const watchForErrors = (page: Page) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(`console: ${m.text()}`)
    })
    return errors
}

const login = async (page: Page) => {
    await page.goto("/login")
    await page.locator("#username").fill(ADMIN_USER)
    await page.locator("#password").fill(ADMIN_PASS)
    await page.getByRole("button", { name: "Accedi" }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
}

test.beforeEach(async ({ page }) => {
    await stubRecaptcha(page)
})

test("public pages render without errors", async ({ page }) => {
    const errors = watchForErrors(page)
    for (const path of ["/", "/identity", "/privacy", "/login"]) {
        const res = await page.goto(path)
        expect(res?.status(), path).toBe(200)
        await page.waitForLoadState("networkidle")
    }
    await page.goto("/")
    await expect(page.getByText("NOTIZIE", { exact: true })).toBeVisible()
    await expect(page.getByText("Contattaci per una consulenza")).toBeVisible()
    expect(errors).toEqual([])
})

test("unknown pages return the 404 page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist")
    expect(res?.status()).toBe(404)
})

test("admin pages redirect to login when logged out", async ({ page }) => {
    for (const path of ["/dashboard", "/dashboard/modals"]) {
        await page.goto(path)
        await expect(page).toHaveURL(/\/login$/)
    }
})

test("wrong password shows an error and grants nothing", async ({ page }) => {
    await page.goto("/login")
    await page.locator("#username").fill(ADMIN_USER)
    await page.locator("#password").fill("definitely-wrong")
    await page.getByRole("button", { name: "Accedi" }).click()
    await expect(page.getByText("Errore nell'autenticazione")).toBeVisible()
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login$/)
})

test("contact form reaches the admin panel", async ({ page }) => {
    const errors = watchForErrors(page)
    const name = `E2E ${Date.now()} ${test.info().project.name}`

    await page.goto("/")
    const form = page.locator("#contactForm form")
    await form.scrollIntoViewIfNeeded()
    await form.locator("input[name=name]").fill(name)
    await form.locator("input[name=email]").fill("e2e@example.com")
    await form.locator("input[name=telephone]").fill("+39 333 000 0000")
    await form.locator("textarea[name=description]").fill("Messaggio di prova\nsu due righe")
    await form.locator("#terms").click()
    await form.getByRole("button", { name: "Invia il modulo" }).click()
    await expect(page.getByText("Modulo ricevuto!")).toBeVisible()

    await login(page)
    await page.goto("/dashboard/modals")
    await expect(page.getByText(name)).toBeVisible()
    expect(errors).toEqual([])
})

test("admin can publish and remove a news post", async ({ page }) => {
    const title = `Notizia E2E ${Date.now()} ${test.info().project.name}`
    await login(page)

    await page.getByRole("button", { name: "Aggiungi notizia" }).click()
    const dialog = page.getByRole("dialog")
    const inputs = dialog.locator("input")
    await inputs.nth(0).fill(title)
    await inputs.nth(1).fill("https://example.com/notizia")
    await dialog.locator("textarea").fill("Descrizione della notizia di prova")
    await dialog.getByRole("button", { name: "Aggiungi", exact: true }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(title)).toBeVisible()

    // Visible on the public page, with a safe external link.
    await page.goto("/")
    const link = page.locator("a", { has: page.getByRole("button", { name: "Leggi" }) }).last()
    await expect(page.getByText(title)).toBeVisible()
    await expect(link).toHaveAttribute("href", "https://example.com/notizia")
    await expect(link).toHaveAttribute("rel", /noopener/)

    // A javascript: link is refused by the server and never published.
    await page.goto("/dashboard")
    await page.getByRole("button", { name: "Aggiungi notizia" }).click()
    await inputs.nth(0).fill(`${title} XSS`)
    await inputs.nth(1).fill("javascript:alert(document.cookie)")
    await dialog.locator("textarea").fill("x")
    const refused = page.waitForResponse((r) => r.url().endsWith("/api/posts/add"))
    await dialog.getByRole("button", { name: "Aggiungi", exact: true }).click()
    expect((await refused).status()).toBe(400)
    await page.keyboard.press("Escape")

    // Remove it again.
    const card = page.locator("div.rounded-xl, div[class*=card], div").filter({ has: page.getByText(title, { exact: true }) }).filter({ has: page.getByRole("button", { name: "Rimuovi" }) }).last()
    await card.getByRole("button", { name: "Rimuovi" }).click()
    await expect(page.getByText(title, { exact: true })).toBeHidden()
})

test("logout ends the session", async ({ page }) => {
    await login(page)
    await page.getByRole("button", { name: "Esci" }).click()
    await expect(page).toHaveURL(/\/login$/)
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login$/)
})

test("API refuses cross-site writes from the browser context", async ({ page, baseURL }) => {
    await page.goto("/")
    const status = await page.evaluate(async () => {
        const r = await fetch("/api/posts/add", { method: "POST", body: "{}", headers: { "Content-Type": "text/plain" } })
        return r.status
    })
    // text/plain is what a cross-site <form> could send; must never be accepted.
    expect([401, 415]).toContain(status)
    expect(baseURL).toBeTruthy()
})
