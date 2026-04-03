import axiosClient from "../utils/axios";
import type { CategoriesResponse, AdminCategory } from "../types/product";

export const getCategories = async (
  page: number = 1,
  pageSize: number = 100,
): Promise<CategoriesResponse> => {
  const response = await axiosClient.get<CategoriesResponse>(
    "/products/categories/",
    {
      params: { page, page_size: pageSize },
    },
  );
  return response.data;
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  is_active?: boolean;
}): Promise<AdminCategory> => {
  const response = await axiosClient.post<{
    status: string;
    data: AdminCategory;
  }>("/products/operator/categories/", data);
  return response.data.data;
};

export const updateCategory = async (
  id: string,
  data: any,
): Promise<AdminCategory> => {
  const response = await axiosClient.patch<{
    status: string;
    data: AdminCategory;
  }>(`/products/operator/categories/${id}/`, data);
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosClient.delete(`/products/operator/categories/${id}/delete/`);
};
