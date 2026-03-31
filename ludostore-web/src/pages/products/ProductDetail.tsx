// pages/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Award,
  ChevronLeft,
  Minus,
  Plus,
  Check,
  X,
  Package,
  Crown,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { ProductDetailSkeleton } from "../../components/loading/productDetailSkeleton";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, isLoadingProduct, fetchProductById, error } =
    useProductStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (selectedProduct?.images) {
      const primaryImage = selectedProduct.images.find((img) => img.is_primary);
      if (primaryImage) {
        setSelectedImage(`http://localhost:8000${primaryImage.image}`);
      } else if (selectedProduct.images[0]) {
        setSelectedImage(
          `http://localhost:8000${selectedProduct.images[0].image}`,
        );
      }
    }
  }, [selectedProduct]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    // Add to cart logic here
    setTimeout(() => setAddingToCart(false), 1000);
  };

  if (isLoadingProduct) {
    return <ProductDetailSkeleton />;
  }

  if (error || !selectedProduct) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">
            Product Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = selectedImage;
  const isInStock =
    selectedProduct.stock_status === "in_stock" &&
    selectedProduct.stock_quantity > 0;
  const price = parseFloat(selectedProduct.current_price);
  const regularPrice = selectedProduct.sale_price
    ? parseFloat(selectedProduct.regular_price)
    : null;
  const discount = regularPrice
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  const features = [
    { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "100% authentic products",
    },
    { icon: Award, title: "Best Price", description: "Price match guarantee" },
  ];

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Products</span>
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10 shadow-xl"
            >
              <div className="relative aspect-square">
                <img
                  src={mainImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
                      <Tag className="w-3 h-3" />-{discount}%
                    </span>
                  )}
                  {selectedProduct.featured && (
                    <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
                      <Crown className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            {selectedProduct.images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="grid grid-cols-4 gap-3"
              >
                {selectedProduct.images.map((image, index) => {
                  const imageUrl = `http://localhost:8000${image.image}`;
                  const isActive = selectedImage === imageUrl;
                  return (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`relative aspect-square bg-[#1e1e1e] rounded-xl overflow-hidden border-2 transition-all ${
                        isActive
                          ? "border-yellow-500 shadow-lg shadow-yellow-500/20"
                          : "border-white/10 hover:border-yellow-500/50"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${selectedProduct.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-yellow-500/10" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Category */}
            <div>
              <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-full">
                {selectedProduct.category_name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              {selectedProduct.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= 4
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-medium ml-1">4.5</span>
              </div>
              <span className="text-gray-500 text-sm">
                • 128 customer reviews
              </span>
              {selectedProduct.sku && (
                <span className="text-gray-500 text-sm">
                  • SKU: {selectedProduct.sku}
                </span>
              )}
            </div>

            {/* Price Section */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-yellow-500">
                  ${price.toFixed(2)}
                </span>
                {regularPrice && (
                  <span className="text-gray-500 text-lg line-through">
                    ${regularPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-sm font-medium rounded-full">
                    Save ${(regularPrice! - price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/10">
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-gray-400 leading-relaxed">
                {selectedProduct.description ||
                  "No description available for this product."}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">In Stock</span>
                  <span className="text-xs text-green-400">
                    ({selectedProduct.stock_quantity} units available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full">
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {isInStock && (
              <div className="space-y-3">
                <label className="text-gray-300 text-sm font-medium block">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#1e1e1e] border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            selectedProduct.stock_quantity,
                            quantity + 1,
                          ),
                        )
                      }
                      disabled={quantity >= selectedProduct.stock_quantity}
                      className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm">
                    Max {selectedProduct.stock_quantity} units
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || addingToCart}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button className="px-5 py-3.5 bg-[#1e1e1e] border border-white/20 rounded-xl text-white hover:border-yellow-500 hover:text-yellow-500 transition-all flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
              <button className="px-5 py-3.5 bg-[#1e1e1e] border border-white/20 rounded-xl text-white hover:border-yellow-500 hover:text-yellow-500 transition-all flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-3 p-3 bg-[#1e1e1e] rounded-xl border border-white/10"
                >
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {feature.title}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
