import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Minus, Plus, ShoppingCart, Loader, Check } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    current_price: string;
    images: Array<{ image: string; is_primary: boolean }>;
    stock_quantity: number;
  };
}

export const AddToCartModal = ({
  isOpen,
  onClose,
  product,
}: AddToCartModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToCart, isAdding } = useCartStore();

  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const imageUrl = primaryImage?.image
    ? `http://localhost:8000${primaryImage.image}`
    : "https://via.placeholder.com/500x500?text=No+Image";

  const price = parseFloat(product.current_price);
  const maxStock = product.stock_quantity || 99;

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isAdding && !isSuccess) {
        onClose();
      }
    }
  };

  const handleAddToCart = async () => {
    const success = await addToCart(
      product.id,
      quantity,
      product.current_price,
    );
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
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

  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = price * quantity;

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
        className="bg-[#1e1e1e] rounded-xl w-full max-w-md mx-4 overflow-hidden border border-white/20 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-yellow-500" />
            Add to Cart
          </h3>
          <button
            onClick={onClose}
            disabled={isAdding || isSuccess}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex gap-4 px-5 pt-5">
          <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg overflow-hidden shrink-0">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium line-clamp-2">
              {product.name}
            </h4>
            <p className="text-yellow-500 font-bold mt-1">
              GH₵ {price.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300 text-sm">Quantity</span>
            <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-lg border border-white/10">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || isAdding || isSuccess}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-l-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-medium w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= maxStock || isAdding || isSuccess}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-r-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-gray-400 text-sm">Subtotal</span>
            <span className="text-white font-bold text-lg">
              GH₵ {subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isAdding || isSuccess}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isSuccess}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Added!
              </>
            ) : isAdding ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
