import axiosClient from "../utils/axios";
import type {
  ProductsResponse,
  AdminProduct,
  ProductImage,
} from "../types/product";

export const getProducts = async (
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    category_id?: string;
    is_active?: boolean;
    low_stock?: boolean;
    search?: string;
  },
): Promise<ProductsResponse> => {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (filters?.category_id) params.category_id = filters.category_id;
  if (filters?.is_active !== undefined) params.is_active = filters.is_active;
  if (filters?.low_stock) params.low_stock = true;
  if (filters?.search) params.search = filters.search;

  const response = await axiosClient.get<ProductsResponse>(
    "/operator/products/",
    { params },
  );
  return response.data;
};

export const getProduct = async (id: string): Promise<AdminProduct> => {
  const response = await axiosClient.get<{
    status: string;
    data: AdminProduct;
  }>(`/products/${id}/`);
  return response.data.data;
};

export const createProduct = async (data: any): Promise<AdminProduct> => {
  const response = await axiosClient.post<{
    status: string;
    data: AdminProduct;
  }>("/products/operator/products/", data);
  return response.data.data;
};

export const updateProduct = async (
  id: string,
  data: any,
): Promise<AdminProduct> => {
  const response = await axiosClient.patch<{
    status: string;
    data: AdminProduct;
  }>(`/products/operator/products/${id}/`, data);
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosClient.delete(`/operator/products/${id}/delete/`);
};

export const updateProductStock = async (
  id: string,
  stockQuantity: number,
): Promise<void> => {
  await axiosClient.patch(`/products/operator/products/${id}/stock/`, {
    stock_quantity: stockQuantity,
  });
};

export const addProductImage = async (
  id: string,
  file: File,
  isPrimary: boolean = false,
): Promise<ProductImage> => {
  const formData = new FormData();
  formData.append("image", file);
  if (isPrimary) formData.append("is_primary", "true");

  const response = await axiosClient.post<{
    status: string;
    data: ProductImage;
  }>(`/operator/products/${id}/images/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};
