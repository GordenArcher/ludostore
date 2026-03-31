import axiosClient from "../utils/axios";
import type {
  ProductsResponse,
  CategoriesResponse,
  ProductResponse,
  CategoryResponse,
} from "../types/product";

export const productsAPI = {
  // Get all products with pagination and filters
  getProducts: async (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    ordering?: string;
  }): Promise<ProductsResponse> => {
    const response = await axiosClient.get<ProductsResponse>("/products/", {
      params,
    });
    return response.data;
  },

  // Get single product by ID
  getProduct: async (productId: string): Promise<ProductResponse> => {
    const response = await axiosClient.get<ProductResponse>(
      `/products/${productId}/`,
    );
    return response.data;
  },

  // Get all categories
  getCategories: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<CategoriesResponse> => {
    const response = await axiosClient.get<CategoriesResponse>(
      "/products/categories/",
      { params },
    );
    return response.data;
  },

  // Get single category by ID
  getCategory: async (categoryId: string): Promise<CategoryResponse> => {
    const response = await axiosClient.get<CategoryResponse>(
      `/products/categories/${categoryId}/`,
    );
    return response.data;
  },
};
