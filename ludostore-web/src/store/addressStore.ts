import { create } from "zustand";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/address";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "../types/address";

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  addAddress: (data: CreateAddressRequest) => Promise<boolean>;
  updateAddress: (id: string, data: UpdateAddressRequest) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefault: (id: string, addressType?: string) => Promise<boolean>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await getAddresses();
      set({ addresses, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch addresses",
        isLoading: false,
      });
    }
  },

  addAddress: async (data: CreateAddressRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newAddress = await createAddress(data);
      set({ addresses: [...get().addresses, newAddress], isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to add address",
        isLoading: false,
      });
      return false;
    }
  },

  updateAddress: async (id: string, data: UpdateAddressRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAddress = await updateAddress(id, data);
      set({
        addresses: get().addresses.map((addr) =>
          addr.id === id ? updatedAddress : addr,
        ),
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to update address",
        isLoading: false,
      });
      return false;
    }
  },

  deleteAddress: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteAddress(id);
      set({
        addresses: get().addresses.filter((addr) => addr.id !== id),
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete address",
        isLoading: false,
      });
      return false;
    }
  },

  setDefault: async (id: string, addressType?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAddress = await setDefaultAddress(id, addressType);
      set({
        addresses: get().addresses.map((addr) =>
          addr.id === id ? updatedAddress : { ...addr, is_default: false },
        ),
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "Failed to set default address",
        isLoading: false,
      });
      return false;
    }
  },
}));
