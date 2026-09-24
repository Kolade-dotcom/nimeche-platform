import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * The deep-link rule is tested here, not by hand: every public URL renders
 * signed out, and ?next= survives the whole sign-in round trip. It regresses
 * silently otherwise (dev plan section 8).
 */

/**
 * Some sandboxes ship a Chromium build that does not match the one this
 * version of Playwright downloads. Use it when it is there rather than failing
 * on a missing binary; on a normal machine this is undefined and Playwright
 * uses its own.
 */
const PREINSTALLED = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (fs.existsSync(PREINSTALLED) ? PREINSTALLED : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
    {
      // The member's world is a phone. Do not let this project rot.
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions: { executablePath } },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
