import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Package, ArrowRight } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { Link } from "react-router-dom";
import { Spinner } from "../../components/loading/Spinner";

const Verification = () => {
  const [searchParams] = useSearchParams();
  const { verifyPayment, selectedOrder } = useOrderStore();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    const paymentRef = reference || trxref;

    if (!paymentRef) {
      setStatus("error");
      setErrorMessage("No payment reference found");
      return;
    }

    const verify = async () => {
      const order = await verifyPayment(paymentRef);
      if (order) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage("Payment verification failed. Please contact support.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {status === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Spinner size="xl" color="yellow" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-white text-xl font-semibold mt-6 mb-2"
            >
              Verifying Payment...
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-gray-400"
            >
              Please wait while we confirm your payment
            </motion.p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, type: "spring", damping: 20 }}
            className="text-center max-w-md mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4"
            >
              <XCircle className="w-10 h-10 text-red-500" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-white text-xl font-semibold mb-2"
            >
              Payment Failed
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="text-gray-400 mb-6"
            >
              {errorMessage ||
                "Something went wrong with your payment. Please try again."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                View My Orders
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-yellow-500 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Return to Cart
              </Link>
            </motion.div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, type: "spring", damping: 20 }}
            className="text-center max-w-md mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-white text-xl font-semibold mb-2"
            >
              Payment Successful!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="text-gray-400 mb-6"
            >
              Your order has been confirmed. You can view the details below.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              <Link
                to={`/orders/summary/${selectedOrder?.id}`}
                className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4" />
                View Order Details
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-yellow-500 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Continue Shopping
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -50,
                    rotate: 0,
                  }}
                  animate={{
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: [
                      "#f59e0b",
                      "#eab308",
                      "#10b981",
                      "#ef4444",
                    ][Math.floor(Math.random() * 4)],
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Verification;
