import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, X, Loader, Trash2, Edit2, Check } from "lucide-react";
import { useWishlistStore } from "../../store/wishlistStore";

interface AddToWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  isInWishlist?: boolean;
  existingItemId?: string;
  existingNotes?: string | null;
  onSuccess?: () => void;
  onRemove?: () => void;
}

export const AddToWishlistModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  isInWishlist = false,
  existingItemId,
  existingNotes = null,
  onSuccess,
  onRemove,
}: AddToWishlistModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState(existingNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const { addToWishlist, updateNotes, removeFromWishlist, isAdding } =
    useWishlistStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      if (!isAdding && !isLoading) {
        onClose();
      }
    }
  };

  const handleAdd = async () => {
    setIsLoading(true);
    const result = await addToWishlist(productId, notes.trim() || undefined);
    setIsLoading(false);
    if (result) {
      setNotes("");
      onSuccess?.();
      onClose();
    }
  };

  const handleUpdate = async () => {
    if (!existingItemId) return;
    setIsLoading(true);
    await updateNotes(existingItemId, notes.trim() || "");
    setIsLoading(false);
    onSuccess?.();
    onClose();
  };

  const handleRemove = async () => {
    setIsLoading(true);
    await removeFromWishlist(productId);
    setIsLoading(false);
    onRemove?.();
    onClose();
  };

  const handleSubmit = () => {
    if (isInWishlist && !isEditing) {
      setIsEditing(true);
    } else if (isInWishlist && isEditing) {
      handleUpdate();
    } else {
      handleAdd();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setNotes(existingNotes || "");
      setIsEditing(false);
    }
  }, [isOpen, existingNotes]);

  if (!isOpen) return null;

  const isActionLoading = isAdding || isLoading;

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
            <Heart
              className={`w-4 h-4 ${isInWishlist ? "text-red-500 fill-red-500" : "text-yellow-500"}`}
            />
            {isInWishlist ? "Manage Wishlist Item" : "Add to Wishlist"}
          </h3>
          <button
            onClick={onClose}
            disabled={isActionLoading}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-white font-medium mb-1">{productName}</p>

          {isInWishlist && !isEditing ? (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-3">
                This item is already in your wishlist.
              </p>
              {existingNotes ? (
                <div className="p-3 bg-[#2a2a2a] rounded-lg mb-4">
                  <p className="text-gray-300 text-sm font-medium mb-1">
                    Your note:
                  </p>
                  <p className="text-gray-400 text-sm italic">
                    "{existingNotes}"
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-[#2a2a2a] rounded-lg mb-4">
                  <p className="text-gray-400 text-sm">No notes added yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-4">
                {isInWishlist
                  ? "Update your notes for this item."
                  : "Add this item to your wishlist. You can add notes to remember why you liked it."}
              </p>

              <label className="block text-gray-300 text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note... e.g., Birthday gift idea, Wait for sale, etc."
                rows={3}
                disabled={isActionLoading}
                className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500 transition-colors resize-none disabled:opacity-50"
              />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          {isInWishlist && !isEditing ? (
            <>
              <button
                onClick={handleRemove}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isActionLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Edit Note
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isActionLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {isInWishlist ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isInWishlist ? (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Add to Wishlist
                      </>
                    )}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
