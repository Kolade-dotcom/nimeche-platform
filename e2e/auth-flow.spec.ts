import { expect, test } from "@playwright/test";

/**
 * The flows that need a real database behind them.
 *
 * Skipped unless E2E_WITH_DB is set, because they write rows. To run them:
 *
 *   npm run db:push && npm run db:seed
 *   E2E_WITH_DB=1 npm run e2e
 *
 * The one leg not covered here is opening the link from a reset email: the
 * token only exists in the message, so proving it needs a mail-catcher rather
 * than a browser. It was verified by hand.
 */
test.skip(!process.env.E2E_WITH_DB, "needs a seeded database (E2E_WITH_DB=1)");

/** Seeded by prisma/seed.ts. */
const EXISTING = "akolade.salako@tech-u.edu.ng";
const FRESH = `new.member${Date.now()}.${process.pid}@tech-u.edu.ng`;

test("a new member can sign up, and lands on check-your-email", async ({ page }) => {
  await page.goto("/join");
  await page.getByLabel("Full name").fill("Mary Major");
  await page.getByLabel("Tech-U email").fill(FRESH);
  await page.getByLabel("Password").fill("eight888");
  await page.getByRole("radio", { name: "Mechanical" }).click();
  await page.getByRole("radio", { name: "400" }).click();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/check-email\?reason=confirm/);
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
});

test("signing up twice on the same address is refused", async ({ page }) => {
  await page.goto("/join");
  await page.getByLabel("Full name").fill("Mary Major");
  await page.getByLabel("Tech-U email").fill(EXISTING);
  await page.getByLabel("Password").fill("eight888");
  await page.getByRole("radio", { name: "Mechanical" }).click();
  await page.getByRole("radio", { name: "400" }).click();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.locator('[data-slot="form-alert"]')).toContainText(
    "already an account"
  );
});

test("a seeded member can sign in and reach the portal", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Tech-U email").fill("akolade.salako@tech-u.edu.ng");
  await page.getByLabel("Password").fill("nimeche-dev");
  await page.getByRole("button", { name: "Sign in" }).click();

  // /me has no page yet, so a 404 here still proves the session was made and
  // the proxy stopped redirecting to sign-in.
  await expect(page).toHaveURL(/\/me/);
});

test("a wrong password is refused, without saying which half was wrong", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByLabel("Tech-U email").fill("akolade.salako@tech-u.edu.ng");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.locator('[data-slot="form-alert"]')).toContainText("do not match");
});

test("an unknown address gets the identical message", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Tech-U email").fill("nobody.here@tech-u.edu.ng");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.locator('[data-slot="form-alert"]')).toContainText("do not match");
});

test("forgot-password answers the same for a real and an unknown address", async ({
  page,
}) => {
  for (const email of ["akolade.salako@tech-u.edu.ng", "nobody.here@tech-u.edu.ng"]) {
    await page.goto("/forgot-password");
    await page.getByLabel("Tech-U email").fill(email);
    await page.getByRole("button", { name: "Email me a reset link" }).click();
    await expect(page).toHaveURL(/\/check-email\?reason=reset/);
  }
});
