import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  Banknote,
  ArrowLeft,
  Check,
  Loader,
  Truck,
  Package,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { getDefaultAddress } from "../../api/address";
import { checkout } from "../../api/order";
import type { Address } from "../../types/address";
import { AddressSelectionModal } from "../../components/modals/AddressSelectionModal";
import { Spinner } from "../../components/loading/Spinner";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "paystack">(
    "cash",
  );
  const [customerNote, setCustomerNote] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login?redirect=/checkout");
      return;
    }
    fetchCart();
    loadDefaultAddress();
  }, []);

  const loadDefaultAddress = async () => {
    try {
      const defaultAddr = await getDefaultAddress();
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Failed to load default address", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    try {
      const response = await checkout({
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        customer_note: customerNote || undefined,
      });

      if (response.status === "success") {
        if (paymentMethod === "paystack" && response.data.payment) {
          window.location.href = response.data.payment.authorization_url;
        } else {
          navigate(`/orders/summary/${response.data.order.id}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const subtotal = cart ? parseFloat(cart.subtotal) : 0;
  const total = subtotal;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[rgb(48,48,48)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-yellow-500" />
                    Shipping Address
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {selectedAddress ? (
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">
                          {selectedAddress.recipient_name}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {selectedAddress.street_address}
                          {selectedAddress.apartment &&
                            `, ${selectedAddress.apartment}`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {selectedAddress.city}, {selectedAddress.state}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {selectedAddress.country}{" "}
                          {selectedAddress.postal_code}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          {selectedAddress.phone_number}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="w-full py-4 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    Add Shipping Address
                  </button>
                )}
              </div>

              <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
                <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      paymentMethod === "cash"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-white/10 hover:border-yellow-500/50"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">Cash on Delivery</p>
                      <p className="text-gray-400 text-xs">
                        Pay when your order arrives
                      </p>
                    </div>
                    {paymentMethod === "cash" && (
                      <Check className="w-4 h-4 text-yellow-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("paystack")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      paymentMethod === "paystack"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-white/10 hover:border-yellow-500/50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">Paystack</p>
                      <p className="text-gray-400 text-xs">
                        Pay with card, bank transfer, or mobile money
                      </p>
                    </div>
                    {paymentMethod === "paystack" && (
                      <Check className="w-4 h-4 text-yellow-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10">
                <h2 className="text-white font-semibold mb-4">
                  Order Notes (Optional)
                </h2>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Add special instructions for delivery..."
                  rows={3}
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#1e1e1e] rounded-xl p-6 border border-white/10 sticky top-24">
                <h2 className="text-white text-lg font-semibold mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-[#2a2a2a] rounded overflow-hidden shrink-0">
                        <img
                          src={
                            item.product_details.images?.[0]?.image
                              ? item.product_details.images[0].image
                              : "https://via.placeholder.com/48x48?text=No+Image"
                          }
                          alt={item.product_details.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm line-clamp-1">
                          {item.product_details.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-yellow-500 text-sm font-medium">
                        GH₵ {parseFloat(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>GH₵ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>GH₵ {total.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || isPlacingOrder}
                  className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPlacingOrder ? (
                    <>
                      <Spinner size="lg" color="white" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={setSelectedAddress}
      />
    </>
  );
};

export default Checkout;
