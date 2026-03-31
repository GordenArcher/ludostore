import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Crown,
  Filter,
  ChevronRight,
  Gamepad2,
  Dice6,
  Sparkles,
  Gem,
  LayoutGrid,
} from "lucide-react";
import type { Category } from "../../types/product";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: string | null;
  featuredOnly: boolean;
  onCategoryChange: (categoryId: string | null) => void;
  onFeaturedChange: (featured: boolean) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, any> = {
    ludo: Gamepad2,
    dice: Dice6,
    accessories: Sparkles,
    premium: Gem,
  };
  const Icon = icons[categoryName.toLowerCase()];
  return Icon ? (
    <Icon className="w-4 h-4" />
  ) : (
    <LayoutGrid className="w-4 h-4" />
  );
};

export const FilterSidebar = ({
  isOpen,
  onClose,
  categories,
  selectedCategoryId,
  featuredOnly,
  onCategoryChange,
  onFeaturedChange,
  onClearFilters,
  isLoading = false,
}: FilterSidebarProps) => {
  const hasActiveFilters = selectedCategoryId !== null || featuredOnly;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
          width: "auto",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          fixed top-0 left-0 bottom-0 w-80 bg-[#1a1a1a] border-r border-white/10 z-50 overflow-y-auto
          lg:relative lg:top-auto lg:left-auto lg:bottom-auto lg:translate-x-0 lg:w-72 lg:bg-transparent lg:border-none
          ${!isOpen && "lg:hidden"}
        `}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-yellow-500" />
              <h3 className="text-white font-semibold text-lg">Filters</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-yellow-500" />
            <h3 className="text-white font-semibold text-lg">Filters</h3>
          </div>

          <div className="mb-8">
            <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-yellow-500" />
              Categories
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onCategoryChange(null);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between group ${
                  !selectedCategoryId
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm">All Products</span>
                </span>
                {!selectedCategoryId && (
                  <ChevronRight className="w-4 h-4 text-yellow-500" />
                )}
              </button>

              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-3 py-2">
                      <div className="h-5 bg-[#2a2a2a] rounded animate-pulse" />
                    </div>
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange(category.id);
                        onClose();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between group ${
                        selectedCategoryId === category.id
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(category.name)}
                        <span className="text-sm">{category.name}</span>
                      </span>
                      {selectedCategoryId === category.id && (
                        <ChevronRight className="w-4 h-4 text-yellow-500" />
                      )}
                    </button>
                  ))}
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={() => {
                onFeaturedChange(!featuredOnly);
                onClose();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between group ${
                featuredOnly
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Featured Only</span>
              </span>
              {featuredOnly && (
                <ChevronRight className="w-4 h-4 text-yellow-500" />
              )}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearFilters();
                onClose();
              }}
              className="w-full mt-4 px-4 py-2.5 border border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};
