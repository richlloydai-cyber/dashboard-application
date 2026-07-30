// ============================================================
// HERMES DASHBOARD - LOGIN PAGE TESTS
// ============================================================

import { describe, it, expect, vi } from "vitest";
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

describe("<LoginPage />", () => {
  it("renders the login form with email, password fields and a submit button", () => {
    const { onSubmit } = setup();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders a 'remember me' checkbox", () => {
    setup();
    expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument();
  });

  it("shows inline error messages when fields are left empty and form is submitted", async () => {
    const { user } = setup();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows an inline error when the email format is invalid", async () => {
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, "not-an-email");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("calls onLogin with the entered credentials when form is valid", async () => {
    const { user, onSubmit } = setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "rich@hermes.io");
    await user.type(passwordInput, "secret123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "rich@hermes.io",
        password: "secret123",
        rememberMe: false,
      });
    });
  });

  it("includes rememberMe in onLogin payload when checkbox is checked", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText(/email/i), "a@b.c");
    await user.type(screen.getByLabelText(/password/i), "pw");
    fireEvent.click(screen.getByRole("checkbox", { name: /remember me/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "a@b.c",
        password: "pw",
        rememberMe: true,
      });
    });
  });

  it("disables the submit button and shows loading while authenticating", async () => {
    const onSubmit = vi.fn().mockImplementation(() => new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    render(<LoginPage onLogin={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "a@b.c");
    await user.type(screen.getByLabelText(/password/i), "pw");
    const submitBtn = screen.getByRole("button", { name: /sign in/i }) as HTMLButtonElement;

    // Begin login — button should disable immediately.
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();
  });

  it("shows a generic error when onLogin rejects", async () => {
    const badOnSubmit = vi.fn().mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup();
    render(<LoginPage onLogin={badOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "a@b.c");
    await user.type(screen.getByLabelText(/password/i), "badpw");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});