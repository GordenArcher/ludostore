import { useState } from "react";
import { motion } from "framer-motion";
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { verifyPayment } from "../../api/order";
import { Spinner } from "../loading/Spinner";

interface PayNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  orderNumber: string;
  reference: string;
  amount: string;
}

export const PayNowModal = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderNumber,
  reference,
  amount,
}: PayNowModalProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      await verifyPayment(reference);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Payment verification failed. Please contact support.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[#1e1e1e] rounded-xl w-full max-w-md mx-4 overflow-hidden border border-white/20 shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-yellow-500" />
            Complete Payment
          </h3>
          <button
            onClick={onClose}
            disabled={isVerifying || success}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-5">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-white font-medium mb-1">Payment Verified!</p>
              <p className="text-gray-400 text-sm">
                Your order has been confirmed.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Order Number</span>
                  <span className="text-white text-sm font-medium">
                    {orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Amount</span>
                  <span className="text-yellow-500 text-sm font-medium">
                    GH₵ {parseFloat(amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Click the button below to verify your payment. This will confirm
                your order and update its status.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          {!success ? (
            <>
              <button
                onClick={onClose}
                disabled={isVerifying}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Spinner size="lg" color="white" />
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Verify Payment
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm font-medium cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
