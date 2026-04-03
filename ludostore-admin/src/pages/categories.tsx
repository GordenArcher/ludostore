import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getCategories, deleteCategory } from "../api/categories";
import type { AdminCategory } from "../types/product";
import CategoriesSkeleton from "../components/loader/categoriesSkeleton";
import { CategoryFormModal } from "../components/modal/categoryFormModal";
import { DeleteConfirmModal } from "../components/modal/deleteConfirmModal";

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] =
    useState<AdminCategory | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params);
  }, [search, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, search]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await getCategories(currentPage, 20, {
        search: search || undefined,
      });
      setCategories(response.data.categories);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && categories.length === 0) {
    return <CategoriesSkeleton />;
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
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="bg-black rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Slug
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Description
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Created
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <AnimatePresence mode="wait">
                  {categories.map((category, index) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {category.slug}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                        {category.description || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            category.is_active
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setShowModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(category)}
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

      <CategoryFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        onSuccess={fetchCategories}
        category={editingCategory}
      />

      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onSuccess={fetchCategories}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        onDelete={async () => {
          if (deletingCategory) {
            await deleteCategory(deletingCategory.id);
          }
        }}
      />
    </>
  );
};

export default Categories;
