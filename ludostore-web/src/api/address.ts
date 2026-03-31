import axiosClient from "../utils/axios";
import type {
  Address,
  AddressResponse,
  CreateAddressRequest,
} from "../types/address";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await axiosClient.get<AddressResponse>("/addresses/");
  return response.data.data.addresses;
};

export const getDefaultAddress = async (): Promise<Address | null> => {
  const addresses = await getAddresses();
  return addresses.find((addr) => addr.is_default) || addresses[0] || null;
};

export const createAddress = async (
  data: CreateAddressRequest,
): Promise<Address> => {
  const response = await axiosClient.post<{
    status: string;
    message: string;
    data: Address;
  }>("/addresses/", data);
  return response.data.data;
};

export const updateAddress = async (
  id: string,
  data: Partial<CreateAddressRequest>,
): Promise<Address> => {
  const response = await axiosClient.patch<{
    status: string;
    message: string;
    data: Address;
  }>(`/addresses/${id}/`, data);
  return response.data.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await axiosClient.delete(`/addresses/${id}/`);
};

export const setDefaultAddress = async (
  id: string,
  addressType?: string,
): Promise<Address> => {
  const response = await axiosClient.post<{
    status: string;
    message: string;
    data: Address;
  }>(
    `/addresses/${id}/set-default/`,
    addressType ? { address_type: addressType } : {},
  );
  return response.data.data;
};
