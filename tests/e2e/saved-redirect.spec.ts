import { test, expect } from "@playwright/test";

test("saved page redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/saved");
  await expect(page).toHaveURL(/login/);
});
