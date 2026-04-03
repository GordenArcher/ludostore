import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, AlertCircle, Gamepad2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { adminLogin } from "../../api/auth";
import { Spinner } from "../../components/loader/spinner";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, fetchUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return null;
      case "password":
        if (!value) return "Password is required";
        return null;
      default:
        return null;
    }
  };

  const getLocalError = (field: string): string | null => {
    if (!touched[field]) return null;
    const value = field === "email" ? email : password;
    return validateField(field, value);
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });

    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);

    if (emailError || passwordError) {
      setError("Please fix the errors above");
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      await adminLogin({ email, password });
      await fetchUser();
      setSuccess(true);
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.errors && typeof errorData.errors === "object") {
          setFieldErrors(errorData.errors);
          setError(errorData.message);
        } else if (errorData.errors && typeof errorData.errors === "string") {
          setError(errorData.errors);
        } else {
          setError(errorData.message || "Login failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !success) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">LudoKingdom Admin</h1>
          <p className="text-gray-500 mt-1">Sign in to manage your store</p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2 text-green-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Login successful! Redirecting...</span>
                </motion.div>
              )}

              {error && !success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || success}
                  className={`w-full pl-9 pr-3 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50 text-white placeholder-gray-500 ${
                    getLocalError(email) || fieldErrors.email
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  placeholder="admin@ludokingdom.com"
                />
              </div>
              <AnimatePresence>
                {(getLocalError("email") || fieldErrors.email) && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-red-500 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getLocalError("email") || fieldErrors.email?.join(", ")}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || success}
                  className={`w-full pl-9 pr-3 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:border-gray-600 transition-colors disabled:opacity-50 text-white placeholder-gray-500 ${
                    getLocalError(password) || fieldErrors.password
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              <AnimatePresence>
                {(getLocalError("password") || fieldErrors.password) && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-red-500 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getLocalError("password") ||
                      fieldErrors.password?.join(", ")}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || success}
              className="w-full bg-black/80 hover:bg-black/90 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center p-2  justify-center gap-2">
                  <Spinner size="lg" color="white" />
                </span>
              ) : (
                <p className="text-white">Sign In</p>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
