import { create } from "zustand";
import {
  getOrders,
  getOrderById,
  cancelOrder,
  verifyPayment,
} from "../api/order";
import type { Order } from "../types/order";

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  isCancelling: boolean;
  isVerifying: boolean;
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  error: string | null;

  fetchOrders: (page?: number) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  verifyPayment: (reference: string) => Promise<Order | null>;
  clearSelectedOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  isCancelling: false,
  isVerifying: false,
  pagination: null,
  error: null,

  fetchOrders: async (page: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getOrders(page);
      set({
        orders: response.data.orders,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await getOrderById(orderId);
      set({ selectedOrder: order, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch order",
        isLoading: false,
      });
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ isCancelling: true, error: null });
    try {
      const cancelledOrder = await cancelOrder(orderId);

      // Update orders list
      const { orders } = get();
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? cancelledOrder : order,
      );

      set({
        orders: updatedOrders,
        selectedOrder: cancelledOrder,
        isCancelling: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to cancel order",
        isCancelling: false,
      });
      return false;
    }
  },

  verifyPayment: async (reference: string) => {
    set({ isVerifying: true, error: null });
    try {
      const order = await verifyPayment(reference);
      set({ selectedOrder: order, isVerifying: false });
      return order;
    } catch (error: any) {
      set({
        error: error.message || "Payment verification failed",
        isVerifying: false,
      });
      return null;
    }
  },

  clearSelectedOrder: () => {
    set({ selectedOrder: null });
  },
}));
