import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { createProduct, updateProduct } from "../../api/products";
import type { AdminCategory } from "../../types/product";
import { Spinner } from "../loader/spinner";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
  categories: AdminCategory[];
}

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  categories,
}: ProductFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    regular_price: "",
    sale_price: "",
    sku: "",
    stock_quantity: 0,
    is_active: true,
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        regular_price: product.regular_price || "",
        sale_price: product.sale_price || "",
        sku: product.sku || "",
        stock_quantity: product.stock_quantity || 0,
        is_active: product.is_active ?? true,
        featured: product.featured ?? false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        regular_price: "",
        sale_price: "",
        sku: "",
        stock_quantity: 0,
        is_active: true,
        featured: false,
      });
    }
    setFieldErrors({});
    setError(null);
  }, [product]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setError(err.response.data.message || "Validation failed");
      } else {
        setError(err.response?.data?.message || "Failed to save product");
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
        className="bg-black rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-white font-semibold">
            {product ? "Edit Product" : "Add Product"}
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

          <div className="grid grid-cols-2 gap-4">
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
                <p className="mt-1 text-red-500 text-xs">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className={`w-full px-3 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:border-gray-500 text-white ${
                  fieldErrors.sku ? "border-red-500" : "border-gray-700"
                }`}
              />
              {fieldErrors.sku && (
                <p className="mt-1 text-red-500 text-xs">
                  {fieldErrors.sku[0]}
                </p>
              )}
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Regular Price (GH₵)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.regular_price}
                onChange={(e) =>
                  setFormData({ ...formData, regular_price: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sale Price (GH₵)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) =>
                  setFormData({ ...formData, sale_price: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white"
              />
            </div>
          </div>

          <div className="flex gap-4">
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-yellow-500"
              />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>
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
              "Save Product"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
