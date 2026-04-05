import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, AlertCircle } from "lucide-react";
import { createProduct, updateProduct } from "../../api/products";
import type { AdminCategory, AdminProduct } from "../../types/product";
import { Spinner } from "../loader/spinner";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: AdminProduct;
  categories: AdminCategory[];
}

interface LocalErrors {
  name?: string;
  sku?: string;
  category?: string;
  regular_price?: string;
  stock_quantity?: string;
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
  const [localErrors, setLocalErrors] = useState<LocalErrors>({});
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
    setLocalErrors({});
    setError(null);
  }, [product]);

  const validateForm = (): boolean => {
    const errors: LocalErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Product name must be at least 2 characters";
    } else if (formData.name.length > 255) {
      errors.name = "Product name must be less than 255 characters";
    }

    // SKU validation
    if (!formData.sku.trim()) {
      errors.sku = "SKU is required";
    } else if (formData.sku.length < 2) {
      errors.sku = "SKU must be at least 2 characters";
    } else if (formData.sku.length > 100) {
      errors.sku = "SKU must be less than 100 characters";
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.sku)) {
      errors.sku = "SKU can only contain letters, numbers, and hyphens";
    }

    // Category validation
    if (!formData.category) {
      errors.category = "Please select a category";
    }

    // Regular price validation
    if (formData.regular_price) {
      const price = parseFloat(formData.regular_price);
      if (isNaN(price) || price < 0) {
        errors.regular_price = "Please enter a valid price";
      } else if (price > 999999.99) {
        errors.regular_price = "Price is too high";
      }
    }

    // Stock quantity validation
    if (formData.stock_quantity < 0) {
      errors.stock_quantity = "Stock quantity cannot be negative";
    } else if (formData.stock_quantity > 999999) {
      errors.stock_quantity = "Stock quantity is too high";
    }

    // Sale price validation (if greater than regular price)
    if (formData.sale_price && formData.regular_price) {
      const salePrice = parseFloat(formData.sale_price);
      const regularPrice = parseFloat(formData.regular_price);
      if (
        !isNaN(salePrice) &&
        !isNaN(regularPrice) &&
        salePrice > regularPrice
      ) {
        errors.regular_price =
          "Sale price cannot be greater than regular price";
      }
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Local validation first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear local error for this field when user starts typing
    if (localErrors[field as keyof LocalErrors]) {
      setLocalErrors({ ...localErrors, [field]: undefined });
    }
    // Clear API error for this field
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: undefined });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-900 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-yellow-500" />
                {product ? "Edit Product" : "Add Product"}
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
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    className={`w-full px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white transition-colors ${
                      localErrors.sku || fieldErrors.sku
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {(localErrors.sku || fieldErrors.sku) && (
                    <p className="mt-1 text-red-500 text-xs">
                      {localErrors.sku || fieldErrors.sku?.[0]}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className={`w-full px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white cursor-pointer transition-colors ${
                      localErrors.category || fieldErrors.category
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {(localErrors.category || fieldErrors.category) && (
                    <p className="mt-1 text-red-500 text-xs">
                      {localErrors.category || fieldErrors.category?.[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      handleInputChange(
                        "stock_quantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className={`w-full px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white transition-colors ${
                      localErrors.stock_quantity
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {localErrors.stock_quantity && (
                    <p className="mt-1 text-red-500 text-xs">
                      {localErrors.stock_quantity}
                    </p>
                  )}
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
                      handleInputChange("regular_price", e.target.value)
                    }
                    className={`w-full px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white transition-colors ${
                      localErrors.regular_price
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                  />
                  {localErrors.regular_price && (
                    <p className="mt-1 text-red-500 text-xs">
                      {localErrors.regular_price}
                    </p>
                  )}
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
                      handleInputChange("sale_price", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500 text-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-4">
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      handleInputChange("featured", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-700 bg-black text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-800 sticky bottom-0 bg-gray-900">
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
                  "Save Product"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
