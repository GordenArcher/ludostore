import { Clock, RefreshCw, Truck, CheckCircle, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

export interface PaymentStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const orderStatusConfig: Record<string, StatusConfig> = {
  pending: {
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: RefreshCw,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: XCircle,
  },
};

export const paymentStatusConfig: Record<string, PaymentStatusConfig> = {
  pending: {
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  paid: {
    label: "Paid",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  failed: {
    label: "Failed",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  refunded: {
    label: "Refunded",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
};

export const getOrderStatus = (status: string): StatusConfig => {
  return orderStatusConfig[status] || orderStatusConfig.pending;
};

export const getPaymentStatus = (status: string): PaymentStatusConfig => {
  return paymentStatusConfig[status] || paymentStatusConfig.pending;
};
