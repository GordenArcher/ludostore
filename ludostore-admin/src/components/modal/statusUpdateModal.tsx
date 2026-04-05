import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
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
    color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  },
  {
    value: "processing",
    label: "Processing",
    color: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "bg-purple-500/20 text-purple-500 border-purple-500/20",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-500/20 text-green-500 border-green-500/20",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-500/20 text-red-500 border-red-500/20",
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
  const [showDropdown, setShowDropdown] = useState(false);

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

  const getSelectedStatusLabel = () => {
    const option = statusOptions.find((opt) => opt.value === selectedStatus);
    return option?.label || "Select Status";
  };

  const getSelectedStatusColor = () => {
    const option = statusOptions.find((opt) => opt.value === selectedStatus);
    return option?.color || "";
  };

  if (!isOpen) return null;

  return (
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
        className="bg-gray-900 rounded-xl w-full max-w-md mx-4 overflow-hidden border border-gray-800 shadow-xl"
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
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white text-sm flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <span className={getSelectedStatusColor()}>
                  {getSelectedStatusLabel()}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                          selectedStatus === option.value
                            ? `${option.color} bg-gray-800`
                            : "text-gray-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500 transition-colors text-white placeholder-gray-500 resize-none"
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
            {isLoading ? <Spinner size="lg" color="white" /> : "Update Status"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
