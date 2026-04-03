import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { useProductStore } from "../store/productStore";
import { updateProductStock } from "../api/products";
import ProductsSkeleton from "../components/loader/productsSkeleton";
import { ProductFormModal } from "../components/modal/productFormModal";
import { DeleteConfirmModal } from "../components/modal/deleteConfirmModal";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products,
    categories,
    pagination,
    isLoading,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [lowStockFilter, setLowStockFilter] = useState(
    searchParams.get("low_stock") === "true",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [updatingStock, setUpdatingStock] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    if (lowStockFilter) params.low_stock = "true";
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params);
  }, [search, categoryFilter, statusFilter, lowStockFilter, currentPage]);

  useEffect(() => {
    fetchProducts(currentPage, {
      search: search || undefined,
      category_id: categoryFilter || undefined,
      is_active:
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
            ? false
            : undefined,
      low_stock: lowStockFilter || undefined,
    });
  }, [currentPage, search, categoryFilter, statusFilter, lowStockFilter]);

  const handleUpdateStock = async (productId: string) => {
    if (stockValue < 0) return;
    setUpdatingStock(true);
    try {
      await updateProductStock(productId, stockValue);
      await fetchProducts(currentPage, {
        search: search || undefined,
        category_id: categoryFilter || undefined,
        is_active:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
              ? false
              : undefined,
        low_stock: lowStockFilter || undefined,
      });
      setEditingStock(null);
      setStockValue(0);
    } catch (error) {
      console.error("Failed to update stock", error);
    } finally {
      setUpdatingStock(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    setLowStockFilter(false);
    setCurrentPage(1);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">
          Out of Stock
        </span>
      );
    }
    if (quantity < 10) {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
          Low Stock ({quantity})
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
        In Stock ({quantity})
      </span>
    );
  };

  const getPrimaryImage = (images: any[]) => {
    const primary = images?.find((img) => img.is_primary);
    if (primary) return primary.image_url;
    if (images?.[0]) return images[0].image_url;
    return null;
  };

  const hasActiveFilters =
    search || categoryFilter || statusFilter || lowStockFilter;

  if (isLoading && products.length === 0) {
    return <ProductsSkeleton />;
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
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        <div className="bg-black rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-white placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
                  showFilters
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-b border-gray-800 bg-gray-900"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white text-sm"
                    >
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lowStockFilter}
                        onChange={(e) => setLowStockFilter(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-300">
                        Low Stock Only (≤ 5 units)
                      </span>
                    </label>
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    SKU
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Stock
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Featured
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <AnimatePresence mode="wait">
                  {products.map((product, index) => (
                    <motion.tr
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {getPrimaryImage(product.images) ? (
                            <img
                              src={getPrimaryImage(product.images)}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        GH₵ {parseFloat(product.current_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {editingStock === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={stockValue}
                              onChange={(e) =>
                                setStockValue(parseInt(e.target.value) || 0)
                              }
                              className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-gray-500 text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateStock(product.id)}
                              disabled={updatingStock}
                              className="px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs rounded transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="px-2 py-1 border border-gray-700 text-gray-400 text-xs rounded hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStock(product.id);
                              setStockValue(product.stock_quantity);
                            }}
                            className="cursor-pointer"
                          >
                            {getStockBadge(product.stock_quantity)}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            product.is_active
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1 text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-800">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.has_prev}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.has_next}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          fetchProducts(currentPage, {
            search: search || undefined,
            category_id: categoryFilter || undefined,
            is_active:
              statusFilter === "active"
                ? true
                : statusFilter === "inactive"
                  ? false
                  : undefined,
            low_stock: lowStockFilter || undefined,
          });
        }}
        product={editingProduct}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onSuccess={() => {
          fetchProducts(currentPage, {
            search: search || undefined,
            category_id: categoryFilter || undefined,
            is_active:
              statusFilter === "active"
                ? true
                : statusFilter === "inactive"
                  ? false
                  : undefined,
            low_stock: lowStockFilter || undefined,
          });
        }}
        productId={deletingProduct?.id}
        productName={deletingProduct?.name}
      />
    </>
  );
};

export default Products;
