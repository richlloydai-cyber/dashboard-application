// ============================================================
// AUTH STORE - Zustand store for authentication state management
// ============================================================

import { create } from "zustand";

export interface User {
  username: string;
  role: "admin" | "user";
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  login: (credentials: { username: string; password: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  error: null,
  login: (credentials) => {
    // This will be implemented after tests are verified
    set({ isAuthenticated: true, user: null, error: null });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null, error: null });
  },
}));