import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Printer,
  Download,
  ChevronRight,
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import OrderDetailSkeleton from "../../components/loading/orderDetailSkeleton";

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

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, fetchOrderById, clearSelectedOrder } =
    useOrderStore();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
    return () => {
      clearSelectedOrder();
    };
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://via.placeholder.com/80x80?text=No+Image";
    return `http://localhost:8000${imagePath}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-[rgb(48,48,48)] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">
            Order Not Found
          </h2>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[selectedOrder.order_status]?.icon || Package;
  const status =
    statusConfig[selectedOrder.order_status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg text-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

        <div ref={printRef} className="print:bg-white print:p-0">
          <div className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden print:border print:border-gray-200 print:shadow-none">
            <div className="p-5 sm:p-6 border-b border-white/10 print:border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white print:text-black">
                    Order Details
                  </h1>
                  <p className="text-gray-400 text-sm mt-1 print:text-gray-600">
                    {selectedOrder.order_number}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color} print:border print:border-gray-300 print:bg-gray-100`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">
                    Order Date
                  </p>
                  <p className="text-white text-sm print:text-black mt-1">
                    {formatDateTime(selectedOrder.created_at)}
                  </p>
                </div>
                {selectedOrder.paid_at && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">
                      Payment Date
                    </p>
                    <p className="text-white text-sm print:text-black mt-1">
                      {formatDateTime(selectedOrder.paid_at)}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3 print:text-black">
                  <MapPin className="w-4 h-4 text-yellow-500 print:text-gray-600" />
                  Shipping Address
                </h3>
                <div className="bg-[#2a2a2a] rounded-lg p-4 print:bg-gray-50 print:border print:border-gray-200">
                  <p className="text-white font-medium print:text-black">
                    {selectedOrder.shipping_address?.recipient_name}
                  </p>
                  <p className="text-gray-400 text-sm mt-1 print:text-gray-600">
                    {selectedOrder.shipping_address?.street_address}
                    {selectedOrder.shipping_address?.apartment &&
                      `, ${selectedOrder.shipping_address.apartment}`}
                  </p>
                  <p className="text-gray-400 text-sm print:text-gray-600">
                    {selectedOrder.shipping_address?.city},{" "}
                    {selectedOrder.shipping_address?.state}
                  </p>
                  <p className="text-gray-400 text-sm print:text-gray-600">
                    {selectedOrder.shipping_address?.country}{" "}
                    {selectedOrder.shipping_address?.postal_code}
                  </p>
                  <p className="text-gray-500 text-sm mt-2 print:text-gray-500">
                    Phone: {selectedOrder.shipping_address?.phone_number}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3 print:text-black">
                  {selectedOrder.payment_method === "cash" ? (
                    <Banknote className="w-4 h-4 text-yellow-500 print:text-gray-600" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-yellow-500 print:text-gray-600" />
                  )}
                  Payment Method
                </h3>
                <div className="bg-[#2a2a2a] rounded-lg p-4 print:bg-gray-50 print:border print:border-gray-200">
                  <p className="text-white print:text-black">
                    {selectedOrder.payment_method === "cash"
                      ? "Cash on Delivery"
                      : "Paystack"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      selectedOrder.payment_status === "paid"
                        ? "text-green-500 print:text-green-700"
                        : "text-yellow-500 print:text-yellow-700"
                    }`}
                  >
                    Status: {selectedOrder.payment_status}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 print:text-black">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 sm:gap-4 py-3 border-b border-white/10 last:border-0 print:border-gray-200"
                    >
                      <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0 print:border print:border-gray-200">
                        <img
                          src={getImageUrl(item.product_image || "")}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm sm:text-base truncate print:text-black">
                          {item.product_name}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5 print:text-gray-500">
                          SKU: {item.product_sku}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                          <span className="text-gray-400 text-xs sm:text-sm print:text-gray-600">
                            Qty: {item.quantity} × GH₵{" "}
                            {formatPrice(item.price_at_purchase)}
                          </span>
                          <span className="text-yellow-500 font-medium text-sm sm:text-base print:text-yellow-700">
                            GH₵ {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 print:border-gray-200">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between text-gray-400 text-sm print:text-gray-600">
                    <span>Subtotal</span>
                    <span>GH₵ {formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm print:text-gray-600">
                    <span>Shipping</span>
                    <span>GH₵ {formatPrice(selectedOrder.shipping_fee)}</span>
                  </div>
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-green-500 text-sm print:text-green-700">
                      <span>Discount</span>
                      <span>- GH₵ {formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/10 my-2 print:bg-gray-200" />
                  <div className="flex justify-between text-white font-bold text-base sm:text-lg print:text-black">
                    <span>Total</span>
                    <span>GH₵ {formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.customer_note && (
                <div className="bg-[#2a2a2a] rounded-lg p-4 print:bg-gray-50 print:border print:border-gray-200">
                  <p className="text-gray-400 text-sm print:text-gray-500">
                    Note from you:
                  </p>
                  <p className="text-white text-sm mt-1 print:text-black">
                    {selectedOrder.customer_note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedOrder.order_status === "pending" &&
          selectedOrder.payment_method === "paystack" &&
          selectedOrder.payment_status === "pending" && (
            <div className="mt-6 flex justify-center">
              <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                <CreditCard className="w-4 h-4" />
                Complete Payment
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root, [ref] {
            visibility: visible;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          .print\\:text-gray-500 {
            color: #6b7280 !important;
          }
          .print\\:text-yellow-700 {
            color: #b45309 !important;
          }
          .print\\:text-green-700 {
            color: #15803d !important;
          }
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
