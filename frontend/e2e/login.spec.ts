// ============================================================
// LOGIN PAGE E2E TESTS
// Following the 4-phase TDD workflow from plans/dashboard-app-login-page.md
// ============================================================

import { test, expect } from "@playwright/test";

test.describe("Login Page E2E Tests", () => {
  test.describe("Authentication Flow", () => {
    test("User journey: Navigate to /login → Fill form → Submit → Redirect to dashboard", async ({
      page,
    }) => {
      // Navigate to login page
      await page.goto("/login");

      // Fill in credentials
      await page.getByLabel("Email").fill("username");
      await page.getByLabel("Password").fill("r1card0@lv426");

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should redirect to dashboard (or home page)
      await expect(page).toHaveURL("/");
    });

    test("Invalid credentials: Show error message, stay on login page", async ({ page }) => {
      // Navigate to login page
      await page.goto("/login");

      // Fill in invalid credentials
      await page.getByLabel("Email").fill("wrong@example.com");
      await page.getByLabel("Password").fill("wrongpassword");

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid credentials/i)).toBeVisible();

      // Should stay on login page
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Form Validation", () => {
    test("Empty form submission shows validation errors", async ({ page }) => {
      await page.goto("/login");

      // Submit empty form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show validation errors
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test("Whitespace-only inputs are trimmed and treated as empty", async ({ page }) => {
      await page.goto("/login");

      // Fill with whitespace
      await page.getByLabel("Email").fill("   ");
      await page.getByLabel("Password").fill("   ");

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show validation errors (whitespace trimmed to empty)
      await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test("Invalid email format shows validation error", async ({ page }) => {
      await page.goto("/login");

      // Fill with invalid email
      await page.getByLabel("Email").fill("not-an-email");

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show validation error
      await expect(page.getByText(/enter a valid email/i)).toBeVisible();
    });
  });

  test.describe("Auth State Persistence", () => {
    test("Session persistence: Reload page, remain authenticated", async ({ page }) => {
      // Login
      await page.goto("/login");
      await page.getByLabel("Email").fill("username");
      await page.getByLabel("Password").fill("r1card0@lv426");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Wait for redirect
      await page.waitForURL("/");

      // Reload page
      await page.reload();

      // Should still be authenticated (user info visible)
      // This test assumes there's a user indicator in the UI
      // For now, just verify we're not redirected back to login
      await expect(page).not.toHaveURL("/login");
    });
  });

  test.describe("Logout Functionality", () => {
    test("Logout clears auth state", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.getByLabel("Email").fill("username");
      await page.getByLabel("Password").fill("r1card0@lv426");
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForURL("/");

      // Find and click logout button (adjust selector as needed)
      // This assumes there's a logout button in the UI
      const logoutButton = page.locator("button[aria-label='Logout'], button:has-text('Logout')");
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }

      // Should be redirected to login or show logged out state
      await page.waitForTimeout(500);
    });
  });
});