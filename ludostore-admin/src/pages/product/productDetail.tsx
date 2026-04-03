import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import {
  updateProductStock,
  addProductImage,
  updateProduct,
  deleteProduct,
} from "../../api/products";
import { Spinner } from "../../components/loader/spinner";
import { DeleteConfirmModal } from "../../components/modal/deleteConfirmModal";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, isLoading, fetchProduct, clearSelected } =
    useProductStore();
  const [editingStock, setEditingStock] = useState(false);
  const [stockValue, setStockValue] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
    return () => {
      clearSelected();
    };
  }, [id]);

  const handleUpdateStock = async () => {
    if (stockValue < 0) return;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="text-center py-12">
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
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/products/${id}/edit`)}
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

        {successMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-yellow-500" />
                Product Images
              </h2>

              <div className="space-y-3">
                {selectedProduct.images?.map((img) => (
                  <div key={img.id} className="relative group">
                    <div
                      className={`flex items-center gap-3 p-2 rounded-lg border ${img.is_primary ? "border-yellow-500" : "border-gray-800"} bg-gray-900`}
                    >
                      <img
                        src={img.image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                      />
                      <div className="flex-1">
                        {img.is_primary && (
                          <span className="text-xs text-yellow-500">
                            Primary
                          </span>
                        )}
                      </div>
                      {!img.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(img.id)}
                          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors cursor-pointer"
                        >
                          Set Primary
                        </button>
                      )}
                    </div>
                  </div>
                ))}

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
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <h2 className="text-white font-semibold mb-4">
                Product Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Name
                  </label>
                  <p className="text-white text-lg font-medium">
                    {selectedProduct.name}
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    SKU
                  </label>
                  <p className="text-white">{selectedProduct.sku}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Description
                  </label>
                  <p className="text-gray-300">
                    {selectedProduct.description || "No description"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">
                      Category
                    </label>
                    <p className="text-white">
                      {selectedProduct.category_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${selectedProduct.is_active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
                    >
                      {selectedProduct.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                Pricing
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Regular Price
                  </label>
                  <p className="text-white text-xl font-bold">
                    GH₵{" "}
                    {parseFloat(selectedProduct.regular_price).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Sale Price
                  </label>
                  <p className="text-white text-xl font-bold">
                    {selectedProduct.sale_price
                      ? `GH₵ ${parseFloat(selectedProduct.sale_price).toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Box className="w-4 h-4 text-yellow-500" />
                Stock Management
              </h2>

              {editingStock ? (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={stockValue}
                    onChange={(e) =>
                      setStockValue(parseInt(e.target.value) || 0)
                    }
                    className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateStock}
                    disabled={updatingStock}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {updatingStock ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    onClick={() => setEditingStock(false)}
                    className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {selectedProduct.stock_quantity}
                    </p>
                    <p className="text-sm text-gray-400">units available</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingStock(true);
                      setStockValue(selectedProduct.stock_quantity);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Update Stock
                  </button>
                </div>
              )}
            </div>

            <div className="bg-black rounded-xl border border-gray-800 p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-500" />
                Meta Information
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Created</span>
                  <span className="text-white text-sm">
                    {new Date(selectedProduct.created_at).toLocaleString()}
                  </span>
                </div>
                {selectedProduct.featured && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Featured</span>
                    <span className="text-yellow-500 text-sm">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => {}}
        onDelete={handleDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default ProductDetail;
