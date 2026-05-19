import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import { ScrollToTop } from "./components/scrollToTop";
import { onAuthExpired } from "./utils/authEvents";

function App() {
  const { checkAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    return onAuthExpired(() => {
      clearAuth();
    });
  }, [clearAuth]);

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
