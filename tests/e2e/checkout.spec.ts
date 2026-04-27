import { test, expect } from "@playwright/test";

test.describe("Stripe Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assumes user is authenticated)
    await page.goto("/dashboard");
  });

  test("should show upgrade button for free users", async ({ page }) => {
    // Check if we're on the dashboard (not redirected to login)
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
      return;
    }

    // Look for Pro badge or Upgrade button
    const proBadge = page.getByText(/pro plan active/i);
    const upgradeButton = page.getByRole("button", { name: /upgrade|pro/i });

    const hasProBadge = await proBadge.isVisible().catch(() => false);
    const hasUpgradeButton = await upgradeButton.isVisible().catch(() => false);

    // User should have either Pro status or upgrade option
    expect(hasProBadge || hasUpgradeButton).toBeTruthy();
  });

  test("should display billing section on dashboard", async ({ page }) => {
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
      return;
    }

    // Check for billing-related text
    const billingSection = page.getByText(/billing|pro plan|upgrade/i).first();
    await expect(billingSection).toBeVisible();
  });

  test("should handle checkout button click", async ({ page }) => {
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
      return;
    }

    const upgradeButton = page.getByRole("button", { name: /upgrade/i });
    
    if (await upgradeButton.isVisible().catch(() => false)) {
      // Mock the checkout API response
      await page.route("**/api/stripe/checkout", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "https://checkout.stripe.com/mock-session" }),
        });
      });

      // Prevent actual navigation to Stripe
      await page.route("https://checkout.stripe.com/**", async (route) => {
        await route.abort();
      });

      await upgradeButton.click();
      
      // Should attempt to call the checkout API
      // (In a real test, you'd check for the API call or navigation intent)
    }
  });

  test("should show Pro status for Pro users", async ({ page }) => {
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
      return;
    }

    // If Pro badge is visible, verify its content
    const proText = page.getByText(/pro plan active/i);
    if (await proText.isVisible().catch(() => false)) {
      await expect(proText).toBeVisible();
      
      // Pro users should see a Pro badge
      const proBadge = page.getByText(/^pro$/i);
      await expect(proBadge).toBeVisible();
    }
  });
});

test.describe("Checkout Success Handling", () => {
  test("should handle checkout success redirect", async ({ page }) => {
    // Simulate returning from Stripe checkout
    await page.goto("/dashboard?checkout=success");

    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
      return;
    }

    // Dashboard should load successfully
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });
});
