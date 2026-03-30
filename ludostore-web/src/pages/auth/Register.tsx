import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "../../api/auth";
import type { ApiErrorResponse } from "../../types/auth";
import { isAxiosError } from "axios";
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  UserPlus,
  AlertCircle,
  Loader2,
  MailCheck,
  ArrowRight,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUri = searchParams.get("redirect") || "/";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.length < 2) return "First name must be at least 2 characters";
        return null;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.length < 2) return "Last name must be at least 2 characters";
        return null;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return null;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return null;
      default:
        return null;
    }
  };

  const getLocalError = (field: string): string | null => {
    if (!touched[field]) return null;
    let value = "";
    switch (field) {
      case "firstName":
        value = firstName;
        break;
      case "lastName":
        value = lastName;
        break;
      case "email":
        value = email;
        break;
      case "password":
        value = password;
        break;
      case "confirmPassword":
        value = confirmPassword;
        break;
    }
    return validateField(field, value);
  };

  // Clear errors when typing
  useEffect(() => {
    if (error) setError(null);
  }, [firstName, lastName, email, password, confirmPassword]);

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Local validation
    const firstNameError = validateField("firstName", firstName);
    const lastNameError = validateField("lastName", lastName);
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    const confirmPasswordError = validateField(
      "confirmPassword",
      confirmPassword,
    );

    if (
      firstNameError ||
      lastNameError ||
      emailError ||
      passwordError ||
      confirmPasswordError
    ) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        confirm_password: confirmPassword,
      });

      if (response.data) {
        setRegisteredEmail(email);
        setSuccess(true);
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
          setError(
            errorData.message || "Registration failed. Please try again.",
          );
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && !success) {
      handleSubmit();
    }
  };

  // If registration successful, show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(48,48,48)] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#1e1e1e] rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <MailCheck className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-2xl font-bold mb-3"
            >
              Check Your Email
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-gray-400 text-sm mb-2"
            >
              We've sent a verification email to
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-yellow-500 font-medium text-base mb-4"
            >
              {registeredEmail}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-gray-500 text-xs mb-8"
            >
              Please click the verification link in your email to activate your
              account.
              <br />
              If you don't see it, check your spam folder.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={() =>
                  navigate(
                    `/auth/login?email=${encodeURIComponent(registeredEmail)}`,
                  )
                }
                className="w-full cursor-pointer bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold py-2.5 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSuccess(false)}
                className="w-full cursor-pointer text-gray-400 hover:text-white text-sm transition-colors"
              >
                Back to registration
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

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
            >
              {/*<div className="text-6xl mb-4">🎲</div>*/}
            </motion.div>
            <h1 className="text-white text-2xl font-bold mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm">
              Join Ludo Kingdom and start playing
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <User className="inline mr-2 text-yellow-500 w-4 h-4" />
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched({ ...touched, firstName: true })}
                  onKeyPress={handleKeyPress}
                  required
                  disabled={loading}
                  placeholder="John"
                  className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    getLocalError("firstName") || fieldErrors.first_name
                      ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                      : "border-white/20 focus:border-yellow-500 focus:ring-yellow-500/20"
                  }`}
                />
                <AnimatePresence>
                  {(getLocalError("firstName") || fieldErrors.first_name) && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1 text-red-400 text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getLocalError("firstName") ||
                        fieldErrors.first_name?.join(", ")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <User className="inline mr-2 text-yellow-500 w-4 h-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched({ ...touched, lastName: true })}
                  onKeyPress={handleKeyPress}
                  required
                  disabled={loading}
                  placeholder="Doe"
                  className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    getLocalError("lastName") || fieldErrors.last_name
                      ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                      : "border-white/20 focus:border-yellow-500 focus:ring-yellow-500/20"
                  }`}
                />
                <AnimatePresence>
                  {(getLocalError("lastName") || fieldErrors.last_name) && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1 text-red-400 text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {getLocalError("lastName") ||
                        fieldErrors.last_name?.join(", ")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

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

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <CheckCircle className="inline mr-2 text-yellow-500 w-4 h-4" />
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
                placeholder="••••••••"
                className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  getLocalError("confirmPassword") ||
                  fieldErrors.confirm_password
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-white/20 focus:border-yellow-500 focus:ring-yellow-500/20"
                }`}
              />
              <AnimatePresence>
                {(getLocalError("confirmPassword") ||
                  fieldErrors.confirm_password) && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {getLocalError("confirmPassword") ||
                      fieldErrors.confirm_password?.join(", ")}
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
              className="w-full cursor-pointer bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold py-2.5 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4 relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Account
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
              Already have an account?{" "}
              <Link
                to={`/auth/login?redirect=${encodeURIComponent(redirectUri)}`}
                className="text-yellow-500 hover:text-yellow-400 font-medium transition hover:underline"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
