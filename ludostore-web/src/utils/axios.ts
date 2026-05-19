import axios from "axios";
import { emitAuthExpired } from "./authEvents";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "./authTokens";

const baseURL = import.meta.env.VITE_BACKEND_API_URL;

const axiosClient = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as any;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes("/accounts/login/") ||
      originalRequest.url?.includes("/accounts/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearAuthTokens();
      emitAuthExpired();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthTokens();
      emitAuthExpired();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${baseURL}/accounts/token/refresh/`, {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token } = response.data.data;

      setAuthTokens(access_token, refresh_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      return axiosClient.request(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      emitAuthExpired();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
