import { create } from "zustand";
import { productsAPI } from "../api/products";
import type { Product, Category, Pagination } from "../types/product";

interface ProductState {
  products: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  selectedCategory: Category | null;
  pagination: Pagination | null;

  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingProduct: boolean;
  isUpdating: boolean;

  error: string | null;

  filters: {
    priceRange: { min: number; max: number };
    inStockOnly: boolean;
    sortBy: string;
  };

  setSortBy: (sort: string) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setInStockOnly: (inStock: boolean) => void;

  currentPage: number;
  pageSize: number;
  categoryId: string | null;
  searchQuery: string;
  featuredOnly: boolean;

  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (productId: string) => Promise<void>;
  fetchCategoryById: (categoryId: string) => Promise<void>;
  setPage: (page: number) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFeaturedOnly: (featured: boolean) => void;
  clearFilters: () => void;
  reset: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  selectedCategory: null,
  pagination: null,
  isLoadingProducts: false,
  isLoadingCategories: false,
  isLoadingProduct: false,
  isUpdating: false,
  error: null,
  currentPage: 1,
  pageSize: 12,
  categoryId: null,
  searchQuery: "",
  featuredOnly: false,

  filters: {
    priceRange: { min: 0, max: 10000 },
    inStockOnly: false,
    sortBy: "-created_at",
  },

  setSortBy: (sort: string) => {
    set({
      filters: { ...get().filters, sortBy: sort },
      currentPage: 1,
    });
    get().fetchProducts();
  },

  setPriceRange: (range: { min: number; max: number }) => {
    set({
      filters: { ...get().filters, priceRange: range },
      currentPage: 1,
    });
    get().fetchProducts();
  },

  setInStockOnly: (inStock: boolean) => {
    set({
      filters: { ...get().filters, inStockOnly: inStock },
      currentPage: 1,
    });
    get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ isLoadingProducts: true, error: null });

    const {
      currentPage,
      pageSize,
      categoryId,
      searchQuery,
      featuredOnly,
      filters,
    } = get();

    try {
      const response = await productsAPI.getProducts({
        page: currentPage,
        page_size: pageSize,
        category_id: categoryId || undefined,
        search: searchQuery || undefined,
        featured: featuredOnly || undefined,
        min_price:
          filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
        max_price:
          filters.priceRange.max < 10000 ? filters.priceRange.max : undefined,
        in_stock: filters.inStockOnly || undefined,
        sort: filters.sortBy,
      });

      if (response.status === "success") {
        set({
          products: response.data.products,
          pagination: response.data.pagination,
          isLoadingProducts: false,
        });
      } else {
        set({
          error: response.message,
          isLoadingProducts: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch products",
        isLoadingProducts: false,
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true, error: null });

    try {
      const response = await productsAPI.getCategories({
        page_size: 100,
      });

      if (response.status === "success") {
        set({
          categories: response.data.categories,
          isLoadingCategories: false,
        });
      } else {
        set({
          error: response.message,
          isLoadingCategories: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch categories",
        isLoadingCategories: false,
      });
    }
  },

  fetchProductById: async (productId: string) => {
    set({ isLoadingProduct: true, error: null });

    try {
      const response = await productsAPI.getProduct(productId);

      if (response.status === "success") {
        set({
          selectedProduct: response.data,
          isLoadingProduct: false,
        });
      } else {
        set({
          error: response.message,
          isLoadingProduct: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch product",
        isLoadingProduct: false,
      });
    }
  },

  fetchCategoryById: async (categoryId: string) => {
    set({ isLoadingCategories: true, error: null });

    try {
      const response = await productsAPI.getCategory(categoryId);

      if (response.status === "success") {
        set({
          selectedCategory: response.data,
          isLoadingCategories: false,
        });
      } else {
        set({
          error: response.message,
          isLoadingCategories: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch category",
        isLoadingCategories: false,
      });
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchProducts();
  },

  setCategoryFilter: (categoryId: string | null) => {
    set({ categoryId, currentPage: 1 });
    get().fetchProducts();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchProducts();
  },

  setFeaturedOnly: (featured: boolean) => {
    set({ featuredOnly: featured, currentPage: 1 });
    get().fetchProducts();
  },

  clearFilters: () => {
    set({
      categoryId: null,
      searchQuery: "",
      featuredOnly: false,
      filters: {
        priceRange: { min: 0, max: 10000 },
        inStockOnly: false,
        sortBy: "-created_at",
      },
      currentPage: 1,
    });
    get().fetchProducts();
  },

  reset: () => {
    set({
      products: [],
      categories: [],
      selectedProduct: null,
      selectedCategory: null,
      pagination: null,
      isLoadingProducts: false,
      isLoadingCategories: false,
      isLoadingProduct: false,
      isUpdating: false,
      error: null,
      currentPage: 1,
      pageSize: 12,
      categoryId: null,
      searchQuery: "",
      featuredOnly: false,
    });
  },
}));
