export interface Address {
  id: string;
  address_type: "billing" | "shipping" | "both";
  is_default: boolean;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  apartment: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface AddressResponse {
  status: string;
  message: string;
  data: {
    addresses: Address[];
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

export interface CreateAddressRequest {
  address_type: "billing" | "shipping" | "both";
  is_default?: boolean;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
