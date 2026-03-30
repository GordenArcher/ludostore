export interface ApiSuccessResponse<T = any> {
  message: string;
  data: T;
  status_code: number;
  code: string;
  request_id?: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]> | string;
  status_code: number;
  code: string;
  request_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  email: string;
  role?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponseData {
  email: string;
}
