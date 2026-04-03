import axiosClient from "../utils/axios";
import type { DashboardStats, RevenueChartData } from "../types/dashboard";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosClient.get<{
    status: string;
    data: DashboardStats;
  }>("/operator/dashboard/stats/");
  return response.data.data;
};

export const getRevenueChart = async (
  period: "day" | "week" | "month" | "year" = "month",
  startDate?: string,
  endDate?: string,
): Promise<RevenueChartData> => {
  const params: Record<string, string> = { period };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await axiosClient.get<{
    status: string;
    data: RevenueChartData;
  }>("/operator/dashboard/revenue/", { params });
  return response.data.data;
};
