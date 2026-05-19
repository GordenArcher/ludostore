import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { onAuthExpired } from "./utils/authEvents";

function App() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    return onAuthExpired(() => {
      clearAuth();
      navigate("/admin/auth/login", { replace: true });
    });
  }, [clearAuth, navigate]);

  return <Outlet />;
}

export default App;
