export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "operator" | "customer";
  account_status: "active" | "blocked";
}

export interface AdminAuthResponse {
  status: string;
  message: string;
  data: {
    user: AdminUser;
    access_token: string;
    refresh_token: string;
  };
}
