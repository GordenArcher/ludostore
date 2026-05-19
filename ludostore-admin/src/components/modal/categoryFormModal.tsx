import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { createCategory, updateCategory } from "../../api/categories";
import { Spinner } from "../loader/spinner";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: any;
}

interface LocalErrors {
  name?: string;
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
  const [localErrors, setLocalErrors] = useState<LocalErrors>({});
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
    setLocalErrors({});
    setError(null);
  }, [category]);

  const validateForm = (): boolean => {
    const errors: LocalErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      errors.name = "Category name must be less than 100 characters";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (localErrors[field as keyof LocalErrors]) {
      setLocalErrors({ ...localErrors, [field]: undefined });
    }
    if (fieldErrors[field]) {
      const nextFieldErrors = { ...fieldErrors };
      delete nextFieldErrors[field];
      setFieldErrors(nextFieldErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-900 rounded-xl w-full max-w-md mx-4 overflow-hidden border border-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">
                {category ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white transition-colors ${
                    localErrors.name || fieldErrors.name
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                />
                {(localErrors.name || fieldErrors.name) && (
                  <p className="mt-1 text-red-500 text-xs">
                    {localErrors.name || fieldErrors.name?.[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className={`w-full px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white resize-none transition-colors ${
                    fieldErrors.description
                      ? "border-red-500"
                      : "border-gray-700"
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
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-black text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                />
                <span className="text-sm text-gray-300">Active</span>
              </label>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-800">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer font-medium"
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
      )}
    </AnimatePresence>
  );
};
