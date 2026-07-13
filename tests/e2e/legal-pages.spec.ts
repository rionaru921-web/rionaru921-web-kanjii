import { test, expect } from "@playwright/test";

test.describe("Legal pages", () => {
  test("/legal/terms displays 17 articles", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page).toHaveTitle(/利用規約/);
    await expect(page.locator('h2[id^="art"]')).toHaveCount(17);
  });

  test("/legal/terms TOC anchors work", async ({ page, isMobile }) => {
    // The TOC nav is `hidden lg:block` in LegalContent.tsx — it never
    // becomes visible below the lg breakpoint, so clicking it on a mobile
    // viewport would fail Playwright's actionability (visibility) check.
    test.skip(isMobile, "TOC nav is hidden below the lg breakpoint");

    await page.goto("/legal/terms");
    const firstTocLink = page.locator('nav a[href^="#art"]').first();
    await firstTocLink.click();
    await expect(page).toHaveURL(/#art1$/);
  });

  test("/legal/privacy displays 11 articles + 7-vendor delegation table", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page).toHaveTitle(/プライバシーポリシー/);
    await expect(page.locator('h2[id^="art"]')).toHaveCount(11);

    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(7);

    await expect(page.getByText("Supabase", { exact: false })).toBeVisible();
    await expect(page.getByText("Vercel", { exact: false })).toBeVisible();
    await expect(page.getByText("Anthropic", { exact: false })).toBeVisible();
  });

  test("/legal/beta displays 9 articles", async ({ page }) => {
    await page.goto("/legal/beta");
    await expect(page).toHaveTitle(/ベータ版特別規約/);
    await expect(page.locator('h2[id^="art"]')).toHaveCount(9);
    await expect(page.getByText(/データ喪失/).first()).toBeVisible();
  });

  test("AI/3rd-party/collection disclaimers are emphasized in terms", async ({ page }) => {
    await page.goto("/legal/terms");
    // Article 11 (保証の否認および免責事項) wraps the AI/third-party/
    // collection-fee disclaimers in <strong> — see app/legal/terms/page.tsx.
    const article11 = page.locator("h2#art11").locator("xpath=ancestor::section");
    await expect(article11.locator("strong")).toHaveCount(3);
  });
});
