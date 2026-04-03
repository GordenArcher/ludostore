export interface AdminUserItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: "admin" | "operator" | "customer";
  account_status: "active" | "blocked";
  is_email_verified: boolean;
  date_joined: string;
  last_login: string | null;
  orders_count: number;
  total_spent: string;
}
