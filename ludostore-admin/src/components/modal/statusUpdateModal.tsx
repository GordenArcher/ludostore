import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Spinner } from "../loader/spinner";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string, note: string) => void;
  currentStatus: string;
  isLoading?: boolean;
}

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-500/20 text-yellow-500",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-blue-500/20 text-blue-500",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-purple-500/20 text-purple-500",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-500/20 text-green-500",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-500/20 text-red-500",
  },
];

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  isLoading,
}: StatusUpdateModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [adminNote, setAdminNote] = useState("");

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isLoading) {
        onClose();
      }
    }
  };

  const handleSubmit = () => {
    if (selectedStatus !== currentStatus || adminNote) {
      onConfirm(selectedStatus, adminNote);
    } else {
      onClose();
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
        className="bg-black rounded-xl w-full max-w-md mx-4 overflow-hidden border border-gray-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Update Order Status</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    selectedStatus === option.value
                      ? `${option.color} border-yellow-500`
                      : "border-gray-700 text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Note (Optional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note about this status update..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-white placeholder-gray-500 resize-none"
            />
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Spinner size="lg" color="white" />
              </>
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
