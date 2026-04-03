export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: string;
  };
  products: {
    total: number;
    low_stock: number;
    out_of_stock: number;
  };
  users: {
    total: number;
    active: number;
    blocked: number;
  };
  recent_orders: Array<{
    id: string;
    order_number: string;
    total: string;
    order_status: string;
    payment_status: string;
    customer_email: string;
    customer_name: string;
    created_at: string;
  }>;
  recent_users: Array<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    account_status: string;
    role: string;
    date_joined: string;
  }>;
}

export interface RevenueChartData {
  labels: string[];
  revenue: number[];
  orders_count: number[];
  total: string;
  period: string;
}
