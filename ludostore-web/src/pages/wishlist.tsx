import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Edit2,
  Star,
  ChevronRight,
} from "lucide-react";
import { useWishlistStore } from "../store/wishlistStore";
import { Spinner } from "../components/loading/Spinner";
import WishlistSkeleton from "../components/loading/wishlistSkeleton";

const Wishlist = () => {
  const {
    wishlist,
    isLoading,
    fetchWishlist,
    removeFromWishlist,
    clearWishlist,
    updateNotes,
  } = useWishlistStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://via.placeholder.com/500x500?text=No+Image";
    return `http://localhost:8000${imagePath}`;
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
  };

  const handleUpdateNote = async (itemId: string) => {
    if (editingNoteText.trim()) {
      await updateNotes(itemId, editingNoteText.trim());
    }
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  if (isLoading) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                My Wishlist
              </h1>
            </div>
            <p className="text-gray-400">
              {wishlist?.total_items || 0}{" "}
              {wishlist?.total_items === 1 ? "item" : "items"} saved
            </p>
          </div>

          {wishlist && wishlist.total_items > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {!wishlist || wishlist.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-[#1e1e1e] rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Save items you love by clicking the heart icon on products
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Browse Products
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlist.items.map((item) => {
              const product = item.product_details;
              const primaryImage =
                product.images?.find((img) => img.is_primary) ||
                product.images?.[0];
              const isEditing = editingNoteId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-colors group"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative h-48 overflow-hidden bg-[#2a2a2a]">
                      <img
                        src={getImageUrl(primaryImage?.image || "")}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.sale_price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                          Sale
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-yellow-500 uppercase tracking-wider">
                          {product.category_name || "Product"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-white text-xs">4.5</span>
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-500 font-bold">
                          GH₵ {formatPrice(product.current_price)}
                        </span>
                        {product.sale_price && (
                          <span className="text-gray-500 text-sm line-through">
                            GH₵ {formatPrice(product.regular_price)}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="mb-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            placeholder="Add a note..."
                            rows={2}
                            autoFocus
                            className="w-full bg-[#2a2a2a] border border-yellow-500/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateNote(item.id)}
                              className="px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded text-xs font-medium transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingNoteId(null);
                                setEditingNoteText("");
                              }}
                              className="px-2 py-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 rounded text-xs transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : item.notes ? (
                        <div className="group/note relative">
                          <div className="p-2 bg-[#2a2a2a] rounded-lg">
                            <p className="text-gray-400 text-xs italic line-clamp-2">
                              "{item.notes}"
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setEditingNoteText(item.notes || "");
                            }}
                            className="absolute top-1 right-1 p-1 bg-[#2a2a2a] hover:bg-yellow-500/20 rounded opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-gray-400 hover:text-yellow-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNoteId(item.id);
                            setEditingNoteText("");
                          }}
                          className="w-full p-2 border border-dashed border-white/20 hover:border-yellow-500/50 rounded-lg text-gray-500 hover:text-yellow-500 text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          Add a note
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        View Product
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e1e1e] rounded-xl w-full max-w-sm mx-4 overflow-hidden border border-white/20"
            >
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Clear Wishlist</h3>
              </div>
              <div className="px-5 py-6">
                <p className="text-gray-300 text-sm">
                  Are you sure you want to remove all items from your wishlist?
                  This action cannot be undone.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await clearWishlist();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
