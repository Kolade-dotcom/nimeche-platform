import { expect, test, type Page } from "@playwright/test";

/**
 * The member's own screens, against real rows.
 *
 * These read what prisma/seed.ts wrote, so they need a seeded database:
 *
 *   npm run db:push && npm run db:seed
 *   E2E_WITH_DB=1 npm run e2e
 */
test.skip(!process.env.E2E_WITH_DB, "needs a seeded database (E2E_WITH_DB=1)");

const MEMBER = "akolade.salako@tech-u.edu.ng";
const PASSWORD = "nimeche-dev";

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Tech-U email").fill(MEMBER);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/me$/);
}

test("the dashboard greets the member and shows what is next", async ({ page }) => {
  await signIn(page);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Akolade");
  await expect(page.getByRole("heading", { name: "What is next" })).toBeVisible();
  await expect(page.getByText("Plant visit: Ibadan Steel Mill").first()).toBeVisible();
});

test("every member page loads and knows which one it is", async ({ page }) => {
  await signIn(page);

  for (const [path, heading] of [
    ["/me/events", "My events"],
    ["/me/certificates", "My certificates"],
    ["/me/skills", "My skills"],
    ["/me/profile", "Akolade Salako"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  }
});

test("certificates carry their verification codes", async ({ page }) => {
  await signIn(page);
  await page.goto("/me/certificates");

  // The code is the whole point of a certificate: an employer types it into
  // the public page. If it stops rendering, the feature is gone.
  await expect(page.getByText("NM-7K4Q-2X9").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Introduction to CAD" })).toBeVisible();
});

test("skills show how they were earned, and no way to edit them", async ({ page }) => {
  await signIn(page);
  await page.goto("/me/skills");

  await expect(page.getByText("How you got here").first()).toBeVisible();
  await expect(page.getByText("Verified by Engr. Richard Roe")).toBeVisible();

  // A derived level that a member could type would be worth nothing. There is
  // no write path, and this is the test that says so out loud.
  await expect(page.locator('input[name*="level" i]')).toHaveCount(0);
});

test("the profile shows the record the branch keeps, matric number included", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/me/profile");

  await expect(page.getByText("125/23/1/0142").first()).toBeVisible();
  await expect(page.getByText("SF-TECHU-0142")).toBeVisible();
  await expect(page.getByText("Mechanical Engineering").first()).toBeVisible();
});

test("a signed-out visitor is sent to sign in, and back again afterwards", async ({
  page,
}) => {
  await page.context().clearCookies();
  await page.goto("/me/certificates");
  await expect(page).toHaveURL(/\/sign-in/);

  await page.getByLabel("Tech-U email").fill(MEMBER);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/me\/certificates/);
});
