import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getDashboardStats, getRevenueChart } from "../api/dashboard";
import type { DashboardStats, RevenueChartData } from "../types/dashboard";

const StatCardSkeleton = () => (
  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-800 rounded" />
        <div className="h-8 w-32 bg-gray-800 rounded" />
      </div>
      <div className="w-12 h-12 bg-gray-800 rounded-xl" />
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-yellow-500" />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-800">
        {trend > 0 ? (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-full">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs font-medium text-green-400">
              +{Math.abs(trend)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 rounded-full">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
        <span className="text-xs text-gray-500">from last month</span>
      </div>
    )}
  </motion.div>
);

const periodOptions = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl">
        <p className="text-gray-300 text-sm font-semibold mb-1">{label}</p>
        <p className="text-yellow-500 text-lg font-bold">
          GH₵ {payload[0].value.toLocaleString()}
        </p>
        {payload[0].payload.orders && (
          <p className="text-gray-400 text-xs mt-1">
            📦 {payload[0].payload.orders} orders
          </p>
        )}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<RevenueChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month" | "year"
  >((searchParams.get("period") as any) || "month");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  useEffect(() => {
    setSearchParams({ period: selectedPeriod });
    fetchChartData();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    setIsChartLoading(true);
    try {
      const data = await getRevenueChart(selectedPeriod);
      setChartData(data);
    } catch (error) {
      console.error("Failed to fetch chart data", error);
    } finally {
      setIsChartLoading(false);
    }
  };

  const revenueData =
    chartData?.labels.map((label, index) => ({
      name: label,
      revenue: chartData.revenue[index],
      orders: chartData.orders_count[index],
    })) || [];

  const pieData = [
    { name: "Pending", value: stats?.orders.pending || 0, color: "#eab308" },
    {
      name: "Processing",
      value: stats?.orders.processing || 0,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      value: stats?.orders.completed || 0,
      color: "#10b981",
    },
    {
      name: "Cancelled",
      value: stats?.orders.cancelled || 0,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const lowStockData = [
    {
      name: "Low Stock",
      value: stats?.products.low_stock || 0,
      color: "#eab308",
    },
    {
      name: "Out of Stock",
      value: stats?.products.out_of_stock || 0,
      color: "#ef4444",
    },
    {
      name: "In Stock",
      value:
        (stats?.products.total || 0) -
        (stats?.products.low_stock || 0) -
        (stats?.products.out_of_stock || 0),
      color: "#10b981",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-2"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 rounded-full px-4 py-2 border border-gray-800">
              <span className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <button className="p-2 bg-gray-900 rounded-full border border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Orders"
                value={stats?.orders.total.toLocaleString() || "0"}
                icon={ShoppingCart}
                delay={0.05}
                trend={12.5}
              />
              <StatCard
                title="Revenue"
                value={`GH₵ ${parseFloat(stats?.revenue.total || "0").toLocaleString()}`}
                icon={DollarSign}
                delay={0.1}
                trend={8.2}
              />
              <StatCard
                title="Products"
                value={stats?.products.total.toLocaleString() || "0"}
                icon={Package}
                delay={0.15}
                trend={-2.1}
              />
              <StatCard
                title="Customers"
                value={stats?.users.total.toLocaleString() || "0"}
                icon={Users}
                delay={0.2}
                trend={15.3}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Revenue Overview
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track your revenue trends over time
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  {periodOptions.find((p) => p.value === selectedPeriod)?.label}
                  <motion.div
                    animate={{ rotate: showPeriodDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showPeriodDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-36 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 overflow-hidden"
                    >
                      {periodOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedPeriod(option.value as any);
                            setShowPeriodDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            selectedPeriod === option.value
                              ? "bg-yellow-500/10 text-yellow-500 font-medium"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {isChartLoading ? (
              <div className="h-80 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-3 border-gray-700 border-t-yellow-500 rounded-full"
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `GH₵${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300"
          >
            <div>
              <h2 className="text-lg font-semibold text-white">
                Order Status Distribution
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Current order status breakdown
              </p>
            </div>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-3 border-gray-700 border-t-yellow-500 rounded-full"
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    label={{ fill: "#9ca3af", fontSize: 12 }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "12px",
                      padding: "8px 12px",
                    }}
                    formatter={(value: any) => [`${value} orders`, "Count"]}
                    labelStyle={{ color: "#e5e7eb" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300"
          >
            <div>
              <h2 className="text-lg font-semibold text-white">
                Inventory Health
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Stock levels across your products
              </p>
            </div>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-3 border-gray-700 border-t-yellow-500 rounded-full"
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={lowStockData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6b7280"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      borderRadius: "12px",
                      padding: "8px 12px",
                    }}
                    formatter={(value: any) => [`${value} products`, "Count"]}
                    labelStyle={{ color: "#e5e7eb" }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {lowStockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recent Orders
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Latest transactions from customers
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors cursor-pointer"
              >
                View All
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 animate-pulse"
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-800 rounded" />
                      <div className="h-3 w-24 bg-gray-800 rounded" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 w-20 bg-gray-800 rounded" />
                      <div className="h-5 w-16 bg-gray-800 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {stats?.recent_orders.slice(0, 5).map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between py-4 hover:bg-gray-800/50 transition-colors rounded-lg px-2 -mx-2 cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        GH₵ {parseFloat(order.total).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full mt-1 font-medium ${
                          order.order_status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                            : order.order_status === "processing"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : order.order_status === "delivered"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
