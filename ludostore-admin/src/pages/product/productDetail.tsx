import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Box,
  Calendar,
  Edit2,
  Trash2,
  Image,
  Upload,
  Check,
  AlertCircle,
  Star,
  Trash2 as TrashIcon,
  ZoomIn,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import {
  updateProductStock,
  addProductImage,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from "../../api/products";
import { Spinner } from "../../components/loader/spinner";
import { DeleteConfirmModal } from "../../components/modal/deleteConfirmModal";
import { ProductFormModal } from "../../components/modal/productFormModal";
import { ImagePreviewModal } from "../../components/modal/ImagePreviewModal";
import { getProductImagePath, resolveMediaUrl } from "../../utils/media";
import ProductDetailSkeleton from "../../components/loader/productDetailSkeleton";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedProduct,
    isLoading,
    fetchProduct,
    clearSelected,
    categories,
    fetchCategories,
  } = useProductStore();
  const [editingStock, setEditingStock] = useState(false);
  const [stockValue, setStockValue] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchCategories();
    }
    return () => {
      clearSelected();
    };
  }, [id]);

  const validateStock = (value: number): boolean => {
    if (value < 0) {
      setStockError("Stock quantity cannot be negative");
      return false;
    }
    if (value > 999999) {
      setStockError("Stock quantity is too high");
      return false;
    }
    setStockError(null);
    return true;
  };

  const handleStockValueChange = (value: number) => {
    setStockValue(value);
    validateStock(value);
  };

  const handleUpdateStock = async () => {
    if (!validateStock(stockValue)) {
      return;
    }

    setUpdatingStock(true);
    setErrorMessage(null);
    try {
      await updateProductStock(id!, stockValue);
      await fetchProduct(id!);
      setEditingStock(false);
      setSuccessMessage("Stock updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update stock",
      );
    } finally {
      setUpdatingStock(false);
    }
  };

  const validateImage = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        "Invalid file type. Please upload JPEG, PNG, WEBP, or GIF",
      );
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size too large. Maximum size is 5MB");
      return false;
    }
    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setUploadingImage(true);
    setErrorMessage(null);
    try {
      await addProductImage(id!, file, selectedProduct?.images.length === 0);
      await fetchProduct(id!);
      setSuccessMessage("Image added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to upload image",
      );
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setErrorMessage(null);
    try {
      await updateProduct(id!, { primary_image_id: imageId });
      await fetchProduct(id!);
      setSuccessMessage("Primary image updated!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update primary image",
      );
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setIsDeletingImage(true);
    setErrorMessage(null);
    try {
      await deleteProductImage(id!, imageId);
      await fetchProduct(id!);
      setSuccessMessage("Image deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to delete image",
      );
    } finally {
      setIsDeletingImage(false);
      setDeletingImage(null);
    }
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(id!);
      navigate("/admin/products");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to delete product",
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageClick = (index: number) => {
    const allImages =
      selectedProduct?.images.map((img) =>
        resolveMediaUrl(getProductImagePath(img)),
      ) || [];
    setPreviewImages(allImages);
    setPreviewIndex(index);
    setShowImagePreview(true);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20">
          Out of Stock
        </span>
      );
    }
    if (quantity < 10) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
          Low Stock ({quantity})
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/20">
        In Stock ({quantity})
      </span>
    );
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!selectedProduct) {
    return (
      <div className="text-center py-12 px-4">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">
          Product Not Found
        </h2>
        <button
          onClick={() => navigate("/admin/products")}
          className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 px-4 sm:px-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              Edit Product
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-yellow-500" />
                Product Images
                <span className="text-xs text-gray-500 ml-2">
                  ({selectedProduct.images?.length || 0})
                </span>
              </h2>

              <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {selectedProduct.images?.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      className="relative group"
                    >
                      <div
                        className={`flex items-center gap-3 p-2 rounded-lg border ${
                          img.is_primary
                            ? "border-yellow-500"
                            : "border-gray-800"
                        } bg-black`}
                      >
                        <button
                          onClick={() => handleImageClick(idx)}
                          className="relative group/image cursor-pointer"
                        >
                          <img
                            src={resolveMediaUrl(getProductImagePath(img))}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </button>
                        <div className="flex-1">
                          {img.is_primary && (
                            <span className="text-xs text-yellow-500 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!img.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(img.id)}
                              className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors cursor-pointer"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingImage(img.id)}
                            className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-700 rounded-lg hover:border-yellow-500 transition-colors cursor-pointer">
                  {uploadingImage ? (
                    <Spinner size="lg" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Upload Image
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Max file size: 5MB. Allowed: JPEG, PNG, WEBP, GIF
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
              <h2 className="text-white font-semibold mb-4">
                Product Information
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-gray-400 text-sm block mb-1">
                      Name
                    </label>
                    <p className="text-white text-lg font-medium wrap-break-word">
                      {selectedProduct.name}
                    </p>
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-400 text-sm block mb-1">
                      SKU
                    </label>
                    <p className="text-white wrap-break-word">
                      {selectedProduct.sku}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Description
                  </label>
                  <p className="text-gray-300 wrap-break-word">
                    {selectedProduct.description || "No description"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">
                      Category
                    </label>
                    <p className="text-white wrap-break-word">
                      {selectedProduct.category_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        selectedProduct.is_active
                          ? "bg-green-500/20 text-green-500 border border-green-500/20"
                          : "bg-red-500/20 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {selectedProduct.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {selectedProduct.featured && (
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">
                      Featured
                    </label>
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
                      Featured Product
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                Pricing
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Regular Price
                  </label>
                  <p className="text-white text-xl font-bold wrap-break-word">
                    GH₵{" "}
                    {parseFloat(selectedProduct.regular_price).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Sale Price
                  </label>
                  <p className="text-white text-xl font-bold wrap-break-word">
                    {selectedProduct.sale_price
                      ? `GH₵ ${parseFloat(selectedProduct.sale_price).toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Box className="w-4 h-4 text-yellow-500" />
                Stock Management
              </h2>

              {editingStock ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      value={stockValue}
                      onChange={(e) =>
                        handleStockValueChange(parseInt(e.target.value) || 0)
                      }
                      className={`w-32 px-3 py-2 bg-black border rounded-lg focus:outline-none focus:border-yellow-500 text-white ${
                        stockError ? "border-red-500" : "border-gray-700"
                      }`}
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateStock}
                      disabled={updatingStock}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updatingStock ? <Spinner size="lg" /> : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingStock(false);
                        setStockError(null);
                      }}
                      className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  {stockError && (
                    <p className="text-red-500 text-xs">{stockError}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-2xl font-bold text-white">
                        {selectedProduct.stock_quantity}
                      </p>
                      {getStockBadge(selectedProduct.stock_quantity)}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      units available
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingStock(true);
                      setStockValue(selectedProduct.stock_quantity);
                      setStockError(null);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Update Stock
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-500" />
                Meta Information
              </h2>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-1">
                  <span className="text-gray-400 text-sm">Created</span>
                  <span className="text-white text-sm wrap-break-word">
                    {new Date(selectedProduct.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-1">
                  <span className="text-gray-400 text-sm">Last Updated</span>
                  <span className="text-white text-sm wrap-break-word">
                    {new Date(selectedProduct.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ProductFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        onSuccess={() => {
          fetchProduct(id!);
          setSuccessMessage("Product updated successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
        product={selectedProduct}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => {}}
        onDelete={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <DeleteConfirmModal
        isOpen={!!deletingImage}
        onClose={() => setDeletingImage(null)}
        onSuccess={() => {}}
        onDelete={() => handleDeleteImage(deletingImage!)}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        isLoading={isDeletingImage}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        images={previewImages}
        initialIndex={previewIndex}
      />
    </>
  );
};

export default ProductDetail;
