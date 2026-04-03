import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { getOrders } from "../../api/orders";
import type { AdminOrder } from "../../types/order";
import { Spinner } from "../../components/loader/spinner";
import OrdersSkeleton from "../../components/loader/ordersSkeleton";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  processing: "bg-blue-500/20 text-blue-500",
  shipped: "bg-purple-500/20 text-purple-500",
  delivered: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
};

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params);
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getOrders(currentPage, 20, {
        search: search || undefined,
        order_status: statusFilter || undefined,
      });
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && orders.length === 0) {
    return <OrdersSkeleton />;
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          Filters
          {(search || statusFilter) && (
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="bg-black rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by order number or customer email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 transition-colors text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Order
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Items
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <AnimatePresence mode="wait">
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-900 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.items_count}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      GH₵ {parseFloat(order.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.order_status]}`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-800">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black rounded-xl w-full max-w-md mx-4 overflow-hidden border border-gray-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Filter Orders</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Order Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Order number or customer email"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-gray-800">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;
