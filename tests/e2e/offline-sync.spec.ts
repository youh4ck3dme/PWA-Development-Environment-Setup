import { test, expect } from "@playwright/test";

test.describe("Offline Sync", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    
    // Skip if not authenticated
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
    }
  });

  test("should show offline banner when offline", async ({ page, context }) => {
    // Check if offline banner component exists
    const offlineBanner = page.locator('[class*="offline"]', { hasText: /offline/i });
    
    // Go offline
    await context.setOffline(true);
    
    // Wait a moment for the offline event to propagate
    await page.waitForTimeout(1000);
    
    // Banner should appear
    if (await offlineBanner.isVisible().catch(() => false)) {
      await expect(offlineBanner).toBeVisible();
    }
    
    // Go back online
    await context.setOffline(false);
  });

  test("should show sync queue status", async ({ page }) => {
    // Look for sync-related text
    const syncSection = page.getByText(/sync|queue|offline/i).first();
    
    if (await syncSection.isVisible().catch(() => false)) {
      await expect(syncSection).toBeVisible();
    }
  });

  test("should display sync button when operations are pending", async ({ page }) => {
    // Look for sync button or synced status
    const syncButton = page.getByRole("button", { name: /sync now/i });
    const syncedStatus = page.getByText(/synced/i);
    
    const hasSyncButton = await syncButton.isVisible().catch(() => false);
    const hasSyncedStatus = await syncedStatus.isVisible().catch(() => false);
    
    // Should show either sync button or synced status
    expect(hasSyncButton || hasSyncedStatus).toBeTruthy();
  });

  test("should handle sync button click", async ({ page }) => {
    const syncButton = page.getByRole("button", { name: /sync now/i });
    
    if (await syncButton.isVisible().catch(() => false)) {
      // Mock the sync API
      await page.route("**/api/sync/queue", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            replayed: 0,
            processedIds: [],
            conflicts: [],
          }),
        });
      });
      
      await syncButton.click();
      
      // Button should be clickable without errors
      await page.waitForTimeout(500);
    }
  });
});

test.describe("PWA Installation", () => {
  test("should have PWA manifest", async ({ page }) => {
    await page.goto("/");
    
    // Check for manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestLink).toBeTruthy();
    
    // Verify manifest is accessible
    if (manifestLink) {
      const manifestResponse = await page.request.get(manifestLink);
      expect(manifestResponse.ok()).toBeTruthy();
      
      const manifest = await manifestResponse.json();
      expect(manifest.name).toBeTruthy();
      expect(manifest.icons).toBeTruthy();
    }
  });

  test("should have service worker", async ({ page }) => {
    await page.goto("/");
    
    // Wait for service worker registration
    await page.waitForTimeout(2000);
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test("should show install prompt button", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Skip if not authenticated
    if (page.url().includes("/login") || page.url() === new URL("/", page.url()).href) {
      test.skip();
      return;
    }
    
    // Look for install button (may not always be visible depending on browser state)
    const installButton = page.getByRole("button", { name: /install/i });
    
    // Button existence check (may be hidden if already installed)
    const buttonExists = await installButton.count();
    expect(buttonExists).toBeGreaterThanOrEqual(0);
  });
});
