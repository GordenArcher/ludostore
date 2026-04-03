import { useEffect } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "./loader/spinner";

export const ProtectedRoute = () => {
  const { fetchUser, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && location.pathname !== "/admin/auth/login") {
        navigate("/admin/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth/login" replace />;
  }

  return <Outlet />;
};
