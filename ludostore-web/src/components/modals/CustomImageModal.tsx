import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Trash2,
  Loader,
  Image,
  AlertCircle,
  Check,
  Info,
} from "lucide-react";
import {
  uploadCustomizationImages,
  deleteCustomizationImage,
  getCustomizationImages,
} from "../../api/customImage";
import { Spinner } from "../loading/Spinner";

interface CustomImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  itemId: string;
  productName: string;
}

const ImageSkeleton = () => (
  <div className="aspect-square bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-lg animate-pulse" />
);

export const CustomImageModal = ({
  isOpen,
  onClose,
  orderId,
  itemId,
  productName,
}: CustomImageModalProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(4);
  const [canUpload, setCanUpload] = useState(true);
  const [canDelete, setCanDelete] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCustomizationImages(orderId, itemId);
      setImages(response.data.customization_images || []);
      setTotalImages(response.data.total_images);
      setRemainingSlots(response.data.remaining_slots);
      setCanUpload(response.data.can_upload);
      setCanDelete(response.data.can_delete);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId && itemId) {
      fetchImages();
    }
  }, [isOpen, orderId, itemId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s)`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadCustomizationImages(orderId, itemId, files);
      await fetchImages();
      setSuccess("Images uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageIndex: number) => {
    if (!canDelete) {
      setError("You cannot delete images at this stage");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setDeletingIndex(imageIndex);
    setError(null);

    try {
      await deleteCustomizationImage(orderId, itemId, imageIndex);
      await fetchImages();
      setSuccess("Image deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingIndex(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1e1e1e] rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20 shadow-xl"
      >
        <div className="sticky top-0 bg-[#1e1e1e] flex items-center justify-between px-5 py-4 border-b border-white/10 z-10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Image className="w-4 h-4 text-yellow-500" />
            Customize Your Order
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-yellow-500 text-sm font-medium mb-1">
                  Custom Image Option
                </p>
                <p className="text-gray-400 text-sm">
                  Add your own image to be printed on your {productName}. Upload
                  up to 4 images. Our team will contact you to confirm the best
                  placement.
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {isLoading ? (
              <>
                <ImageSkeleton />
                <ImageSkeleton />
                <ImageSkeleton />
                <ImageSkeleton />
              </>
            ) : (
              <>
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-square bg-[#2a2a2a] rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={img}
                        alt={`Custom ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(idx)}
                        disabled={deletingIndex === idx}
                        className="absolute top-1 right-1 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 cursor-pointer"
                      >
                        {deletingIndex === idx ? (
                          <Loader className="w-3 h-3 text-white animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {canUpload && remainingSlots > 0 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-[#2a2a2a] rounded-lg border-2 border-dashed border-white/20 hover:border-yellow-500 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <Spinner size="lg" color="yellow" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-500" />
                        <span className="text-xs text-gray-500">Upload</span>
                      </>
                    )}
                  </div>
                )}

                {!canUpload && remainingSlots === 0 && (
                  <div className="aspect-square bg-[#2a2a2a] rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                    <Check className="w-6 h-6 text-green-500" />
                    <span className="text-xs text-green-500">Max reached</span>
                  </div>
                )}
              </>
            )}
          </div>

          {!isLoading && (
            <div className="text-center">
              <p className="text-gray-500 text-xs">
                {totalImages}/4 images used
                {remainingSlots > 0 &&
                  ` • ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining`}
              </p>
              {!canUpload && totalImages < 4 && (
                <p className="text-yellow-500 text-xs mt-2">
                  Image upload is no longer available for this order
                </p>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        <div className="sticky bottom-0 bg-[#1e1e1e] px-5 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
