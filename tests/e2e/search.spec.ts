import { test, expect } from "@playwright/test";

test("search page shows results", async ({ page }) => {
  await page.goto("/search?q=Dr.");
  await expect(page.getByRole("heading", { name: "Search results" })).toBeVisible();
});
