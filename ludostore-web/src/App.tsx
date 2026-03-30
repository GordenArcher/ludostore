import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/Navbar";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div>
      <Navbar />
    </div>
  );
}

export default App;
