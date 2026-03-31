import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, MapPin } from "lucide-react";
import type { Address } from "../../types/address";
import { getAddresses } from "../../api/address";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

export const AddressSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
}: AddressSelectionModalProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
      const defaultAddr = data.find((addr) => addr.is_default);
      if (defaultAddr) {
        setSelectedId(defaultAddr.id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    const selected = addresses.find((addr) => addr.id === selectedId);
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1e1e1e] rounded-xl w-full max-w-lg mx-4 overflow-hidden border border-white/20 shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-500" />
            Select Shipping Address
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No addresses found</p>
              <p className="text-gray-500 text-xs mt-1">
                Please add an address in your profile
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => setSelectedId(address.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedId === address.id
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-white/10 hover:border-yellow-500/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedId === address.id ? (
                        <Check className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <div className="w-4 h-4 border border-white/30 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {address.recipient_name}
                        </span>
                        {address.is_default && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {address.street_address}
                        {address.apartment && `, ${address.apartment}`}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {address.city}, {address.state}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {address.country} {address.postal_code}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {address.phone_number}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || isLoading}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Use This Address
          </button>
        </div>
      </motion.div>
    </div>
  );
};
