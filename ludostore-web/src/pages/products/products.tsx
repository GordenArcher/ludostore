import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  X,
  Filter,
  LayoutGrid,
  Crown,
  SlidersHorizontal,
  DollarSign,
  Box,
  ArrowUpDown,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { ProductCard } from "../../components/productCard";
import { ProductCardSkeleton } from "../../components/loading/productCardSkeleton";
import { FilterSidebar } from "../../components/filterSidebar";
import type { Product } from "../../types/product";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localSort, setLocalSort] = useState("-created_at");

  const {
    products,
    categories,
    pagination,
    isLoadingProducts,
    isLoadingCategories,
    currentPage,
    categoryId,
    searchQuery,
    featuredOnly,
    fetchProducts,
    fetchCategories,
    setPage,
    setCategoryFilter,
    setSearchQuery,
    setFeaturedOnly,
    setSortBy,
    setPriceRange,
    setInStockOnly,
    clearFilters,
    filters,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const foundCategory = categories.find((c) => c.slug === categorySlug);
      if (foundCategory && foundCategory.id !== categoryId) {
        setCategoryFilter(foundCategory.id);
      }
    }

    const sortParam = searchParams.get("sort");
    if (sortParam && sortParam !== localSort) {
      setLocalSort(sortParam);
      setSortBy(sortParam);
    }

    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    if (minPrice || maxPrice) {
      setPriceRange({
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : 10000,
      });
    }

    const inStock = searchParams.get("in_stock");
    if (inStock === "true") {
      setInStockOnly(true);
    }
  }, [searchParams, categories]);

  const sortingOptions = [
    { value: "-created_at", label: "Newest First", icon: Sparkles },
    { value: "created_at", label: "Oldest First", icon: Sparkles },
    { value: "-current_price", label: "Price: High to Low", icon: DollarSign },
    { value: "current_price", label: "Price: Low to High", icon: DollarSign },
    { value: "name", label: "Name: A to Z", icon: ArrowUpDown },
    { value: "-name", label: "Name: Z to A", icon: ArrowUpDown },
  ];

  const handleSortChange = (value: string) => {
    setLocalSort(value);
    setSortBy(value);
    setSearchParams({ ...Object.fromEntries(searchParams), sort: value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const hasActiveFilters =
    categoryId !== null ||
    featuredOnly ||
    filters.inStockOnly ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 10000;

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-7 h-7 lg:w-8 lg:h-8 text-yellow-500" />
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                {selectedCategory ? selectedCategory.name : "All Products"}
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] border border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-yellow-500 transition-colors text-sm cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isSidebarOpen ? "Hide Filters" : "Show Filters"}
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              )}
            </button>
          </div>
          <p className="text-gray-400 text-sm lg:text-base">
            Discover premium Ludo boards, dice sets, and accessories
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/20 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </form>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-[#1e1e1e] border border-white/20 rounded-lg text-white hover:border-yellow-500 transition-colors cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              )}
            </button>

            <div className="relative">
              <select
                value={localSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-[#1e1e1e] border border-white/20 rounded-lg px-3 py-2.5 pr-8 text-white text-sm focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                {sortingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-gray-400 text-xs">Active filters:</span>
            {categoryId && selectedCategory && (
              <button
                onClick={() => setCategoryFilter(null)}
                className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-lg hover:bg-yellow-500/30 transition-colors cursor-pointer"
              >
                <Package className="w-3 h-3" />
                <span>Category: {selectedCategory.name}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {featuredOnly && (
              <button
                onClick={() => setFeaturedOnly(false)}
                className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-lg hover:bg-yellow-500/30 transition-colors cursor-pointer"
              >
                <Crown className="w-3 h-3" />
                <span>Featured Only</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.inStockOnly && (
              <button
                onClick={() => setInStockOnly(false)}
                className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-lg hover:bg-yellow-500/30 transition-colors cursor-pointer"
              >
                <Box className="w-3 h-3" />
                <span>In Stock Only</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {(filters.priceRange.min > 0 || filters.priceRange.max < 10000) && (
              <button
                onClick={() => setPriceRange({ min: 0, max: 10000 })}
                className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-lg hover:bg-yellow-500/30 transition-colors cursor-pointer"
              >
                <DollarSign className="w-3 h-3" />
                <span>
                  Price: GH₵ {filters.priceRange.min} - GH₵{" "}
                  {filters.priceRange.max}
                </span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-gray-400 text-xs hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6 lg:gap-8">
          <FilterSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            categories={categories}
            selectedCategoryId={categoryId}
            featuredOnly={featuredOnly}
            inStockOnly={filters.inStockOnly}
            priceRange={filters.priceRange}
            onCategoryChange={setCategoryFilter}
            onFeaturedChange={setFeaturedOnly}
            onInStockChange={setInStockOnly}
            onPriceRangeChange={setPriceRange}
            onClearFilters={clearFilters}
            isLoading={isLoadingCategories}
          />

          <div className="flex-1 min-w-0">
            <div className="mb-4 text-gray-400 text-xs sm:text-sm flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {isLoadingProducts
                  ? "Loading..."
                  : `${pagination?.total || 0} product${pagination?.total !== 1 ? "s" : ""} found`}
              </span>
              {pagination && pagination.total_pages > 1 && (
                <span className="text-gray-500 text-xs">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {isLoadingProducts ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-16 lg:py-20">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto bg-[#1e1e1e] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600" />
                  </div>
                  <h3 className="text-white text-lg lg:text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-yellow-500 hover:text-yellow-400 inline-flex items-center gap-1 text-sm cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              ) : (
                products.map((product: Product, index: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))
              )}
            </div>

            {pagination && pagination.total_pages > 1 && !isLoadingProducts && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 lg:mt-12">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  className="p-2 bg-[#1e1e1e] border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 sm:gap-2">
                  {Array.from(
                    { length: Math.min(5, pagination.total_pages) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-8.5 sm:min-w-10 h-8 sm:h-10 rounded-lg transition-all text-sm ${
                            currentPage === pageNum
                              ? "bg-yellow-500 text-gray-900 font-bold"
                              : "bg-[#1e1e1e] border border-white/20 text-white hover:border-yellow-500"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className="p-2 bg-[#1e1e1e] border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
