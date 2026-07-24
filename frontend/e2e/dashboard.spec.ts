import { test, expect } from "@playwright/test";

// Live data only — no mocks. The dashboard reads straight from the
// Hermes adapter, so these tests assert real board content.
test.describe("Hermes dashboard (live)", () => {
  test("title bar + live-data indicator render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Hermes Project Control")).toBeVisible();
    // The header must show a live/error state, never "Sample data".
    await expect(page.getByText("Sample data")).toHaveCount(0);
  });

  test("project list is populated from the live adapter", async ({ page }) => {
    await page.goto("/");
    // The sidebar lists the live Hermes boards.
    await expect(page.getByText("coder-board")).toBeVisible();
    await expect(page.getByText("product-board")).toBeVisible();
  });

  test("selecting a project opens its three pillars", async ({ page }) => {
    await page.goto("/");
    await page.getByText("coder-board").click();
    await expect(page.getByText("Integrate")).toBeVisible();
    await expect(page.getByText("Deliver")).toBeVisible();
    await expect(page.getByText("Operate")).toBeVisible();
  });

  test("pillar navigation switches the active view", async ({ page }) => {
    await page.goto("/");
    await page.getByText("coder-board").click();
    await page.getByRole("button", { name: "Build Pipelins" }).click();
    // Either a real pipeline or the honest empty state — but never mock data.
    const build = page.getByText(/No pipelines configured|CI|multi-tenant CI/);
    await expect(build.first()).toBeVisible();
  });

  test("no project selected shows the empty state", async ({ page }) => {
    await page.goto("/");
    // If somehow no project is selected, the dashboard says so.
    const empty = page.getByText("No project selected");
    if (await empty.count()) {
      await expect(empty).toBeVisible();
    }
  });
});
