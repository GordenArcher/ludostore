import { create } from "zustand";
import axiosClient from "../utils/axios";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/auth";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  checkAuth: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setAuthenticated: (status: boolean, user?: User) => void;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // Try to fetch user data, this will determine if we're authenticated
      await get().fetchUser();
      set({ isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  },

  fetchUser: async () => {
    try {
      const response =
        await axiosClient.get<ApiSuccessResponse<User>>("/accounts/me/");

      if (response.data) {
        const user = response.data.data;
        set({ user, isAuthenticated: true });
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        set({
          error: errorData.message || "Failed to fetch user",
          isAuthenticated: false,
          user: null,
        });
      } else {
        set({
          error: "Network error",
          isAuthenticated: false,
          user: null,
        });
      }
      throw error;
    }
  },

  setAuthenticated: (status: boolean, user?: User) => {
    set({
      isAuthenticated: status,
      user: user || null,
      error: null,
    });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axiosClient.post("/accounts/logout/");
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Even if logout fails, clear local state
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  },

  clearAuth: () => {
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  },
}));
