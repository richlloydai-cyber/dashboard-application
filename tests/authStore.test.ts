// ============================================================
// AUTH STORE UNIT TESTS
// Following the 4-phase TDD workflow from plans/dashboard-app-login-page.md
// ============================================================

import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/authStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset the store to a clean state before each test
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      login: useAuthStore.getState().login,
      logout: useAuthStore.getState().logout,
      error: null,
    });
  });

  it("should have login and logout methods", () => {
    const { result } = useAuthStore.getState();
    expect(typeof result.login).toBe("function");
    expect(typeof result.logout).toBe("function");
  });

  it("should track isAuthenticated state", () => {
    const { result } = useAuthStore.getState();
    expect(result.isAuthenticated).toBe(false);
  });

  it("should set isAuthenticated to true when login is called", () => {
    useAuthStore.getState().login({ username: "test", password: "test" });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should set isAuthenticated to false when logout is called", () => {
    // First, login
    useAuthStore.getState().login({ username: "test", password: "test" });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Then, logout
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("should store user info on login", () => {
    const user = { username: "testuser", role: "admin" as const };
    useAuthStore.getState().login({ username: "testuser", password: "test" });
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("should clear user info on logout", () => {
    // First, login
    useAuthStore.getState().login({ username: "testuser", password: "test" });
    expect(useAuthStore.getState().user).not.toBeNull();

    // Then, logout
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("should clear error on login", () => {
    // Set an error first
    useAuthStore.setState({ error: "Previous error" });
    expect(useAuthStore.getState().error).toBe("Previous error");

    // Login should clear the error
    useAuthStore.getState().login({ username: "test", password: "test" });
    expect(useAuthStore.getState().error).toBeNull();
  });
});