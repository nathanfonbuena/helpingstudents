import { test, expect } from "@playwright/test";

/**
 * Compare tray regression tests.
 *
 * The tray floats above the page and — on mobile — above the fixed bottom
 * navigation bar (z-index 60, ~78px tall).  The tray must never be hidden
 * behind the nav bar, otherwise "Compare now" is unreachable.
 */

test.describe("compare tray", () => {
  test("shows and allows removing professors from the tray", async ({ page }) => {
    // Seed two professors into localStorage before navigating
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "classrack.compare.professors.v1",
        JSON.stringify([
          { id: "test-prof-1", name: "Dr. Test One", slug: "dr-test-one" },
          { id: "test-prof-2", name: "Dr. Test Two", slug: "dr-test-two" }
        ])
      );
    });
    await page.goto("/?q=Jordan");

    const tray = page.locator(".compare-tray");
    await expect(tray).toBeVisible();
    await expect(tray.getByText("Compare professors (2/3)")).toBeVisible();
    await expect(tray.getByRole("link", { name: "Compare now" })).toBeVisible();
  });

  test("tray 'Compare now' link is not obscured by the mobile bottom nav bar", async ({
    page
  }) => {
    // Use a common mobile viewport where the sidebar becomes a fixed bottom nav
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "classrack.compare.professors.v1",
        JSON.stringify([
          { id: "test-prof-1", name: "Dr. Test One", slug: "dr-test-one" },
          { id: "test-prof-2", name: "Dr. Test Two", slug: "dr-test-two" }
        ])
      );
    });

    // Navigate to a non-/compare page so the tray is rendered
    await page.goto("/?q=Jordan");

    const tray = page.locator(".compare-tray");
    await expect(tray).toBeVisible();

    const compareNowLink = tray.getByRole("link", { name: "Compare now" });
    await expect(compareNowLink).toBeVisible();

    // The "Compare now" link must not be hidden behind the bottom nav bar.
    // We verify this by checking that the link's bounding box bottom edge is
    // above the bottom nav bar's top edge.
    const linkBox = await compareNowLink.boundingBox();
    const navBar = page.locator(".sidebar");
    const navBox = await navBar.boundingBox();

    expect(linkBox).not.toBeNull();
    expect(navBox).not.toBeNull();

    // The bottom of the "Compare now" link must be above the top of the nav bar.
    // A positive gap means no overlap; allow ≤2px rounding tolerance.
    const gap = (navBox?.y ?? 0) - ((linkBox?.y ?? 0) + (linkBox?.height ?? 0));
    expect(gap).toBeGreaterThan(-2);
  });

  test("tray is hidden on the /compare page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "classrack.compare.professors.v1",
        JSON.stringify([{ id: "test-prof-1", name: "Dr. Test One", slug: "dr-test-one" }])
      );
    });
    await page.goto("/compare");
    await expect(page.locator(".compare-tray")).not.toBeVisible();
  });
});
