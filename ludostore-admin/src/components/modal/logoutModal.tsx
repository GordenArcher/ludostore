import { useRef } from "react";
import { motion } from "framer-motion";
import { LogOut, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Spinner } from "../loader/spinner";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LogoutModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isLoading) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-black rounded-xl w-full max-w-sm mx-4 overflow-hidden border border-gray-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <LogOut className="w-4 h-4 text-red-400" />
            Logout
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-white font-medium mb-1">
              Hey, {user?.first_name || "Admin"}!
            </p>
            <p className="text-gray-400 text-sm">
              Are you sure you want to logout? You'll need to sign in again to
              access the admin panel.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Spinner size="lg" color="white" />
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Yes, Logout
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
