import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import type { ApiErrorResponse } from "../../types/auth";
import { isAxiosError } from "axios";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { Spinner } from "../../components/loading/Spinner";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUri = searchParams.get("redirect") || "/products";
  const prefilledEmail = searchParams.get("email") || "";

  const { checkAuth, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUri);
    }
  }, [isAuthenticated, navigate, redirectUri]);

  // Clear errors when typing
  useEffect(() => {
    if (error) setError(null);
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  }, [email, password]);

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true });

    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);

    if (emailError || passwordError) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await login({ email, password });

      if (response.data) {
        await checkAuth();
        navigate(redirectUri);
      }
    } catch (err: any) {
      if (isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;

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
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(48,48,48)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-[#1e1e1e] rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            ></motion.div>
            <h1 className="text-white text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">
              Sign in to continue to Ludo Kingdom
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm p-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Mail className="inline mr-2 text-yellow-500 w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
                placeholder="your@email.com"
                className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  getLocalError("email") || fieldErrors.email
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-white/20 focus:border-yellow-500 focus:ring-yellow-500/20"
                }`}
              />
              <AnimatePresence>
                {(getLocalError("email") || fieldErrors.email) && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getLocalError("email") || fieldErrors.email?.join(", ")}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Lock className="inline mr-2 text-yellow-500 w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
                placeholder="••••••••"
                className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  getLocalError("password") || fieldErrors.password
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-white/20 focus:border-yellow-500 focus:ring-yellow-500/20"
                }`}
              />
              <AnimatePresence>
                {(getLocalError("password") || fieldErrors.password) && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getLocalError("password") ||
                      fieldErrors.password?.join(", ")}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full cursor-pointer  bg-yellow-500 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold py-2.5 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center p-2 justify-center gap-2"
                  >
                    <Spinner size="md" color="white" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex text-white items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-6 pt-5 border-t border-white/10 text-center"
          >
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                to={`/auth/register?redirect=${encodeURIComponent(redirectUri)}`}
                className="text-yellow-500 hover:text-yellow-400 font-medium transition hover:underline"
              >
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
