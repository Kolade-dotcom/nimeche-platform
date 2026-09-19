import { expect, test } from "@playwright/test";

test("the home page renders for a signed-out visitor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByAltText("NiMechE-SF, Tech-U").first()).toBeVisible();
});
