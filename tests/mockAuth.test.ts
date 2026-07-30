// ============================================================
// MOCK AUTH SERVICE UNIT TESTS
// Following the 4-phase TDD workflow from plans/dashboard-app-login-page.md
// ============================================================

import { describe, it, expect } from "vitest";
import { mockLogin } from "@/lib/mockAuth";

describe("mockLogin", () => {
  it("should return true for valid credentials", () => {
    expect(mockLogin("username", "r1card0@lv426")).toBe(true);
  });

  it("should return false for invalid password", () => {
    expect(mockLogin("username", "wrong")).toBe(false);
  });

  it("should return false for invalid username", () => {
    expect(mockLogin("wrong", "r1card0@lv426")).toBe(false);
  });

  it("should return false for both invalid credentials", () => {
    expect(mockLogin("wrong", "wrong")).toBe(false);
  });

  it("should handle empty username", () => {
    expect(mockLogin("", "r1card0@lv426")).toBe(false);
  });

  it("should handle empty password", () => {
    expect(mockLogin("username", "")).toBe(false);
  });

  it("should handle whitespace-only username", () => {
    expect(mockLogin("   ", "r1card0@lv426")).toBe(false);
  });

  it("should handle whitespace-only password", () => {
    expect(mockLogin("username", "   ")).toBe(false);
  });

  it("should be case-sensitive for username", () => {
    expect(mockLogin("Username", "r1card0@lv426")).toBe(false);
  });

  it("should be case-sensitive for password", () => {
    expect(mockLogin("username", "R1CARD0@LV426")).toBe(false);
  });

  it("should handle special characters in username", () => {
    expect(mockLogin("user@name", "r1card0@lv426")).toBe(false);
  });

  it("should handle special characters in password", () => {
    expect(mockLogin("username", "p@ssw0rd!")).toBe(false);
  });
});