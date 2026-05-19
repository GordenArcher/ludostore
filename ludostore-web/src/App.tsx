import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import { ScrollToTop } from "./components/scrollToTop";
import { onAuthExpired } from "./utils/authEvents";

function App() {
  const { checkAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    return onAuthExpired(() => {
      clearAuth();
      if (!location.pathname.startsWith("/auth/login")) {
        navigate(
          `/auth/login?redirect=${encodeURIComponent(location.pathname)}`,
          { replace: true },
        );
      }
    });
  }, [clearAuth, location.pathname, navigate]);

  return (
    <div>
      <Navbar />
      <ScrollToTop />

      <Outlet />

      <Footer />
    </div>
  );
}

export default App;
