import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  MapPin,
  Package,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import type { Address, CreateAddressRequest } from "../../types/address";
import { Spinner } from "../loading/Spinner";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAddressRequest) => Promise<boolean>;
  address?: Address | null;
  title: string;
  backendErrors?: Record<string, string[]>;
}

export const AddressModal = ({
  isOpen,
  onClose,
  onSave,
  address,
  title,
  backendErrors = {},
}: AddressModalProps) => {
  const [formData, setFormData] = useState<CreateAddressRequest>({
    address_type: "shipping",
    is_default: false,
    recipient_name: "",
    phone_number: "",
    street_address: "",
    apartment: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Ghana",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      setFormData({
        address_type: address.address_type,
        is_default: address.is_default,
        recipient_name: address.recipient_name,
        phone_number: address.phone_number,
        street_address: address.street_address,
        apartment: address.apartment || "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      });
    } else {
      setFormData({
        address_type: "shipping",
        is_default: false,
        recipient_name: "",
        phone_number: "",
        street_address: "",
        apartment: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Ghana",
      });
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [address]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
    if (generalError) setGeneralError(null);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, is_default: checked });
  };

  const handleTypeChange = (type: "shipping" | "billing") => {
    setFormData({ ...formData, address_type: type });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipient_name.trim())
      newErrors.recipient_name = "Recipient name is required";
    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    if (!formData.street_address.trim())
      newErrors.street_address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postal_code.trim())
      newErrors.postal_code = "Postal code is required";

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newFieldErrors: Record<string, string> = {};

        Object.keys(apiErrors).forEach((key) => {
          if (Array.isArray(apiErrors[key])) {
            newFieldErrors[key] = apiErrors[key][0];
          } else if (typeof apiErrors[key] === "string") {
            newFieldErrors[key] = apiErrors[key];
          }
        });

        setFieldErrors(newFieldErrors);

        if (error.response.data.message) {
          setGeneralError(error.response.data.message);
        }
      } else if (error.message) {
        setGeneralError(error.message);
      } else {
        setGeneralError("Failed to save address. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getFieldError = (field: string): string => {
    if (fieldErrors[field]) return fieldErrors[field];
    if (backendErrors[field] && backendErrors[field].length > 0) {
      return backendErrors[field][0];
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1e1e1e] rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-white/20 shadow-xl"
      >
        <div className="sticky top-0 bg-[#1e1e1e] flex items-center justify-between px-5 py-4 border-b border-white/10 z-10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-500" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {generalError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("shipping")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                formData.address_type === "shipping"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                  : "border-white/20 text-gray-400 hover:border-yellow-500/50"
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-sm">Shipping</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("billing")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                formData.address_type === "billing"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                  : "border-white/20 text-gray-400 hover:border-yellow-500/50"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Billing</span>
            </button>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Recipient Name
            </label>
            <input
              type="text"
              value={formData.recipient_name}
              onChange={(e) =>
                handleFieldChange("recipient_name", e.target.value)
              }
              className={`w-full bg-[#2a2a2a] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors ${
                getFieldError("recipient_name")
                  ? "border-red-500"
                  : "border-white/20"
              }`}
            />
            {getFieldError("recipient_name") && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError("recipient_name")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                handleFieldChange("phone_number", e.target.value)
              }
              placeholder="+233 XX XXX XXXX"
              className={`w-full bg-[#2a2a2a] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors ${
                getFieldError("phone_number")
                  ? "border-red-500"
                  : "border-white/20"
              }`}
            />
            {getFieldError("phone_number") && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError("phone_number")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={formData.street_address}
              onChange={(e) =>
                handleFieldChange("street_address", e.target.value)
              }
              className={`w-full bg-[#2a2a2a] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors ${
                getFieldError("street_address")
                  ? "border-red-500"
                  : "border-white/20"
              }`}
            />
            {getFieldError("street_address") && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError("street_address")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Apartment / Suite{" "}
              <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.apartment}
              onChange={(e) => handleFieldChange("apartment", e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                className={`w-full bg-[#2a2a2a] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors ${
                  getFieldError("city") ? "border-red-500" : "border-white/20"
                }`}
              />
              {getFieldError("city") && (
                <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("city")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                State / Region
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleFieldChange("state", e.target.value)}
                className={`w-full bg-[#2a2a2a] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors ${
                  getFieldError("state") ? "border-red-500" : "border-white/20"
                }`}
              />
              {getFieldError("state") && (
                <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("state")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Postal Code (eg: 00233)
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  handleFieldChange("postal_code", e.target.value)
                }
                className={`w-full bg-[#2a2a2a] border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors ${
                  getFieldError("postal_code")
                    ? "border-red-500"
                    : "border-white/20"
                }`}
              />
              {getFieldError("postal_code") && (
                <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("postal_code")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-[#2a2a2a] text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-gray-300 text-sm">
              Set as default address
            </span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-[#1e1e1e] px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Spinner size="lg" color="white" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Address
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
