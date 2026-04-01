import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Share2,
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
  Maximize2,
  ChevronRight,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { ProductDetailSkeleton } from "../../components/loading/productDetailSkeleton";
import { AddToCartModal } from "../../components/modals/AddToCartModal";
import { AddToWishlistModal } from "../../components/modals/AddToWishlistModal";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { selectedProduct, isLoadingProduct, fetchProductById, error } =
    useProductStore();
  const { isAuthenticated } = useAuthStore();
  const { getItemQuantity } = useCartStore();
  const { checkInWishlist, wishlist, fetchWishlist } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | undefined>();
  const [wishlistNotes, setWishlistNotes] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | undefined>();
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.is_in_wishlist !== undefined) {
        setIsInWishlist(selectedProduct.is_in_wishlist);
      }

      if (selectedProduct.is_in_cart !== undefined) {
        setIsInCart(selectedProduct.is_in_cart);
        if (selectedProduct.cart_quantity) {
          setCartQuantity(selectedProduct.cart_quantity);
          setQuantity(selectedProduct.cart_quantity);
        }
        if (selectedProduct.cart_item_id) {
          setCartItemId(selectedProduct.cart_item_id);
        }
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!isAuthenticated && selectedProduct) {
      const checkWishlist = async () => {
        const result = await checkInWishlist(selectedProduct.id);
        setIsInWishlist(result.is_in_wishlist);
        setWishlistItemId(result.item_id);
      };
      checkWishlist();

      const cartQty = getItemQuantity(selectedProduct.id);
      if (cartQty > 0) {
        setIsInCart(true);
        setCartQuantity(cartQty);
        setQuantity(cartQty);
      }
    }
  }, [isAuthenticated, selectedProduct]);

  useEffect(() => {
    if (wishlist && isInWishlist && selectedProduct) {
      const item = wishlist.items.find((i) => i.product === selectedProduct.id);
      if (item) {
        setWishlistNotes(item.notes);
        setWishlistItemId(item.id);
      }
    }
  }, [wishlist, isInWishlist, selectedProduct]);

  useEffect(() => {
    if (selectedProduct?.images) {
      const primaryImage = selectedProduct.images.find((img) => img.is_primary);
      if (primaryImage) {
        setSelectedImage(`http://localhost:8000${primaryImage.image}`);
        setSelectedImageIndex(
          selectedProduct.images.findIndex((img) => img.id === primaryImage.id),
        );
      } else if (selectedProduct.images[0]) {
        setSelectedImage(
          `http://localhost:8000${selectedProduct.images[0].image}`,
        );
        setSelectedImageIndex(0);
      }
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    setShowCartModal(true);
  };

  const handleWishlistClick = () => {
    setShowWishlistModal(true);
  };

  const handleWishlistSuccess = async () => {
    await fetchWishlist();
    setIsInWishlist(true);
  };

  const handleWishlistRemove = () => {
    setIsInWishlist(false);
    setWishlistItemId(undefined);
    setWishlistNotes(null);
  };

  const handleCartSuccess = (newQuantity: number) => {
    setCartQuantity(newQuantity);
    setIsInCart(newQuantity > 0);
    setQuantity(newQuantity);
  };

  const handleNextImage = () => {
    if (selectedProduct && selectedProduct.images.length > 0) {
      const nextIndex =
        (selectedImageIndex + 1) % selectedProduct.images.length;
      setSelectedImageIndex(nextIndex);
      setSelectedImage(
        `http://localhost:8000${selectedProduct.images[nextIndex].image}`,
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct && selectedProduct.images.length > 0) {
      const prevIndex =
        (selectedImageIndex - 1 + selectedProduct.images.length) %
        selectedProduct.images.length;
      setSelectedImageIndex(prevIndex);
      setSelectedImage(
        `http://localhost:8000${selectedProduct.images[prevIndex].image}`,
      );
    }
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
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

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
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "100% authentic products",
    },
    {
      icon: Award,
      title: "Best Price Guarantee",
      description: "Price match promise",
    },
    {
      icon: Package,
      title: "Secure Packaging",
      description: "Carefully packed for delivery",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[rgb(48,48,48)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10 shadow-xl group"
              >
                <div
                  className="relative aspect-square cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={selectedImage}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowImageModal(true);
                    }}
                    className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
                      <Tag className="w-3 h-3" />-{discount}%
                    </span>
                  )}
                  {selectedProduct.featured && (
                    <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
                      <Crown className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  {isInCart && cartQuantity > 0 && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
                      <ShoppingCart className="w-3 h-3" />
                      In Cart ({cartQuantity})
                    </span>
                  )}
                </div>
              </motion.div>

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
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          setSelectedImageIndex(index);
                        }}
                        className={`relative cursor-pointer aspect-square bg-[#1e1e1e] rounded-xl overflow-hidden border-2 transition-all ${
                          isActive
                            ? "border-yellow-500 shadow-lg"
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-full">
                  {selectedProduct.category_name}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                {selectedProduct.name}
              </h1>

              {selectedProduct.sku && (
                <p className="text-gray-500 text-sm">
                  SKU: {selectedProduct.sku}
                </p>
              )}

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-yellow-500">
                    GH₵ {price.toFixed(2)}
                  </span>
                  {regularPrice && (
                    <span className="text-gray-500 text-lg line-through">
                      GH₵ {regularPrice.toFixed(2)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-sm font-medium rounded-full">
                      Save GH₵ {(regularPrice! - price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#1e1e1e] rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-gray-400 leading-relaxed">
                  {selectedProduct.description ||
                    "No description available for this product."}
                </p>
              </div>

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
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isInCart && cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={handleWishlistClick}
                  className={`px-5 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isInWishlist
                      ? "bg-red-500 hover:bg-red-600 text-white border border-red-500"
                      : "bg-[#1e1e1e] border border-white/20 text-white hover:border-yellow-500 hover:text-yellow-500"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isInWishlist ? "fill-white" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {isInWishlist ? "Saved to Wishlist" : "Wishlist"}
                  </span>
                </button>
                <button className="px-5 py-3.5 bg-[#1e1e1e] border border-white/20 rounded-xl text-white hover:border-yellow-500 hover:text-yellow-500 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

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

      <AnimatePresence>
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-yellow-500 transition-colors z-10 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative">
                <img
                  src={selectedImage}
                  alt={selectedProduct.name}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />

                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}
              </div>

              {selectedProduct.images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                  {selectedProduct.images.map((image, index) => {
                    const imageUrl = `http://localhost:8000${image.image}`;
                    const isActive = selectedImage === imageUrl;
                    return (
                      <button
                        key={image.id}
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          setSelectedImageIndex(index);
                        }}
                        className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          isActive
                            ? "border-yellow-500"
                            : "border-white/30 hover:border-yellow-500/50"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={{
          id: selectedProduct.id,
          name: selectedProduct.name,
          current_price: selectedProduct.current_price,
          images: selectedProduct.images,
          stock_quantity: selectedProduct.stock_quantity,
        }}
        initialQuantity={cartQuantity}
        onSuccess={handleCartSuccess}
      />

      <AddToWishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        productId={selectedProduct.id}
        productName={selectedProduct.name}
        isInWishlist={isInWishlist}
        existingItemId={wishlistItemId}
        existingNotes={wishlistNotes}
        onSuccess={handleWishlistSuccess}
        onRemove={handleWishlistRemove}
      />
    </>
  );
};

export default ProductDetail;
