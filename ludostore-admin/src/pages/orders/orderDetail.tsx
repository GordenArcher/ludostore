import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ZoomIn,
} from "lucide-react";
import { getOrderDetail, updateOrderStatus } from "../../api/orders";
import type { AdminOrderDetail } from "../../types/order";
import { StatusUpdateModal } from "../../components/modal/statusUpdateModal";
import OrderDetailSkeleton from "../../components/loader/orderDetailSkeleton";
import { ImagePreviewModal } from "../../components/modal/ImagePreviewModal";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: { label: "Pending", color: "text-yellow-500", icon: Clock },
  processing: { label: "Processing", color: "text-blue-500", icon: RefreshCw },
  shipped: { label: "Shipped", color: "text-purple-500", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-500", icon: XCircle },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderDetail(id!);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string, adminNote: string) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(id!, newStatus, adminNote);
      await fetchOrder();
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(false);
      setShowStatusModal(false);
    }
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.order_status]?.icon || Package;
  const status = statusConfig[order.order_status] || statusConfig.pending;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors cursor-pointer"
          >
            Update Status
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {order.order_number}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} bg-opacity-10 border ${status.color.replace("text-", "border-")}/20 bg-${status.color.replace("text-", "")}/10`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-white">
                  GH₵ {parseFloat(order.total).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Customer Information
                </h2>
                <div className="bg-black rounded-lg p-4 space-y-2">
                  <p className="text-white">
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {order.customer.email}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {order.customer.phone_number || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Shipping Address
                </h2>
                <div className="bg-black rounded-lg p-4">
                  <p className="text-white">
                    {order.shipping_address.recipient_name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {order.shipping_address.street_address}
                  </p>
                  {order.shipping_address.apartment && (
                    <p className="text-gray-400 text-sm">
                      {order.shipping_address.apartment}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postal_code}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {order.shipping_address.country}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-2">
                    <Phone className="w-3 h-3" />
                    {order.shipping_address.phone_number}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  {order.payment_method === "cash" ? (
                    <Banknote className="w-4 h-4 text-gray-400" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-gray-400" />
                  )}
                  Payment Information
                </h2>
                <div className="bg-black rounded-lg p-4">
                  <p className="text-white capitalize">
                    {order.payment_method === "cash"
                      ? "Cash on Delivery"
                      : "Paystack"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${order.payment_status === "paid" ? "text-green-500" : "text-yellow-500"}`}
                  >
                    Status: {order.payment_status}
                  </p>
                  {order.paystack_reference && (
                    <p className="text-gray-500 text-xs mt-2">
                      Ref: {order.paystack_reference}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">
                  Order Items
                </h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="bg-black rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">
                            {item.product_name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            SKU: {item.product_sku}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Qty: {item.quantity} × GH₵{" "}
                            {parseFloat(
                              item.price_at_purchase,
                            ).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-yellow-500 font-medium">
                          GH₵ {parseFloat(item.subtotal).toLocaleString()}
                        </p>
                      </div>
                      {item.customization_images &&
                        item.customization_images.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <p className="text-gray-500 text-xs mb-2">
                              Customization Images:
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {item.customization_images.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setPreviewImages(item.customization_images);
                                    setPreviewIndex(idx);
                                    setShowImagePreview(true);
                                  }}
                                  className="cursor-pointer group relative"
                                >
                                  <img
                                    src={img}
                                    alt=""
                                    className="w-12 h-12 rounded object-cover bg-gray-800 hover:opacity-80 transition-opacity"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
                                    <ZoomIn className="w-4 h-4 text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {order.admin_note && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Admin Note
                  </h2>
                  <div className="bg-black rounded-lg p-4">
                    <p className="text-gray-400 text-sm">{order.admin_note}</p>
                  </div>
                </div>
              )}

              {order.customer_note && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Customer Note
                  </h2>
                  <div className="bg-black rounded-lg p-4">
                    <p className="text-gray-400 text-sm">
                      {order.customer_note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        currentStatus={order.order_status}
        isLoading={isUpdating}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        images={previewImages}
        initialIndex={previewIndex}
      />
    </>
  );
};

export default OrderDetail;
