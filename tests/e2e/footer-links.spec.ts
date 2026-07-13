import { test, expect } from "@playwright/test";

// The footer's link labels include "利用規約" and "ベータ利用規約" — the
// latter contains the former as a substring, so an unanchored /利用規約/
// regex on getByRole would match both links and trip Playwright's strict
// mode. Exact string matches disambiguate them (see components/landing/Footer.tsx).
test.describe("Footer legal links", () => {
  test("Footer has 3 legal links visible", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "利用規約", exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: "ベータ利用規約", exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: "プライバシーポリシー", exact: true })).toBeVisible();
  });

  test("Footer links navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "利用規約", exact: true }).click();
    await expect(page).toHaveURL(/\/legal\/terms/);

    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "ベータ利用規約", exact: true }).click();
    await expect(page).toHaveURL(/\/legal\/beta/);

    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "プライバシーポリシー", exact: true }).click();
    await expect(page).toHaveURL(/\/legal\/privacy/);
  });
});
