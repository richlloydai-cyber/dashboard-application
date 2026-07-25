import { test, expect } from "@playwright/test";

// Self-contained E2E — NO external tunnel, NO mocks.
// The CI job builds the app with basePath=/projects and proxies
// /projects/api -> the locally-running Hermes adapter (seeded with
// committed fixture boards). The adapter serves REAL live data, so
// these tests assert against the actual fixture content, never
// against "Sample data".

// Fixture board slugs / display names (see test/fixtures/boards).
const BOARDS = [
  { slug: "e2e-coder", name: "E2E Coder" },
  { slug: "e2e-product", name: "E2E Product" },
  { slug: "e2e-research", name: "E2E Research" },
];

test.describe("Hermes dashboard (live, self-contained)", () => {
  test("title bar + no mock/sample-data indicator", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Hermes Project Control")).toBeVisible();
    // The app must never fall back to mock/sample data.
    await expect(page.getByText("Sample data", { exact: false })).toHaveCount(0);
  });

  test("sidebar lists the live fixture boards", async ({ page }) => {
    await page.goto("/");
    for (const b of BOARDS) {
      // The sidebar project button is the authoritative occurrence.
      await expect(
        page.getByRole("button", { name: b.name, exact: false })
      ).toBeVisible();
    }
  });

  test("selecting a board opens its three pillars", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "E2E Coder", exact: false }).click();
    await expect(page.getByRole("button", { name: "Build Pipelines" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Quality Gates" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Deployments" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Agent Tasks" })).toBeVisible();
  });

  test("pillar navigation switches the active view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "E2E Coder", exact: false }).click();
    await page.getByRole("button", { name: "Build Pipelines" }).click();
    // The build pillar shows either a real pipeline or the honest empty state.
    await expect(
      page.getByText(/No pipelines configured|CI|multi-tenant CI/)
    ).toBeVisible();
  });

  test("board detail shows live task data", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "E2E Coder", exact: false }).click();
    await page.getByRole("button", { name: "Agent Tasks" }).click();
    // One of the fixture tasks (real, from kanban.db).
    await expect(page.getByText("Add rate-limiting to gateway")).toBeVisible();
  });
});
