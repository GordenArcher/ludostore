import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Image,
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";
import OrdersSkeleton from "../../components/loading/ordersSkeleton";
import { CustomImageModal } from "../../components/modals/CustomImageModal";
import { getCustomizationImages } from "../../api/customImage";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: RefreshCw,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: XCircle,
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-500" },
  paid: { label: "Paid", color: "text-green-500" },
  failed: { label: "Failed", color: "text-red-500" },
  refunded: { label: "Refunded", color: "text-orange-500" },
};

const Orders = () => {
  const { orders, pagination, isLoading, cancelOrder, fetchOrders } =
    useOrderStore();
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCustomImageModal, setShowCustomImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    orderId: string;
    itemId: string;
    productName: string;
  } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    setIsCancelling(true);
    await cancelOrder(cancelOrderId);
    setIsCancelling(false);
    setCancelOrderId(null);
  };

  const handleCustomImageClick = (
    orderId: string,
    itemId: string,
    productName: string,
  ) => {
    setSelectedItem({ orderId, itemId, productName });
    setShowCustomImageModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://via.placeholder.com/80x80?text=No+Image";
    return `http://localhost:8000${imagePath}`;
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-[#1e1e1e] rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              No Orders Yet
            </h1>
            <p className="text-gray-400 mb-8">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Start Shopping
              <ChevronRight className="w-4 h-4" />
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
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              My Orders
            </h1>
            <p className="text-gray-400 mt-1">
              {pagination?.total || orders.length} total orders
            </p>
          </div>

          <div className="space-y-5">
            {orders.map((order, index) => {
              const StatusIcon =
                statusConfig[order.order_status]?.icon || Package;
              const status =
                statusConfig[order.order_status] || statusConfig.pending;
              const paymentStatus =
                paymentStatusConfig[order.payment_status] ||
                paymentStatusConfig.pending;
              const canCancel =
                order.order_status === "pending" &&
                order.payment_method === "cash";
              const canCustomize =
                order.order_status === "pending" ||
                order.order_status === "processing";
              const firstItem = order.items[0];
              const hasMultipleItems = order.items.length > 1;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#1e1e1e] rounded-xl border border-white/10 hover:border-yellow-500/30 transition-all overflow-hidden"
                >
                  <div className="p-5 border-b border-white/10 bg-[#1a1a1a]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">Order Number</p>
                          <p className="text-white font-medium">
                            {order.order_number}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div>
                          <p className="text-gray-400 text-xs">Placed On</p>
                          <p className="text-white text-sm">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span
                          className={`text-xs font-medium ${paymentStatus.color}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(firstItem?.product_image || "")}
                          alt={firstItem?.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              to={`/product/${firstItem?.product}`}
                              className="text-white font-medium hover:text-yellow-500 transition-colors line-clamp-1"
                            >
                              {firstItem?.product_name}
                            </Link>
                            {hasMultipleItems && (
                              <p className="text-gray-500 text-sm mt-1">
                                + {order.items.length - 1} more item
                                {order.items.length - 1 !== 1 ? "s" : ""}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="text-gray-400">
                                Qty: {firstItem?.quantity}
                              </span>
                              <span className="text-gray-500">•</span>
                              <span className="text-yellow-500 font-medium">
                                GH₵{" "}
                                {formatPrice(
                                  firstItem?.price_at_purchase || "0",
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">
                              Total Amount
                            </p>
                            <p className="text-yellow-500 font-bold text-xl">
                              GH₵ {formatPrice(order.total)}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {order.payment_method === "cash"
                                ? "Cash on Delivery"
                                : "Paystack"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-gray-400 text-xs">
                            Shipping Address
                          </p>
                          <p className="text-gray-300 text-sm">
                            {order.shipping_address?.recipient_name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.shipping_address?.street_address}
                            {order.shipping_address?.apartment &&
                              `, ${order.shipping_address.apartment}`}
                            <br />
                            {order.shipping_address?.city},{" "}
                            {order.shipping_address?.state}{" "}
                            {order.shipping_address?.postal_code}
                            <br />
                            {order.shipping_address?.country}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">
                          {order.total_items}{" "}
                          {order.total_items === 1 ? "item" : "items"}
                        </span>
                        {canCustomize && (
                          <span className="flex items-center gap-1 text-xs text-yellow-500">
                            <Image className="w-3 h-3" />
                            Customizable
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Link
                          to={`/orders/summary/${order.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg text-sm transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                        {canCustomize && (
                          <button
                            onClick={() =>
                              handleCustomImageClick(
                                order.id,
                                firstItem.id,
                                firstItem.product_name,
                              )
                            }
                            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-sm transition-colors cursor-pointer"
                          >
                            <Image className="w-4 h-4" />
                            Add Image
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => setCancelOrderId(order.id)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                          </button>
                        )}
                        {order.order_status === "pending" &&
                          order.payment_method === "paystack" &&
                          order.payment_status === "pending" && (
                            <button className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg text-sm transition-colors cursor-pointer">
                              <CreditCard className="w-4 h-4" />
                              Pay Now
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => fetchOrders(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="flex items-center gap-1 px-4 py-2 bg-[#1e1e1e] border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from(
                  { length: Math.min(5, pagination.total_pages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchOrders(pageNum)}
                        className={`w-9 h-9 rounded-lg transition-all text-sm ${
                          pagination.page === pageNum
                            ? "bg-yellow-500 text-gray-900 font-medium"
                            : "bg-[#1e1e1e] border border-white/20 text-gray-400 hover:border-yellow-500"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>
              <button
                onClick={() => fetchOrders(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="flex items-center gap-1 px-4 py-2 bg-[#1e1e1e] border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!cancelOrderId}
        onClose={() => setCancelOrderId(null)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Go Back"
        type="danger"
        isLoading={isCancelling}
      />

      {selectedItem && (
        <CustomImageModal
          isOpen={showCustomImageModal}
          onClose={() => {
            setShowCustomImageModal(false);
            setSelectedItem(null);
          }}
          orderId={selectedItem.orderId}
          itemId={selectedItem.itemId}
          productName={selectedItem.productName}
        />
      )}
    </>
  );
};

export default Orders;
