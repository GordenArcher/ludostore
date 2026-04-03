import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { createCategory, updateCategory } from "../../api/categories";
import { Spinner } from "../loader/spinner";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: any;
}

export const CategoryFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        is_active: category.is_active ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        is_active: true,
      });
    }
    setFieldErrors({});
    setError(null);
  }, [category]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      if (category) {
        await updateCategory(category.id, formData);
      } else {
        await createCategory(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setError(err.response.data.message || "Validation failed");
      } else {
        setError(err.response?.data?.message || "Failed to save category");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-black rounded-xl w-full max-w-md mx-4 border border-gray-800"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-white font-semibold">
            {category ? "Edit Category" : "Add Category"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:border-gray-500 text-white ${
                fieldErrors.name ? "border-red-500" : "border-gray-700"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-red-500 text-xs">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:border-gray-500 text-white resize-none ${
                fieldErrors.description ? "border-red-500" : "border-gray-700"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-red-500 text-xs">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-yellow-500"
            />
            <span className="text-sm text-gray-300">Active</span>
          </label>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Spinner size="lg" color="white" />
            ) : (
              "Save Category"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
