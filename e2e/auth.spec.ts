import { expect, test } from "@playwright/test";

test.describe("the public homepage", () => {
  test("renders for a signed-out visitor, with a way in", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "still count after you graduate"
    );
    await expect(page.getByRole("link", { name: "Join NiMechE-SF" })).toBeVisible();
  });
});

test.describe("signing in", () => {
  test("asks for an email and a password, and nothing else", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByLabel("Tech-U email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("the password is hidden until Show is pressed", async ({ page }) => {
    await page.goto("/sign-in");
    const password = page.getByLabel("Password");
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });

  test("a personal address is refused, in words that say what to use", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Tech-U email").fill("jane.doe@gmail.com");
    await page.getByLabel("Password").fill("whatever123");
    await page.getByRole("button", { name: "Sign in" }).click();
    // #email-error, not role=alert: Next.js's route announcer is one too.
    // The id is part of the contract anyway - aria-describedby points at it.
    await expect(page.locator("#email-error")).toContainText("tech-u.edu.ng");
  });

  test("keeps ?next= so the member lands where they were going", async ({ page }) => {
    // The two-tap budget for an event link only holds if the destination
    // survives the sign-in round trip (design plan section 1.1).
    await page.goto("/sign-in?next=%2Fevents%2Fplant-visit-ibadan-steel-mill");
    await expect(page.locator('input[name="next"]')).toHaveValue(
      "/events/plant-visit-ibadan-steel-mill"
    );
  });
});

test.describe("joining", () => {
  test("asks for five fields and no more", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Tech-U email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("radiogroup").first()).toBeVisible();

    // No confirm-password field. Its absence is the design decision.
    await expect(page.getByLabel("Confirm password")).toHaveCount(0);
  });

  test("offers both departments and all five levels", async ({ page }) => {
    await page.goto("/join");
    await expect(page.getByRole("radio", { name: "Mechanical" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Mechatronics" })).toBeVisible();
    for (const level of ["100", "200", "300", "400", "500"]) {
      await expect(page.getByRole("radio", { name: level })).toBeVisible();
    }
  });
});

test.describe("the way back in", () => {
  test("forgot-password asks only for the address", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel("Tech-U email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Email me a reset link" })
    ).toBeVisible();
  });

  test("an expired link explains itself and offers a new one", async ({ page }) => {
    await page.goto("/link-expired");
    await expect(
      page.getByRole("heading", { name: "That link has expired" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Send me a new one" })).toBeVisible();
  });
});
