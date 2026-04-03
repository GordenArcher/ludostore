import { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Spinner } from "../loader/spinner";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => Promise<void>;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteConfirmModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-black rounded-xl w-full max-w-sm mx-4 border border-gray-800"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-gray-300">{message}</p>
          {error && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? <Spinner size="lg" color="white" /> : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
