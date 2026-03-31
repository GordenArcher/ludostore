import { useRef } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle, Trash2, LogIn } from "lucide-react";
import { Spinner } from "../loading/Spinner";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}: ConfirmationModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isLoading) {
        onClose();
      }
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: Trash2,
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
          buttonBg: "bg-red-500 hover:bg-red-600",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconBg: "bg-yellow-500/10",
          iconColor: "text-yellow-500",
          buttonBg: "bg-yellow-500 hover:bg-yellow-400",
        };
      case "info":
        return {
          icon: LogIn,
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
          buttonBg: "bg-blue-500 hover:bg-blue-600",
        };
      default:
        return {
          icon: Trash2,
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
          buttonBg: "bg-red-500 hover:bg-red-600",
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

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
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Icon className={`w-4 h-4 ${styles.iconColor}`} />
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="text-gray-300 text-sm">{message}</p>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 ${styles.buttonBg} text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer`}
          >
            {isLoading ? (
              <>
                <Spinner size="md" color="white" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
