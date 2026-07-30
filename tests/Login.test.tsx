// ============================================================
// LOGIN PAGE E2E/INTEGRATION TESTS
// Following the 4-phase TDD workflow from plans/dashboard-app-login-page.md
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/app/login/page";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function setup() {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  const result = render(<LoginPage onLogin={onSubmit} />);
  return { ...result, onSubmit, user };
}

// -------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------

describe("<LoginPage /> (E2E-style integration tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields with labels", () => {
    render(<LoginPage onLogin={async () => {}} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows validation error on empty submit", async () => {
    const { user } = setup();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when email is whitespace-only", async () => {
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, "   ");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when email format is invalid", async () => {
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, "not-an-email");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("handles special characters in credentials", async () => {
    const { user, onSubmit } = setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "user@test.com");
    await user.type(passwordInput, "p@ssw0rd!");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "p@ssw0rd!",
        rememberMe: false,
      });
    });
  });

  it("submits form with valid credentials", async () => {
    const { user, onSubmit } = setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it("shows error message when login fails", async () => {
    const badOnSubmit = vi.fn().mockRejectedValue(new Error("Invalid credentials"));
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("disables submit button during authentication", async () => {
    const slowOnSubmit = vi.fn().mockImplementation(() => new Promise(() => {}));
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password");

    const submitBtn = screen.getByRole("button", { name: /sign in/i }) as HTMLButtonElement;
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
  });

  it("clears error when user starts typing again", async () => {
    const badOnSubmit = vi.fn().mockRejectedValue(new Error("Invalid credentials"));
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);

    // Trigger an error
    await user.type(emailInput, "test@example.com");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Clear the error by typing again
    await user.clear(emailInput);
    await user.type(emailInput, "new@example.com");

    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });

  it("includes rememberMe in onLogin payload when checkbox is checked", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    fireEvent.click(screen.getByRole("checkbox", { name: /remember me/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        rememberMe: true,
      });
    });
  });
});