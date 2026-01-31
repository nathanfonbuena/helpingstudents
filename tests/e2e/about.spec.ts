import { test, expect } from "@playwright/test";

test("about page loads", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByText(/About Us/)).toBeVisible();
});
