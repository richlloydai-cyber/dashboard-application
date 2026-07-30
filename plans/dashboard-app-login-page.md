# Dashboard App Login Page Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Implement a default login page for the dashboard-application with username/password fields, mock backend authentication, and a link from the main dashboard page.

**Architecture:** 
- Frontend-only implementation in the Next.js dashboard-application repo
- Login page at `/login` route with form validation
- Zustand store for auth state (login/logout/isAuthenticated)
- Mock backend with hardcoded credentials (username: "username", password: "r1card0@lv426")
- Link from Header component to `/login`
- No backend changes required (mock auth only)

**Technical Strategy:**
- Use existing Next.js App Router patterns
- Follow project's Tailwind CSS styling conventions
- Use Zustand store already present in the codebase for auth state
- Add Login form component with controlled inputs
- Implement mock authentication service in `lib/auth.ts`
- Route protection using higher-order component pattern

**Testing Blueprint:**
- **Unit Tests:** 
  - `tests/auth.test.ts` — mock auth service functions
  - `tests/Login.test.tsx` — form validation, field labels, error states
  - `tests/authStore.test.ts` — Zustand store auth state management
- **E2E Tests:**
  - User journey: Navigate to `/login` → Fill form → Submit → Redirect to dashboard
  - Invalid credentials: Show error message, stay on login page
  - Auth state persistence: Reload page, remain authenticated
- **Edge Cases:**
  - Empty form submission
  - Whitespace-only inputs
  - Special characters in credentials
  - Session persistence across page reloads
  - Logout functionality

---

## Edge Cases Identified

| # | Scenario | Expected Behavior | Test Case |
|---|----------|-------------------|-----------|
| 1 | Empty form submission | Show validation error, no redirect | `test_empty_form_shows_error` |
| 2 | Whitespace-only inputs | Trim and treat as empty | `test_whitespace_trimmed` |
| 3 | Special characters in credentials | Accept and store correctly | `test_special_chars_handled` |
| 4 | Session persistence | Auth state survives page reload | `test_session_persistence` |
| 5 | Logout clears state | `isAuthenticated` becomes false | `test_logout_clears_state` |

## Repo History Bug Fixes Considered

| Commit | Fix Description | Lesson Applied |
|--------|----------------|---------------|
| `5dcd653` | PR #3 for wire data from live Hermes had test assertions mismatch | Ensure test assertions match implementation exactly |
| `9f4a903` | Updated `/projects/api` base to `http://localhost:3801` | Check all environment-specific URLs in tests |

---

## Task 1: Create Auth Store Hook

### Objective
Create a Zustand store for authentication state management

### Files
- Create: `app/lib/authStore.ts`
- Test: `tests/authStore.test.ts`

### Step 1: Write failing test
```typescript
import { useAuthStore } from '@/lib/authStore';
import { renderHook, act } from '@testing-library/react';

describe('useAuthStore', () => {
  it('should have login and logout methods', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should track isAuthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Step 2: Run test to verify failure
Run: `npm test tests/authStore.test.ts`
Expected: FAIL — "Module not found"

### Step 3: Write minimal implementation
```typescript
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
```

### Step 4: Run test to verify pass
Run: `npm test tests/authStore.test.ts`
Expected: PASS

---

## Task 2: Create Mock Auth Service

### Objective
Implement mock authentication service with hardcoded credentials

### Files
- Create: `app/lib/mockAuth.ts`
- Test: `tests/mockAuth.test.ts`

### Step 1: Write failing test
```typescript
import { mockLogin } from '@/lib/mockAuth';

describe('mockLogin', () => {
  it('should return true for valid credentials', () => {
    expect(mockLogin('username', 'r1card0@lv426')).toBe(true);
  });

  it('should return false for invalid password', () => {
    expect(mockLogin('username', 'wrong')).toBe(false);
  });

  it('should return false for invalid username', () => {
    expect(mockLogin('wrong', 'r1card0@lv426')).toBe(false);
  });
});
```

### Step 2: Run test to verify failure
Run: `npm test tests/mockAuth.test.ts`
Expected: FAIL — "Module not found"

### Step 3: Write minimal implementation
```typescript
export const mockLogin = (username: string, password: string): boolean => {
  return username === 'username' && password === 'r1card0@lv426';
};
```

### Step 4: Run test to verify pass
Run: `npm test tests/mockAuth.test.ts`
Expected: PASS

---

## Task 3: Create Login Page Component

### Objective
Build the login page UI with form validation

### Files
- Create: `app/login/page.tsx`
- Test: `tests/Login.test.tsx`

### Step 1: Write failing test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/login/page';

describe('LoginPage', () => {
  it('renders username and password fields with labels', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation error on empty submit', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify failure
Run: `npm test tests/Login.test.tsx`
Expected: FAIL — "Module not found"

### Step 3: Write minimal implementation
(TBD - will implement after Phase 3 User approval)

### Step 4: Run test to verify pass
(TBD)

---

## Task 4: Add Login Link to Header

### Objective
Add navigation link from Header to Login page

### Files
- Modify: `app/components/Header.tsx`
- Test: `tests/Header.test.tsx` (update existing)

### Step 1: Write failing test
```typescript
it('has a link to the login page', () => {
  render(<Header />);
  expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
});
```

### Step 2: Run test to verify failure
Run: `npm test tests/Header.test.tsx`
Expected: FAIL — link not found

### Step 3: Write minimal implementation
(TBD - will implement after Phase 3 User approval)

### Step 4: Run test to verify pass
(TBD)

---

## Verification Checklist

- [ ] All unit tests written and failing (RED)
- [ ] All E2E tests written and failing (RED)
- [ ] Edge cases documented with test coverage
- [ ] Repo history bug fixes considered
- [ ] Plan reviewed and approved by User
- [ ] Tests pass after implementation (GREEN)