import { defineConfig, devices } from "@playwright/test";

// Playwright E2E for the Hermes dashboard.
// Targets the LIVE Hermes adapter (no mocks) via the public tunnel,
// or a locally-built app when BASE_URL is overridden.
//   npx playwright test
//   BASE_URL=http://localhost:3800 npx playwright test
//
// CI installs chromium via `playwright install --with-deps chromium`.
const BASE_URL = process.env.BASE_URL || "https://mountains-private-far-lions.trycloudflare.com";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
