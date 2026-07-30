// ============================================================
// HERMES DASHBOARD - LOGIN PAGE
// ============================================================

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginPageProps {
  onLogin: (creds: LoginCredentials) => Promise<void> | void;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    return errors;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const errors = validate();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setLoading(true);
      try {
        await onLogin({ email: email.trim(), password, rememberMe });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password, rememberMe, onLogin, validate]
  );

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) setFieldErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
        }}
        error={fieldErrors.email ?? undefined}
        data-testid="email-input"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password) setFieldErrors((prev) => { const next = { ...prev }; delete next.password; return next; });
        }}
        error={fieldErrors.password ?? undefined}
        data-testid="password-input"
      />
      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          data-testid="remember-checkbox"
        />
        Remember me
      </label>
      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} data-testid="submit-btn">
        Sign in
      </Button>
    </form>
  );
}