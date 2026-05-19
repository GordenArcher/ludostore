import { create } from "zustand";
import { getAdminProfile, adminLogout } from "../api/auth";
import type { AdminUser } from "../types/auth";
import { clearAuthTokens } from "../utils/authTokens";

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  fetchUser: async () => {
    try {
      const user = await getAdminProfile();
      set({ user: user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await adminLogout();
    } catch {
      // Ignore
    } finally {
      clearAuthTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearAuth: () => {
    clearAuthTokens();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));
