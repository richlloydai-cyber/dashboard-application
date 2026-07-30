// ============================================================
// MOCK AUTH SERVICE - Mock authentication with hardcoded credentials
// ============================================================

const VALID_USERNAME = "username";
const VALID_PASSWORD = "r1card0@lv426";

/**
 * Mock login function that validates credentials against hardcoded values.
 * @param username - The username to validate
 * @param password - The password to validate
 * @returns true if credentials are valid, false otherwise
 */
export const mockLogin = (username: string, password: string): boolean => {
  // Trim whitespace and check credentials
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  
  return trimmedUsername === VALID_USERNAME && trimmedPassword === VALID_PASSWORD;
};