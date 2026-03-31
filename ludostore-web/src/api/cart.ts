import axiosClient from "../utils/axios";
import type {
  Cart,
  CartCount,
  AddToCartRequest,
  UpdateCartRequest,
  CartResponse,
} from "../types/cart";

export const getCart = async (): Promise<Cart> => {
  const response = await axiosClient.get<CartResponse>("/cart/");
  return response.data.data as Cart;
};

export const getCartCount = async (): Promise<number> => {
  const response = await axiosClient.get<CartResponse>("/cart/count/");
  return (response.data.data as CartCount).count;
};

export const addToCart = async (data: AddToCartRequest): Promise<string> => {
  const response = await axiosClient.post<CartResponse>("/cart/add/", data);
  return (response.data.data as { item_id: string }).item_id;
};

export const updateCartItem = async (
  itemId: string,
  quantity: number,
): Promise<void> => {
  await axiosClient.patch<CartResponse>(`/cart/items/${itemId}/update/`, {
    quantity,
  } as UpdateCartRequest);
};

export const removeCartItem = async (itemId: string): Promise<void> => {
  await axiosClient.delete<CartResponse>(`/cart/items/${itemId}/`);
};

export const removeProductFromCart = async (
  productId: string,
): Promise<void> => {
  await axiosClient.delete<CartResponse>(`/cart/products/${productId}/`);
};

export const clearCart = async (): Promise<number> => {
  const response = await axiosClient.delete<CartResponse>("/cart/clear/");
  return (response.data.data as { items_removed: number }).items_removed;
};
