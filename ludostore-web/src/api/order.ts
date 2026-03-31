import axiosClient from "../utils/axios";
import type {
  Order,
  CheckoutRequest,
  CheckoutResponse,
  VerifyPaymentRequest,
  OrderListResponse,
} from "../types/order";

export const checkout = async (
  data: CheckoutRequest,
): Promise<CheckoutResponse> => {
  const response = await axiosClient.post<CheckoutResponse>(
    "/orders/checkout/",
    data,
  );
  return response.data;
};

export const verifyPayment = async (reference: string): Promise<Order> => {
  const response = await axiosClient.post<CheckoutResponse>(
    "/orders/verify-payment/",
    {
      reference,
    } as VerifyPaymentRequest,
  );
  return response.data.data.order;
};

export const getOrders = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<OrderListResponse> => {
  const response = await axiosClient.get<OrderListResponse>("/orders/", {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await axiosClient.get<{
    status: string;
    message: string;
    data: Order;
  }>(`/orders/${orderId}/`);
  return response.data.data;
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order> => {
  const response = await axiosClient.get<{
    status: string;
    message: string;
    data: Order;
  }>(`/orders/number/${orderNumber}/`);
  return response.data.data;
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const response = await axiosClient.post<{
    status: string;
    message: string;
    data: { order: Order };
  }>(`/orders/${orderId}/cancel/`);
  return response.data.data.order;
};
