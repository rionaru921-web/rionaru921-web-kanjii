import { test, expect } from "@playwright/test";

// components/auth/SignupForm.tsx has no htmlFor/id pairing between its
// <label> and <input> elements (the label just sits next to the input in
// the same wrapping <div>), so Playwright's getByLabel() — which relies on
// that association — cannot find these fields. Falls back to type-based
// locators instead. The submit button's real text is "無料ではじめる", not
// a generic "登録/作成/サインアップ" label.
test.describe("Signup consent", () => {
  test("Submit disabled when consent unchecked", async ({ page }) => {
    await page.goto("/signup");
    const submit = page.getByRole("button", { name: "無料ではじめる" });
    await expect(submit).toBeDisabled();
  });

  test("3 legal links exist in consent area", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("link", { name: "利用規約", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "プライバシーポリシー", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "ベータ利用規約", exact: true })).toBeVisible();
  });

  test("Consent checkbox enables submit once fields are filled", async ({ page }) => {
    await page.goto("/signup");

    await page.locator('input[type="email"]').fill("playwright-check@example.com");
    await page.locator('input[type="password"]').nth(0).fill("SecurePass123!");
    await page.locator('input[type="password"]').nth(1).fill("SecurePass123!");

    const submit = page.getByRole("button", { name: "無料ではじめる" });
    await expect(submit).toBeDisabled();

    await page.getByRole("checkbox").check();
    await expect(submit).toBeEnabled();

    // Deliberately not clicking submit — this task must not create real
    // signup data in the production Supabase project.
  });
});
