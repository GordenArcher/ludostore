export interface Profile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar?: string;
  date_joined: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
