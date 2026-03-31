import axiosClient from "../utils/axios";
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types/profile";

export const getProfile = async (): Promise<Profile> => {
  const response = await axiosClient.get<{
    status: string;
    message: string;
    data: Profile;
  }>("/accounts/me/");
  return response.data.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest,
): Promise<Profile> => {
  const response = await axiosClient.patch<{
    status: string;
    message: string;
    data: Profile;
  }>("/accounts/me/", data);
  return response.data.data;
};

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<void> => {
  await axiosClient.post("/accounts/password/change/", data);
};
