import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

// Vitest config for the Hermes dashboard frontend.
// - jsdom environment (React components render against the DOM)
// - v8 coverage, with a hard 90% gate (Richard's standard)
// - @/* path alias matching tsconfig.json
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      reportsDirectory: "./coverage",
      // Source we measure coverage against.
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/components/**/*.{ts,tsx}",
        "src/app/**/*.{ts,tsx}",
      ],
      // Exclude pure type/declaration files and barrel exports.
      exclude: [
        "src/types/**",
        "src/**/*.d.ts",
        "src/app/layout.tsx",
        "src/app/globals.css",
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
