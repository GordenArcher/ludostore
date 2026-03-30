import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  User,
  LogOut,
  ShoppingBag,
  Package,
  ChevronDown,
  Menu,
  X,
  Dice1,
  ShoppingCart,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "??";
    const firstInitial = user.first_name?.charAt(0) || "";
    const lastInitial = user.last_name?.charAt(0) || "";
    return (
      `${firstInitial}${lastInitial}`.toUpperCase() ||
      user.email?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  // Close dropdown when clicking outside
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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLogoutModal(false);
      }
    };
    if (showLogoutModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutModal]);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    setIsProfileOpen(false);
    navigate("/auth/login");
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/products" className="flex items-center gap-2 group">
              <div className="relative">
                <Dice1 className="w-8 h-8 text-yellow-500 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight">
                  Ludo<span className="text-yellow-500">Kingdom</span>
                </span>
                <span className="text-[10px] text-gray-500 -mt-1">
                  Premium Ludo Store
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/products"
                className="text-gray-300 hover:text-yellow-500 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Products</span>
              </Link>
              <Link
                to="/cart"
                className="text-gray-300 hover:text-yellow-500 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
              </Link>
            </div>

            {/* Right Section - Auth or Profile */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                // Loading state - show skeleton
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="w-20 h-8 bg-gray-700 rounded-lg animate-pulse hidden md:block"></div>
                </div>
              ) : isAuthenticated && user ? (
                // Authenticated - Show profile dropdown
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full pl-3 pr-2 py-1.5 transition-all border border-white/10 hover:border-yellow-500/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 font-bold text-sm">
                      {getUserInitials()}
                    </div>
                    <span className="text-white text-sm hidden sm:block">
                      {user.first_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 font-bold text-lg">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {user.email}
                            </p>
                            {user.role && (
                              <span className="inline-block mt-1 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                                {user.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 transition-colors group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="w-4 h-4 group-hover:text-yellow-500" />
                          <span className="flex-1">My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 transition-colors group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ShoppingBag className="w-4 h-4 group-hover:text-yellow-500" />
                          <span className="flex-1">My Orders</span>
                        </Link>
                        <div className="h-px bg-white/10 my-1"></div>
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors group"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="flex-1 text-left">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Not authenticated - Show login/register buttons
                <div className="flex items-center gap-3">
                  <Link
                    to="/auth/login"
                    className="hidden sm:block text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-medium hover:from-yellow-400 hover:to-yellow-500 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-2">
                <Link
                  to="/products"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  <span>Products</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                </Link>
                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-white/10 my-1"></div>
                    <Link
                      to="/auth/login"
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="bg-[#1e1e1e] rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-white text-xl font-semibold flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-400" />
                Logout Confirmation
              </h3>
            </div>

            <div className="px-6 py-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <LogOut className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-white text-lg font-medium mb-2">
                  Hey, {user?.first_name || "there"}! 👋
                </p>
                <p className="text-gray-400">
                  Are you sure you want to logout? You'll need to sign in again
                  to access your account.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-duration: 0.2s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }

        .fade-in {
          animation-name: fade-in;
        }

        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }

        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </>
  );
};

export default Navbar;
