export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  regular_price: string;
  sale_price: string | null;
  current_price: string;
  images: Array<{
    id: string;
    image: string;
    is_primary: boolean;
  }>;
}

export interface CartItem {
  id: string;
  product: string;
  product_details: CartItemProduct;
  quantity: number;
  price_at_add: string;
  subtotal: string;
  added_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface CartCount {
  count: number;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export interface CartResponse {
  status: string;
  message: string;
  data:
    | Cart
    | CartCount
    | { item_id: string }
    | { items_removed: number }
    | null;
  http_status?: number;
  code?: string;
  errors?: any;
}
