import axiosClient from "../utils/axios";
import type { AdminOrder, AdminOrderDetail } from "../types/order";

interface OrdersResponse {
  status: string;
  data: {
    orders: AdminOrder[];
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

export const getOrders = async (
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    order_status?: string;
    payment_status?: string;
    search?: string;
  },
): Promise<OrdersResponse> => {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (filters?.order_status) params.order_status = filters.order_status;
  if (filters?.payment_status) params.payment_status = filters.payment_status;
  if (filters?.search) params.search = filters.search;

  const response = await axiosClient.get<OrdersResponse>("/operator/orders/", {
    params,
  });
  return response.data;
};

export const getOrderDetail = async (
  orderId: string,
): Promise<AdminOrderDetail> => {
  const response = await axiosClient.get<{
    status: string;
    data: AdminOrderDetail;
  }>(`/operator/orders/${orderId}/`);
  return response.data.data;
};

export const updateOrderStatus = async (
  orderId: string,
  orderStatus: string,
  adminNote?: string,
): Promise<void> => {
  await axiosClient.patch(`/operator/orders/${orderId}/status/`, {
    order_status: orderStatus,
    admin_note: adminNote,
  });
};
