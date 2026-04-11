import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import { ScrollToTop } from "./components/scrollToTop";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
