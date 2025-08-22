import { apiClient } from "./client";
import type { ApiResponse } from "./apiTypes";

export interface TimeSeriesPoint {
  label: string;
  orders: number;
  revenue: number;
}

export interface DashboardTransaction {
  id: string;
  purchasedAt: string;
  course: { id: string; title: string; slug: string } | null;
  buyer: { id: string; username?: string | null } | null;
  price: number;
  token: string;
  transactionHash?: string;
  nftId?: string | null;
}

export interface UserDashboardAnalytics {
  today: { revenue: number; orders: number; visitors: null };
  totalRevenue: number;
  totalOrders: number;
  salesAnalytics: {
    daily: TimeSeriesPoint[];
    weekly: TimeSeriesPoint[];
    monthly: TimeSeriesPoint[];
    yearly: TimeSeriesPoint[];
  };
  returns: null;
  transactions: DashboardTransaction[];
}

export const DashboardApi = {
  getAnalytics: async (): Promise<ApiResponse<UserDashboardAnalytics>> => {
    return apiClient.get<UserDashboardAnalytics>(
      "/api/users/dashboard/analytics"
    );
  },
};

export type { ApiResponse } from "./apiTypes";
