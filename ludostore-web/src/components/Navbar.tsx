import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { getUserInitials } from "../utils/helper/initials";
import { LogoutModal } from "./modals/LogoutModal";
import {
  User,
  LogOut,
  ShoppingBag,
  Package,
  ChevronDown,
  Menu,
  X,
  Gamepad2,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Spinner } from "./loading/Spinner";
import { useCartStore } from "../store/cartStore";

const Navbar = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { itemCount, fetchCartCount } = useCartStore();

  useEffect(() => {
    fetchCartCount();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.first_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <Gamepad2 className="w-6 h-6 text-yellow-500" />
              <span className="text-white font-semibold text-lg">
                Ludo<span className="text-yellow-500">Kingdom</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-5">
              <Link
                to="/products"
                className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 rounded-3xl transition-colors text-sm cursor-pointer"
              >
                <Package className="w-4 h-4" />
                Products
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 rounded-3xl transition-colors text-sm cursor-pointer"
                onClick={() => setIsProfileOpen(false)}
              >
                <Heart className="w-4 h-4" />
                My Wishlist
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 rounded-3xl transition-colors text-sm cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner size="lg" color="yellow" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#353535] rounded-full pl-2.5 pr-2 py-1 border border-white/10 hover:border-yellow-500/50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-bold text-xs">
                      {getUserInitials(
                        user?.first_name,
                        user?.last_name,
                        user?.email,
                      )}
                    </div>
                    <span className="text-white text-sm hidden sm:block">
                      {displayName}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-[#1e1e1e] rounded-lg shadow-lg border border-white/10 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white font-medium text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors text-sm cursor-pointer"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors text-sm cursor-pointer"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Heart className="w-4 h-4" />
                            My Wishlist
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors text-sm cursor-pointer"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            My Orders
                          </Link>
                          <div className="h-px bg-white/10 my-1" />
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setShowLogoutModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth/login"
                    className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-3 border-t border-white/10">
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/products"
                      className="flex items-center gap-2.5 px-2 py-2 text-gray-300 hover:bg-white/5 rounded-md transition-colors text-sm cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      Products
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center gap-2.5 px-2 py-2 text-gray-300 hover:bg-white/5 rounded-md transition-colors text-sm cursor-pointer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart
                    </Link>
                    {!isAuthenticated && (
                      <Link
                        to="/auth/login"
                        className="flex items-center gap-2.5 px-2 py-2 text-gray-300 hover:bg-white/5 rounded-md transition-colors text-sm cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Navbar;
