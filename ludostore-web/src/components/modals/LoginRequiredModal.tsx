import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, LogIn, MessageCircle, ShoppingBag } from "lucide-react";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails?: string;
}

export const LoginRequiredModal = ({
  isOpen,
  onClose,
  orderDetails,
}: LoginRequiredModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const whatsappMessage = orderDetails
    ? `Hi, I want to purchase these items:%0A%0A${encodeURIComponent(orderDetails)}%0A%0APlease help me proceed with my order.`
    : "Hi, I want to purchase items from Ludo Kingdom. Please help me proceed with my order.";

  const whatsappUrl = `https://wa.me/233123456789?text=${whatsappMessage}`;

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
        className="bg-[#1e1e1e] rounded-xl w-full max-w-md mx-4 overflow-hidden border border-white/20 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <LogIn className="w-4 h-4 text-yellow-500" />
            Login Required
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="text-gray-300 text-sm mb-4">
            You need to be logged in to complete your checkout. Create an
            account or login to track your orders and save your information.
          </p>

          <div className="space-y-3">
            <Link
              to="/auth/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Login to Checkout
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#1e1e1e] px-2 text-gray-500">or</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Continue on WhatsApp
            </a>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-gray-500 text-xs text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
