// Test-environment type shims.
// Provides vitest globals (describe/it/expect/vi) + jest-dom matchers
// for tsconfig.test.json. Must be a real module (export {}).
export {};
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />
