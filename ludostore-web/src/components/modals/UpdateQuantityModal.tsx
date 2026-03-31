import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Minus, Plus, Save } from "lucide-react";
import { Spinner } from "../loading/Spinner";

interface UpdateQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  productName: string;
  currentQuantity: number;
  maxStock?: number;
  isLoading?: boolean;
}

export const UpdateQuantityModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  currentQuantity,
  maxStock = 99,
  isLoading = false,
}: UpdateQuantityModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(currentQuantity);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isLoading) {
        onClose();
      }
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmit = () => {
    if (quantity !== currentQuantity) {
      onConfirm(quantity);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setQuantity(currentQuantity);
    }
  }, [isOpen, currentQuantity]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[#1e1e1e] rounded-xl w-full max-w-sm mx-4 overflow-hidden border border-white/20 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Update Quantity</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-gray-300 text-sm mb-3">{productName}</p>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Quantity</span>
            <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-lg border border-white/10">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || isLoading}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-l-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-medium w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= maxStock || isLoading}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-r-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {maxStock < 99 && (
            <p className="text-gray-500 text-xs mt-3">
              {maxStock} units available
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || quantity === currentQuantity}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Spinner size="lg" color="white" />
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
