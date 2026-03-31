import axiosClient from "../utils/axios";
import type {
  Wishlist,
  WishlistItem,
  AddToWishlistRequest,
  UpdateNotesRequest,
  CheckWishlistResponse,
  WishlistResponse,
} from "../types/wishlist";

export const getWishlist = async (): Promise<Wishlist> => {
  const response = await axiosClient.get<WishlistResponse>("/wishlist/");
  return response.data.data as Wishlist;
};

export const addToWishlist = async (
  data: AddToWishlistRequest,
): Promise<WishlistItem> => {
  const response = await axiosClient.post<WishlistResponse>(
    "/wishlist/add/",
    data,
  );
  return response.data.data as WishlistItem;
};

export const removeWishlistItem = async (itemId: string): Promise<void> => {
  const response = await axiosClient.delete<WishlistResponse>(
    `/wishlist/items/${itemId}/`,
  );
  return;
};

export const removeProductFromWishlist = async (
  productId: string,
): Promise<void> => {
  const response = await axiosClient.delete<WishlistResponse>(
    `/wishlist/products/${productId}/`,
  );
  return;
};

export const updateWishlistItemNotes = async (
  itemId: string,
  data: UpdateNotesRequest,
): Promise<WishlistItem> => {
  const response = await axiosClient.patch<WishlistResponse>(
    `/wishlist/items/${itemId}/notes/`,
    data,
  );
  return response.data.data as WishlistItem;
};

export const clearWishlist = async (): Promise<number> => {
  const response =
    await axiosClient.delete<WishlistResponse>("/wishlist/clear/");
  return (response.data.data as { items_removed: number }).items_removed;
};

export const checkInWishlist = async (
  productId: string,
): Promise<CheckWishlistResponse> => {
  const response = await axiosClient.get<WishlistResponse>(
    `/wishlist/check/${productId}/`,
  );
  return response.data.data as CheckWishlistResponse;
};
