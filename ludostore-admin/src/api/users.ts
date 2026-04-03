import axiosClient from "../utils/axios";
import type { AdminUserItem } from "../types/user";

interface UsersResponse {
  status: string;
  data: {
    users: AdminUserItem[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export const getUsers = async (
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    role?: string;
    account_status?: string;
    search?: string;
  },
): Promise<UsersResponse> => {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (filters?.role) params.role = filters.role;
  if (filters?.account_status) params.account_status = filters.account_status;
  if (filters?.search) params.search = filters.search;

  const response = await axiosClient.get<UsersResponse>("/operator/users/", {
    params,
  });
  return response.data;
};

export const updateUserStatus = async (
  userId: string,
  accountStatus: "active" | "blocked",
  blockReason?: string,
): Promise<void> => {
  await axiosClient.patch(`/operator/users/${userId}/status/`, {
    account_status: accountStatus,
    block_reason: blockReason,
  });
};

export const updateUserRole = async (
  userId: string,
  role: "operator" | "customer",
): Promise<void> => {
  await axiosClient.patch(`/operator/users/${userId}/role/`, { role });
};
