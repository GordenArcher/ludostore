export interface OrderItem {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  product_image: string;
  quantity: number;
  price_at_purchase: string;
  subtotal: string;
}

export interface ShippingAddress {
  id: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  apartment: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  shipping_address: ShippingAddress;
  subtotal: string;
  shipping_fee: string;
  tax: string;
  discount: string;
  total: string;
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  payment_method: "cash" | "paystack";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  customer_note: string;
  items: OrderItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface CheckoutRequest {
  address_id: string;
  payment_method: "cash" | "paystack";
  customer_note?: string;
}

export interface PaymentData {
  authorization_url: string;
  reference: string;
}

export interface CheckoutResponse {
  status: string;
  message: string;
  data: {
    order: Order;
    payment?: PaymentData;
  };
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface OrderListResponse {
  status: string;
  message: string;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}
