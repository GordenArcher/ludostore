import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
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
  <div className="bg-black rounded-xl border border-gray-800 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 w-20 bg-gray-800 rounded" />
        <div className="h-8 w-28 bg-gray-800 rounded mt-2" />
      </div>
      <div className="w-10 h-10 bg-gray-800 rounded-lg" />
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, delay }: any) => (
  <div
    className="bg-black rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors"
    style={{ animation: `fadeInUp ${delay}s ease-out` }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-3">
        {trend > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span
          className={`text-xs ${trend > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {Math.abs(trend)}% from last month
        </span>
      </div>
    )}
  </div>
);

const periodOptions = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const COLORS = ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-3 shadow-xl">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-yellow-500 text-sm">
          Revenue: GH₵ {payload[0].value.toLocaleString()}
        </p>
        {payload[0].payload.orders && (
          <p className="text-gray-400 text-xs">
            Orders: {payload[0].payload.orders}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            />
            <StatCard
              title="Revenue"
              value={`GH₵ ${parseFloat(stats?.revenue.total || "0").toLocaleString()}`}
              icon={DollarSign}
              delay={0.1}
            />
            <StatCard
              title="Products"
              value={stats?.products.total.toLocaleString() || "0"}
              icon={Package}
              delay={0.15}
            />
            <StatCard
              title="Customers"
              value={stats?.users.total.toLocaleString() || "0"}
              icon={Users}
              delay={0.2}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Revenue Overview
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                {periodOptions.find((p) => p.value === selectedPeriod)?.label}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showPeriodDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPeriod(option.value as any);
                        setShowPeriodDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                        selectedPeriod === option.value
                          ? "text-white bg-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isChartLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
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
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-black rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Order Status
          </h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
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
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    borderColor: "#1f1f1f",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-black rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Stock Status
          </h2>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
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
                    backgroundColor: "#000",
                    borderColor: "#1f1f1f",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {lowStockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-black rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-800 rounded mt-1 animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
                    <div className="h-5 w-16 bg-gray-800 rounded mt-1 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recent_orders.slice(0, 5).map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                  style={{
                    animation: `fadeInUp ${0.4 + index * 0.05}s ease-out`,
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      GH₵ {parseFloat(order.total).toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.order_status === "pending"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : order.order_status === "processing"
                            ? "bg-blue-500/20 text-blue-500"
                            : order.order_status === "delivered"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
