import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { verifyOtp } from "../../api/auth";
import type { ApiErrorResponse } from "../../types/auth";
import { isAxiosError } from "axios";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Mail,
} from "lucide-react";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      setOtpCode(token);
      handleAutoVerify(token);
    }
  }, [token]);

  const handleAutoVerify = async (code: string) => {
    setVerifying(true);
    setError(null);

    try {
      const response = await verifyOtp({ otp_code: code });

      if (response.data) {
        setSuccess(true);
        setVerifiedEmail(response.data?.message || "Your account");
      }
    } catch (err: any) {
      if (isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        setError(errorData.message || "Verification failed. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!otpCode.trim()) {
      setFieldErrors({ otp_code: ["OTP code is required"] });
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await verifyOtp({ otp_code: otpCode });

      if (response.data) {
        setSuccess(true);
        setVerifiedEmail(response.data?.message || "Your account");
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
            errorData.message || "Verification failed. Please try again.",
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
    if (e.key === "Enter" && !loading && !verifying) {
      handleSubmit();
    }
  };

  // If verifying from token
  if (verifying) {
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
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
            </motion.div>

            <h1 className="text-white text-2xl font-bold mb-3">
              Verifying Your Account
            </h1>
            <p className="text-gray-400 text-sm">
              Please wait while we verify your account...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // If verification successful
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
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-2xl font-bold mb-3"
            >
              Account Verified! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-gray-400 text-sm mb-2"
            >
              {verifiedEmail} has been successfully verified.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-xs mb-8"
            >
              You can now login to your account and start shopping!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <button
                onClick={() => navigate("/auth/login")}
                className="w-full bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold py-2.5 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Manual verification form
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
              {/*<div className="text-6xl mb-4">🔐</div>*/}
            </motion.div>
            <h1 className="text-white text-2xl font-bold mb-2">
              Verify Your Account
            </h1>
            <p className="text-gray-400 text-sm">
              Enter the verification code sent to your email
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
                <ShieldCheck className="inline mr-2 text-yellow-500 w-4 h-4" />
                Verification Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
                placeholder="Enter 6-digit code"
                className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center text-lg tracking-widest ${
                  fieldErrors.otp_code
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-white/20 focus:border-yellow-500 focus:ring-yellow-500/20"
                }`}
              />
              <AnimatePresence>
                {fieldErrors.otp_code && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 text-red-400 text-xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.otp_code?.join(", ")}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
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
                    Verifying...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify Account
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="text-center">
              <p className="text-gray-500 text-xs">
                Didn't receive a code? Check your spam folder or{" "}
                <button className="text-yellow-500 hover:text-yellow-400 transition">
                  resend code
                </button>
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-6 pt-5 border-t border-white/10 text-center"
          >
            <p className="text-gray-400 text-sm">
              <Mail className="inline mr-1 w-3 h-3" />
              Need help?{" "}
              <button
                onClick={() => navigate("/auth/login")}
                className="text-yellow-500 hover:text-yellow-400 font-medium transition hover:underline"
              >
                Back to Login
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;
