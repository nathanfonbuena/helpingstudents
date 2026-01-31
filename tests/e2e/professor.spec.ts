import { test, expect } from "@playwright/test";

test("professor page renders", async ({ page }) => {
  await page.goto("/top-professors");
  const firstLink = page.locator(".ranking-row a").first();
  if (await firstLink.count()) {
    await firstLink.click();
    await expect(page.getByText(/Professor profile/i)).toBeVisible();
  }
});
