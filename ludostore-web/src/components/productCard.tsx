import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  Crown,
  Tag,
  Package,
  FileText,
} from "lucide-react";
import type { Product } from "../types/product";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useAuthStore } from "../store/authStore";
import { AddToCartModal } from "./modals/AddToCartModal";
import { AddToWishlistModal } from "./modals/AddToWishlistModal";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { isAuthenticated } = useAuthStore();
  const { getItemQuantity } = useCartStore();
  const { checkInWishlist } = useWishlistStore();

  const [showCartModal, setShowCartModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(
    product.is_in_wishlist || false,
  );
  const [wishlistItemId, setWishlistItemId] = useState<string | undefined>(
    product.cart_item_id,
  );
  const [wishlistNotes, setWishlistNotes] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(product.cart_quantity || 0);

  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const imageUrl = primaryImage?.image
    ? `http://localhost:8000${primaryImage.image}`
    : "https://via.placeholder.com/500x500?text=No+Image";

  const price = parseFloat(product.current_price);
  const regularPrice = product.sale_price
    ? parseFloat(product.regular_price)
    : null;
  const isInStock =
    product.stock_status === "in_stock" && product.stock_quantity > 0;

  useEffect(() => {
    if (!isAuthenticated && !product.is_in_wishlist) {
      const checkWishlist = async () => {
        const result = await checkInWishlist(product.id);
        setIsInWishlist(result.is_in_wishlist);
        setWishlistItemId(result.item_id);
      };
      checkWishlist();
    }

    if (!isAuthenticated && !product.is_in_cart) {
      const quantity = getItemQuantity(product.id);
      setCartQuantity(quantity);
    }
  }, [isAuthenticated, product.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWishlistModal(true);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCartModal(true);
  };

  const handleWishlistSuccess = () => {
    setIsInWishlist(true);
  };

  const handleWishlistRemove = () => {
    setIsInWishlist(false);
    setWishlistItemId(undefined);
    setWishlistNotes(null);
  };

  const handleCartSuccess = (quantity: number) => {
    setCartQuantity(quantity);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{ y: -4 }}
        className="group"
      >
        <Link to={`/products/${product.id}`} className="block">
          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-all duration-300">
            <div className="relative aspect-square overflow-hidden bg-[#2a2a2a]">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />

              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.sale_price && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                    <Tag className="w-3 h-3" />
                    Sale
                  </span>
                )}
                {product.featured && (
                  <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                    <Crown className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              {!isInStock && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold px-3 py-1.5 bg-red-500 rounded-lg text-sm">
                    Out of Stock
                  </span>
                </div>
              )}

              {cartQuantity > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                    <ShoppingCart className="w-3 h-3" />
                    {cartQuantity}
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <button
                  onClick={handleAddToCartClick}
                  disabled={!isInStock}
                  className="w-9 h-9 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button
                  onClick={handleWishlistClick}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 backdrop-blur-sm cursor-pointer ${
                    isInWishlist
                      ? "bg-red-500 text-white"
                      : "bg-black/50 hover:bg-red-500 text-white"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-yellow-500 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {product.category_name}
                </span>
              </div>

              <h3 className="text-white font-semibold mb-2 line-clamp-2 text-sm sm:text-base">
                {product.name}
              </h3>

              <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                {product.description ||
                  "Premium Ludo product for the ultimate gaming experience"}
              </p>

              <div className="flex items-baseline gap-2">
                <span className="text-yellow-500 font-bold text-lg">
                  GH₵ {price.toFixed(2)}
                </span>
                {regularPrice && (
                  <span className="text-gray-500 text-xs line-through">
                    GH₵ {regularPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={{
          id: product.id,
          name: product.name,
          current_price: product.current_price,
          images: product.images,
          stock_quantity: product.stock_quantity,
        }}
        initialQuantity={cartQuantity}
        onSuccess={handleCartSuccess}
      />

      <AddToWishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        productId={product.id}
        productName={product.name}
        isInWishlist={isInWishlist}
        existingItemId={wishlistItemId}
        existingNotes={wishlistNotes}
        onSuccess={handleWishlistSuccess}
        onRemove={handleWishlistRemove}
      />
    </>
  );
};
