import { create } from "zustand";
import { getProducts, getProduct } from "../api/products";
import { getCategories } from "../api/categories";
import type { AdminProduct, AdminCategory, Pagination } from "../types/product";

interface ProductState {
  products: AdminProduct[];
  categories: AdminCategory[];
  selectedProduct: AdminProduct | null;
  pagination: Pagination | null;
  isLoading: boolean;
  isLoadingCategories: boolean;
  error: string | null;

  fetchProducts: (page?: number, filters?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  pagination: null,
  isLoading: false,
  isLoadingCategories: false,
  error: null,

  fetchProducts: async (page = 1, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProducts(page, 20, filters);
      set({
        products: response.data.products,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch products",
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true, error: null });
    try {
      const response = await getCategories(1, 100);
      set({ categories: response.data.categories, isLoadingCategories: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch categories",
        isLoadingCategories: false,
      });
    }
  },

  fetchProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const product = await getProduct(id);
      set({ selectedProduct: product, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch product",
        isLoading: false,
      });
    }
  },

  clearSelected: () => {
    set({ selectedProduct: null });
  },
}));
