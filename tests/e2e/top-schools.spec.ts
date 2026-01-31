import { test, expect } from "@playwright/test";

test("top schools page loads", async ({ page }) => {
  await page.goto("/top-schools");
  await expect(page.getByRole("heading", { name: "Top Schools" })).toBeVisible();
});
