export interface WishlistItemProduct {
  id: string;
  name: string;
  regular_price: string;
  sale_price: string | null;
  current_price: string;
  images: Array<{
    id: string;
    image: string;
    is_primary: boolean;
  }>;
}

export interface WishlistItem {
  id: string;
  product: string;
  product_details: WishlistItemProduct;
  notes: string | null;
  added_at: string;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistResponse {
  status: string;
  message: string;
  data:
    | Wishlist
    | WishlistItem
    | { items_removed: number }
    | { is_in_wishlist: boolean };
  request_id?: string;
}

export interface AddToWishlistRequest {
  product_id: string;
  notes?: string;
}

export interface UpdateNotesRequest {
  notes: string;
}

export interface CheckWishlistResponse {
  is_in_wishlist: boolean;
  item_id?: string;
}
