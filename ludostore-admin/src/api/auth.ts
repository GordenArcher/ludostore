import axiosClient from "../utils/axios";
import { setAuthTokens } from "../utils/authTokens";
import type {
  AdminLoginRequest,
  AdminAuthResponse,
  AdminUser,
} from "../types/auth";

export const adminLogin = async (
  data: AdminLoginRequest,
): Promise<AdminAuthResponse> => {
  const response = await axiosClient.post<AdminAuthResponse>(
    "/accounts/operator/login/",
    data,
  );

  const { access_token, refresh_token } = response.data.data;
  if (access_token && refresh_token) {
    setAuthTokens(access_token, refresh_token);
  }

  return response.data;
};

export const adminLogout = async (): Promise<void> => {
  await axiosClient.post("/accounts/logout/");
};

export const getAdminProfile = async (): Promise<AdminUser> => {
  const response = await axiosClient.get<{
    status: string;
    data: AdminUser;
  }>("/accounts/me/");
  return response.data.data;
};
