import { create } from "zustand";
import { getProfile, updateProfile, changePassword } from "../api/profile";
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types/profile";

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedProfile = await updateProfile(data);
      set({ profile: updatedProfile, isUpdating: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to update profile",
        isUpdating: false,
      });
      return false;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    set({ isUpdating: true, error: null });
    try {
      await changePassword(data);
      set({ isUpdating: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to change password",
        isUpdating: false,
      });
      return false;
    }
  },
}));
