import axiosClient from "../utils/axios";
import type {
  LoginRequest,
  RegisterRequest,
  ApiSuccessResponse,
  LoginResponseData,
  RegisterResponseData,
} from "../types/auth";

export const login = async (
  data: LoginRequest,
): Promise<ApiSuccessResponse<LoginResponseData>> => {
  const response = await axiosClient.post<
    ApiSuccessResponse<LoginResponseData>
  >("/accounts/login/", data);
  return response.data;
};

export const register = async (
  data: RegisterRequest,
): Promise<ApiSuccessResponse<RegisterResponseData>> => {
  const response = await axiosClient.post<
    ApiSuccessResponse<RegisterResponseData>
  >("/accounts/register/", data);
  return response.data;
};

export interface VerifyOtpRequest {
  otp_code: string;
}

export interface VerifyOtpResponse {
  message: string;
}

export const verifyOtp = async (
  data: VerifyOtpRequest,
): Promise<ApiSuccessResponse<VerifyOtpResponse>> => {
  const response = await axiosClient.post<
    ApiSuccessResponse<VerifyOtpResponse>
  >("/accounts/otp/verify/", data);
  return response.data;
};
