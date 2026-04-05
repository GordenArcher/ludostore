import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertCircle } from "lucide-react";
import { Spinner } from "../loader/spinner";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onDelete?: () => Promise<void>;
  title?: string;
  message?: string;
  productName?: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  title,
  message,
  productName,
  isLoading = false,
}: DeleteConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isDeleting && !isLoading) {
        onClose();
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      setError(null);
      try {
        await onDelete();
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const displayTitle = title || "Delete Product";
  const displayMessage =
    message ||
    (productName
      ? `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      : "Are you sure you want to delete this item? This action cannot be undone.");

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={handleClickOutside}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-900 rounded-xl w-full max-w-sm mx-4 overflow-hidden border border-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                {displayTitle}
              </h3>
              <button
                onClick={onClose}
                disabled={isDeleting || isLoading}
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
                <p className="text-gray-400 text-sm">{displayMessage}</p>
                {error && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting || isLoading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting || isLoading ? (
                  <Spinner size="lg" color="white" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
