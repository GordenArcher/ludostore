import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  User,
  Phone,
  Shield,
  Ban,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { getUsers, updateUserStatus, updateUserRole } from "../api/users";
import type { AdminUserItem } from "../types/user";
import CustomersSkeleton from "../components/loader/customersSkeleton";
import { ConfirmationModal } from "../components/modal/confirmationModal";
import type { Pagination } from "../types/product";

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-500 border border-purple-500/20",
  operator: "bg-blue-500/20 text-blue-500 border border-blue-500/20",
  customer: "bg-green-500/20 text-green-500 border border-green-500/20",
};

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "blocked">("active");
  const [newRole, setNewRole] = useState<"admin" | "operator" | "customer">(
    "customer",
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params);
  }, [search, roleFilter, statusFilter, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(currentPage, 20, {
        search: search || undefined,
        role: roleFilter || undefined,
        account_status: statusFilter || undefined,
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUserStatus(
        selectedUser.id,
        newStatus,
        blockReason || undefined,
      );
      await fetchUsers();
      setShowStatusModal(false);
      setSelectedUser(null);
      setBlockReason("");
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser.id, newRole);
      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update role", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const getRoleLabel = () => {
    if (roleFilter === "operator") return "Operator";
    if (roleFilter === "customer") return "Customer";
    return "All Roles";
  };

  const getStatusLabel = () => {
    if (statusFilter === "active") return "Active";
    if (statusFilter === "blocked") return "Blocked";
    return "All Status";
  };

  const hasActiveFilters = search || roleFilter || statusFilter;

  if (isLoading && users.length === 0) {
    return <CustomersSkeleton />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
              showFilters
                ? "bg-gray-800 border-gray-600 text-white"
                : "border-gray-700 text-gray-400 hover:bg-gray-800"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            )}
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500 transition-colors text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-b border-gray-800 bg-black"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Role
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(!showRoleDropdown);
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <span>{getRoleLabel()}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${showRoleDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {showRoleDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setRoleFilter("");
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                                roleFilter === ""
                                  ? "text-yellow-500 bg-gray-800"
                                  : "text-gray-300"
                              }`}
                            >
                              All Roles
                            </button>
                            <button
                              onClick={() => {
                                setRoleFilter("operator");
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                                roleFilter === "operator"
                                  ? "text-yellow-500 bg-gray-800"
                                  : "text-gray-300"
                              }`}
                            >
                              Operator
                            </button>
                            <button
                              onClick={() => {
                                setRoleFilter("customer");
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                                roleFilter === "customer"
                                  ? "text-yellow-500 bg-gray-800"
                                  : "text-gray-300"
                              }`}
                            >
                              Customer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowStatusDropdown(!showStatusDropdown);
                          setShowRoleDropdown(false);
                        }}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <span>{getStatusLabel()}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${showStatusDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {showStatusDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setStatusFilter("");
                                setShowStatusDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                                statusFilter === ""
                                  ? "text-yellow-500 bg-gray-800"
                                  : "text-gray-300"
                              }`}
                            >
                              All Status
                            </button>
                            <button
                              onClick={() => {
                                setStatusFilter("active");
                                setShowStatusDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                                statusFilter === "active"
                                  ? "text-yellow-500 bg-gray-800"
                                  : "text-gray-300"
                              }`}
                            >
                              Active
                            </button>
                            <button
                              onClick={() => {
                                setStatusFilter("blocked");
                                setShowStatusDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${
                                statusFilter === "blocked"
                                  ? "text-yellow-500 bg-gray-800"
                                  : "text-gray-300"
                              }`}
                            >
                              Blocked
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-gray-800">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Contact
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Joined
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Orders
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Total Spent
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Role
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
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone className="w-3 h-3" />
                          {user.phone_number || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-white text-center">
                        {user.orders_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        GH₵ {parseFloat(user.total_spent).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            user.account_status === "active"
                              ? "bg-green-500/20 text-green-500 border border-green-500/20"
                              : "bg-red-500/20 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {user.account_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewStatus(
                                user.account_status === "active"
                                  ? "blocked"
                                  : "active",
                              );
                              setShowStatusModal(true);
                            }}
                            className={`p-1 transition-colors cursor-pointer ${
                              user.account_status === "active"
                                ? "text-red-400 hover:text-red-500"
                                : "text-green-400 hover:text-green-500"
                            }`}
                          >
                            {user.account_status === "active" ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
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
                onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.has_next}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedUser(null);
          setBlockReason("");
        }}
        onConfirm={handleUpdateStatus}
        title={newStatus === "active" ? "Activate User" : "Block User"}
        message={
          newStatus === "active"
            ? `Are you sure you want to activate ${selectedUser?.first_name} ${selectedUser?.last_name}?`
            : `Are you sure you want to block ${selectedUser?.first_name} ${selectedUser?.last_name}? Blocked users cannot access the system.`
        }
        confirmText={newStatus === "active" ? "Activate" : "Block"}
        cancelText="Cancel"
        type={newStatus === "active" ? "info" : "danger"}
        isLoading={isUpdating}
      >
        {newStatus === "blocked" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Block Reason (Optional)
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Why is this user being blocked?"
              rows={2}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500 text-white text-sm resize-none"
            />
          </div>
        )}
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUpdateRole}
        title="Change User Role"
        message={`Change role for ${selectedUser?.first_name} ${selectedUser?.last_name}?`}
        confirmText="Update Role"
        cancelText="Cancel"
        type="info"
        isLoading={isUpdating}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            New Role
          </label>
          <div className="relative">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500 text-white text-sm cursor-pointer"
            >
              <option value="customer">Customer</option>
              <option value="operator">Operator</option>
            </select>
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default Customers;
