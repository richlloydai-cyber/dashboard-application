// ============================================================
// MOCK AUTH SERVICE - Mock authentication with hardcoded credentials
// ============================================================

const VALID_USERNAME = "username";
const VALID_EMAIL = "username@test.com";
const VALID_PASSWORD = "r1card0@lv426";

/**
 * Mock login function that validates credentials against hardcoded values.
 * Accepts both username and email as the first parameter.
 * @param usernameOrEmail - The username or email to validate
 * @param password - The password to validate
 * @returns true if credentials are valid, false otherwise
 */
export const mockLogin = (usernameOrEmail: string, password: string): boolean => {
  // Trim whitespace and check credentials
  const trimmedUsernameOrEmail = usernameOrEmail.trim();
  const trimmedPassword = password.trim();
  
  // Accept either username or email
  return (
    trimmedUsernameOrEmail === VALID_USERNAME || 
    trimmedUsernameOrEmail === VALID_EMAIL
  ) && trimmedPassword === VALID_PASSWORD;
};