import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  X,
  ArrowRight,
  Package,
  Edit2,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import {
  getGuestCart,
  updateGuestCartQuantity,
} from "../../utils/cart/guestCart";
import CartSkeleton from "../../components/loading/cartSkeleton";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";
import { LoginRequiredModal } from "../../components/modals/LoginRequiredModal";
import { UpdateQuantityModal } from "../../components/modals/UpdateQuantityModal";

const Cart = () => {
  const {
    cart,
    isLoading,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    initialize,
    hasInitialized,
  } = useCartStore();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [guestItems, setGuestItems] = useState<any[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    itemId: string;
    productId: string;
    name: string;
    currentQuantity: number;
    maxStock: number;
  } | null>(null);
  const [orderDetails, setOrderDetails] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && hasInitialized) {
      const guestCart = getGuestCart();
      setGuestItems(guestCart);
    }
  }, [isAuthenticated, isAuthLoading, itemCount, hasInitialized]);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://via.placeholder.com/500x500?text=No+Image";
    return imagePath;
  };

  const generateOrderDetails = () => {
    const items = isAuthenticated ? cart?.items || [] : guestItems;
    const subtotal = isAuthenticated
      ? parseFloat(cart?.subtotal || "0")
      : guestItems.reduce(
          (sum, item) => sum + parseFloat(item.price_at_add) * item.quantity,
          0,
        );

    let details = "Order Summary:\n\n";
    items.forEach((item: any, index: number) => {
      const name = isAuthenticated ? item.product_details?.name : item.name;
      const price = isAuthenticated
        ? parseFloat(item.product_details?.current_price || "0")
        : parseFloat(item.price_at_add);
      const quantity = item.quantity;
      details += `${index + 1}. ${name}\n   Quantity: ${quantity}\n   Price: GH₵ ${price.toFixed(2)}\n   Subtotal: GH₵ ${(price * quantity).toFixed(2)}\n\n`;
    });
    details += `-------------------\nTotal: GH₵ ${subtotal.toFixed(2)}`;
    return details;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      const details = generateOrderDetails();
      setOrderDetails(details);
      setShowLoginModal(true);
    } else {
      navigate("/checkout");
    }
  };

  const handleOpenQuantityModal = (
    itemId: string,
    productId: string,
    name: string,
    currentQuantity: number,
    maxStock: number = 99,
  ) => {
    setSelectedItem({
      itemId,
      productId,
      name,
      currentQuantity,
      maxStock,
    });
    setShowQuantityModal(true);
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!selectedItem) return;

    setIsUpdating(true);
    if (isAuthenticated) {
      await updateQuantity(
        selectedItem.itemId,
        selectedItem.productId,
        newQuantity,
      );
    } else {
      updateGuestCartQuantity(selectedItem.productId, newQuantity);
      setGuestItems(getGuestCart());
    }
    setIsUpdating(false);
    setShowQuantityModal(false);
    setSelectedItem(null);
  };

  const handleRemoveItem = async (itemId: string, productId: string) => {
    await removeItem(itemId, productId);
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    await clearCart();
    setIsClearing(false);
    setShowClearModal(false);
  };

  const cartItems = isAuthenticated ? cart?.items || [] : guestItems;
  const subtotal = isAuthenticated
    ? parseFloat(cart?.subtotal || "0")
    : guestItems.reduce(
        (sum, item) => sum + parseFloat(item.price_at_add) * item.quantity,
        0,
      );
  const totalItems = isAuthenticated
    ? cart?.total_items || 0
    : guestItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading || isAuthLoading || (!hasInitialized && !isAuthenticated)) {
    return <CartSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-[#1e1e1e] rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Your cart is empty
            </h1>
            <p className="text-gray-400 mb-6">
              Looks like you haven't added any items yet
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[rgb(48,48,48)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Shopping Cart
              </h1>
              <p className="text-gray-400 mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any, index: number) => {
                const product = isAuthenticated ? item.product_details : null;
                const name = isAuthenticated ? product?.name : item.name;
                const price = isAuthenticated
                  ? parseFloat(product?.current_price || "0")
                  : parseFloat(item.price_at_add);
                const image = isAuthenticated
                  ? product?.images?.find((img: any) => img.is_primary)
                      ?.image || product?.images?.[0]?.image
                  : item.image;
                const quantity = isAuthenticated
                  ? item.quantity
                  : item.quantity;
                const productId = isAuthenticated
                  ? item.product
                  : item.product_id;
                const itemId = isAuthenticated ? item.id : null;
                const stockQuantity = isAuthenticated
                  ? product?.stock_quantity || 99
                  : 99;

                return (
                  <motion.div
                    key={isAuthenticated ? item.id : item.product_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#1e1e1e] rounded-xl p-4 border border-white/10 hover:border-yellow-500/50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-[#2a2a2a] rounded-lg overflow-hidden shrink-0">
                        <img
                          src={getImageUrl(image || "")}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <Link
                              to={`/product/${productId}`}
                              className="text-white font-medium hover:text-yellow-500 transition-colors"
                            >
                              {name}
                            </Link>
                            <p className="text-yellow-500 font-bold mt-1">
                              GH₵ {price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(itemId || "", productId)
                            }
                            className="p-1 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() =>
                              handleOpenQuantityModal(
                                itemId || "",
                                productId,
                                name,
                                quantity,
                                stockQuantity,
                              )
                            }
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-gray-400" />
                            <span className="text-white text-sm">
                              Qty: {quantity}
                            </span>
                          </button>
                          <span className="text-white font-semibold">
                            GH₵ {(price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10 sticky top-24">
                <h2 className="text-white text-lg font-semibold mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span>GH₵ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>GH₵ {subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
        type="danger"
        isLoading={isClearing}
      />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        orderDetails={orderDetails}
      />

      {selectedItem && (
        <UpdateQuantityModal
          isOpen={showQuantityModal}
          onClose={() => {
            setShowQuantityModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleUpdateQuantity}
          productName={selectedItem.name}
          currentQuantity={selectedItem.currentQuantity}
          maxStock={selectedItem.maxStock}
          isLoading={isUpdating}
        />
      )}
    </>
  );
};

export default Cart;
