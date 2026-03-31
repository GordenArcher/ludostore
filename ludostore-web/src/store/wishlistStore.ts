import { create } from "zustand";
import {
  getWishlist,
  addToWishlist,
  removeProductFromWishlist,
  updateWishlistItemNotes,
  clearWishlist,
  checkInWishlist,
} from "../api/wishlist";
import type { Wishlist, WishlistItem } from "../types/wishlist";

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  isAdding: boolean;
  error: string | null;

  fetchWishlist: () => Promise<void>;
  addToWishlist: (
    productId: string,
    notes?: string,
  ) => Promise<WishlistItem | null>;
  removeFromWishlist: (productId: string) => Promise<void>;
  updateNotes: (itemId: string, notes: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkInWishlist: (productId: string) => Promise<boolean>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: null,
  isLoading: false,
  isAdding: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await getWishlist();
      set({ wishlist, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch wishlist",
        isLoading: false,
      });
    }
  },

  addToWishlist: async (productId: string, notes?: string) => {
    set({ isAdding: true, error: null });
    try {
      const newItem = await addToWishlist({ product_id: productId, notes });

      const currentWishlist = get().wishlist;
      if (currentWishlist) {
        set({
          wishlist: {
            ...currentWishlist,
            items: [newItem, ...currentWishlist.items],
            total_items: currentWishlist.total_items + 1,
          },
          isAdding: false,
        });
      } else {
        set({ isAdding: false });
      }

      return newItem;
    } catch (error: any) {
      set({
        error: error.message || "Failed to add to wishlist",
        isAdding: false,
      });
      return null;
    }
  },

  removeFromWishlist: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      await removeProductFromWishlist(productId);

      const currentWishlist = get().wishlist;
      if (currentWishlist) {
        set({
          wishlist: {
            ...currentWishlist,
            items: currentWishlist.items.filter(
              (item) => item.product !== productId,
            ),
            total_items: currentWishlist.total_items - 1,
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove from wishlist",
        isLoading: false,
      });
    }
  },

  updateNotes: async (itemId: string, notes: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await updateWishlistItemNotes(itemId, { notes });

      const currentWishlist = get().wishlist;
      if (currentWishlist) {
        set({
          wishlist: {
            ...currentWishlist,
            items: currentWishlist.items.map((item) =>
              item.id === itemId ? updatedItem : item,
            ),
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to update notes",
        isLoading: false,
      });
    }
  },

  clearWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearWishlist();
      set({ wishlist: null, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to clear wishlist",
        isLoading: false,
      });
    }
  },

  checkInWishlist: async (productId: string): Promise<boolean> => {
    try {
      const result = await checkInWishlist(productId);
      return result.is_in_wishlist;
    } catch (error) {
      return false;
    }
  },
}));
