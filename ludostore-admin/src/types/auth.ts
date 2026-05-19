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
    email: string;
    role: AdminUser["role"];
    access_token: string;
    refresh_token: string;
  };
}
