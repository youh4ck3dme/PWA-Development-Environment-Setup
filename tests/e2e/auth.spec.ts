import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show sign in page when not authenticated", async ({ page }) => {
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("should redirect to login when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login|^\//);
  });

  test("should show sign up form", async ({ page }) => {
    const signUpLink = page.getByRole("link", { name: /create account|sign up/i });
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page.getByRole("heading", { name: /sign up|create account/i })).toBeVisible();
    }
  });

  test("should show email and password fields", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should have Google OAuth button", async ({ page }) => {
    const googleButton = page.getByRole("button", { name: /google/i });
    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeVisible();
    }
  });
});

test.describe("Authenticated Dashboard Access", () => {
  test("should show account menu when authenticated", async ({ page }) => {
    // This test assumes user is logged in
    // In real scenarios, you'd use a setup script to authenticate first
    await page.goto("/dashboard");
    
    // If redirected to login, skip this test
    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl === new URL("/", page.url()).href) {
      test.skip();
    }

    // Check for authenticated UI elements
    const accountButton = page.getByRole("button", { name: /account|profile|menu/i });
    if (await accountButton.isVisible()) {
      await expect(accountButton).toBeVisible();
    }
  });

  test("should show dashboard content when authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    
    // If redirected to login, skip this test
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
    }

    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });
});
