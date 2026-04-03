export interface AdminOrder {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  total: string;
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  payment_method: "cash" | "paystack";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  items_count: number;
}

export interface AdminOrderDetail extends AdminOrder {
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  shipping_address: {
    recipient_name: string;
    phone_number: string;
    street_address: string;
    apartment: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  subtotal: string;
  shipping_fee: string;
  tax: string;
  discount: string;
  paystack_reference: string | null;
  customer_note: string;
  admin_note: string;
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    price_at_purchase: string;
    subtotal: string;
    customization_images: string[];
  }>;
  paid_at: string | null;
}
