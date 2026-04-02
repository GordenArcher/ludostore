import axiosClient from "../utils/axios";

export interface CustomizationImagesResponse {
  status: string;
  message: string;
  http_status: number;
  data: {
    item_id: string;
    product_name: string;
    customization_images: string[];
    total_images: number;
    remaining_slots: number;
    can_upload: boolean;
    can_delete: boolean;
  };
  request_id: string;
}

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    item_id: string;
    customization_images: string[];
    uploaded: string[];
    total_images: number;
    remaining_slots: number;
  };
}

export const getCustomizationImages = async (
  orderId: string,
  itemId: string,
): Promise<CustomizationImagesResponse> => {
  const response = await axiosClient.get<CustomizationImagesResponse>(
    `/orders/${orderId}/items/${itemId}/images/`,
  );
  return response.data;
};

export const uploadCustomizationImages = async (
  orderId: string,
  itemId: string,
  files: File[],
): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axiosClient.post<UploadResponse>(
    `/orders/${orderId}/items/${itemId}/images/upload/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deleteCustomizationImage = async (
  orderId: string,
  itemId: string,
  imageIndex: number,
): Promise<void> => {
  await axiosClient.delete(
    `/orders/${orderId}/items/${itemId}/images/${imageIndex}/`,
  );
};
