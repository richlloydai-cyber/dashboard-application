// ============================================================
// VITEST SETUP
// Shared test environment: jsdom globals, testing-library
// DOM matchers, and fetch + crypto mocks (browser APIs the
// dashboard touches but jsdom lacks).
// ============================================================

import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Reset the DOM between tests.
afterEach(() => {
  cleanup();
});

// jsdom has no crypto.randomUUID — the api client calls it on every request.
if (!("crypto" in globalThis) || !("randomUUID" in (globalThis as any).crypto)) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () =>
        `test-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
    },
    configurable: true,
  });
}

// jsdom lacks fetch — provide a resettable stub so tests control responses.
if (!("fetch" in globalThis)) {
  (globalThis as any).fetch = vi.fn();
}
