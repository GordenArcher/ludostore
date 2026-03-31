import { create } from "zustand";
import { useAuthStore } from "./authStore";
import {
  getCart,
  getCartCount,
  addToCart as apiAddToCart,
  updateCartItem,
  removeCartItem,
  clearCart as apiClearCart,
} from "../api/cart";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartCount,
} from "../utils/cart/guestCart";
import type { Cart } from "../types/cart";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isAdding: boolean;
  isSyncing: boolean;
  error: string | null;
  itemCount: number;
  hasInitialized: boolean;

  fetchCart: () => Promise<void>;
  fetchCartCount: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    price?: string,
  ) => Promise<boolean>;
  updateQuantity: (
    itemId: string,
    productId: string,
    quantity: number,
  ) => Promise<void>;
  removeItem: (itemId: string, productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  initialize: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isAdding: false,
  isSyncing: false,
  error: null,
  itemCount: 0,
  hasInitialized: false,

  initialize: async () => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();

    // Wait for auth to finish loading
    if (isAuthLoading) {
      set({ isLoading: true });
      // Poll until auth is done
      const checkAuth = setInterval(() => {
        const { isLoading: authLoading } = useAuthStore.getState();
        if (!authLoading) {
          clearInterval(checkAuth);
          get().fetchCart();
        }
      }, 100);
      return;
    }

    await get().fetchCart();
    set({ hasInitialized: true });
  },

  fetchCart: async () => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();

    // If auth is still loading, wait
    if (isAuthLoading) {
      set({ isLoading: true });
      return;
    }

    if (!isAuthenticated) {
      const guestCart = getGuestCart();
      const itemCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      set({ cart: null, itemCount, isLoading: false, hasInitialized: true });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await getCart();
      set({
        cart,
        itemCount: cart.total_items,
        isLoading: false,
        hasInitialized: true,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch cart",
        isLoading: false,
        hasInitialized: true,
      });
    }
  },

  fetchCartCount: async () => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();

    if (isAuthLoading) return;

    if (!isAuthenticated) {
      const count = getGuestCartCount();
      set({ itemCount: count });
      return;
    }

    try {
      const count = await getCartCount();
      set({ itemCount: count });
    } catch (error) {
      // Silent fail
    }
  },

  addToCart: async (productId: string, quantity: number, price?: string) => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();
    set({ isAdding: true, error: null });

    try {
      if (!isAuthenticated || isAuthLoading) {
        addToGuestCart(productId, quantity, price || "0");
        const count = getGuestCartCount();
        set({ itemCount: count, isAdding: false });
        return true;
      }

      await apiAddToCart({ product_id: productId, quantity });
      await get().fetchCart();
      set({ isAdding: false });
      return true;
    } catch (error: any) {
      set({ error: error.message || "Failed to add to cart", isAdding: false });
      return false;
    }
  },

  updateQuantity: async (
    itemId: string,
    productId: string,
    quantity: number,
  ) => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();
    set({ isLoading: true, error: null });

    try {
      if (!isAuthenticated || isAuthLoading) {
        updateGuestCartQuantity(productId, quantity);
        const count = getGuestCartCount();
        set({ itemCount: count, isLoading: false });
        return;
      }

      await updateCartItem(itemId, quantity);
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to update quantity",
        isLoading: false,
      });
    }
  },

  removeItem: async (itemId: string, productId: string) => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();
    set({ isLoading: true, error: null });

    try {
      if (!isAuthenticated || isAuthLoading) {
        removeFromGuestCart(productId);
        const count = getGuestCartCount();
        set({ itemCount: count, isLoading: false });
        return;
      }

      await removeCartItem(itemId);
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove item",
        isLoading: false,
      });
    }
  },

  clearCart: async () => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();
    set({ isLoading: true, error: null });

    try {
      if (!isAuthenticated || isAuthLoading) {
        clearGuestCart();
        set({ cart: null, itemCount: 0, isLoading: false });
        return;
      }

      await apiClearCart();
      set({ cart: null, itemCount: 0, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to clear cart", isLoading: false });
    }
  },

  syncGuestCart: async () => {
    const { isAuthenticated, isLoading: isAuthLoading } =
      useAuthStore.getState();
    const guestCart = getGuestCart();

    if (isAuthLoading || !isAuthenticated || guestCart.length === 0) return;

    set({ isSyncing: true });

    try {
      for (const item of guestCart) {
        await apiAddToCart({
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
      clearGuestCart();
      await get().fetchCart();
    } catch (error) {
      console.error("Failed to sync guest cart", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  getItemQuantity: (productId: string) => {
    const { cart, isAuthenticated } = get();
    const { isLoading: isAuthLoading } = useAuthStore.getState();

    if (isAuthLoading || !isAuthenticated) {
      const guestCart = getGuestCart();
      const item = guestCart.find((i) => i.product_id === productId);
      return item?.quantity || 0;
    }

    if (!cart) return 0;
    const item = cart.items.find((i) => i.product === productId);
    return item?.quantity || 0;
  },
}));
