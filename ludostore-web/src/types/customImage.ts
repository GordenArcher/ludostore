export interface CustomImage {
  image: string;
  index: number;
}

export interface CustomImageUploadResponse {
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
