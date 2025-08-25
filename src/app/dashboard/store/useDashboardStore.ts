import { create } from "zustand";
import {
  DashboardState,
  DashboardUser,
  DashboardMetric,
  Transaction,
} from "../types";
import { DashboardApi, UserDashboardAnalytics } from "@/lib/api/dashboardApi";
import type { User } from "@/types/auth"; // Single source of truth for User

interface DashboardActions {
  // Navigation actions
  setSelectedMenuItem: (itemId: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // User actions
  setUser: (user: DashboardUser | null) => void;
  connectWallet: (walletAddress: string) => void;
  disconnectWallet: () => void;

  // Data actions
  setMetrics: (metrics: DashboardMetric[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAnalytics: (analytics: UserDashboardAnalytics | null) => void;
  addTransaction: (transaction: Transaction) => void;

  // UI state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Combined actions
  initializeDashboard: (authUser?: User | null) => Promise<void>;
  refreshData: () => Promise<void>;
  reset: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

const initialState: DashboardState = {
  selectedMenuItem: "initial-panel",
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  user: null,
  metrics: [],
  transactions: [],
  analytics: null,
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  // Navigation actions
  setSelectedMenuItem: (itemId: string) => {
    set({ selectedMenuItem: itemId });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ isSidebarCollapsed: collapsed });
  },

  setMobileSidebarOpen: (open: boolean) => {
    set({ isMobileSidebarOpen: open });
  },

  // User actions
  setUser: (user: DashboardUser | null) => {
    set({ user });
  },

  connectWallet: (walletAddress: string) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          walletAddress,
        },
      });
    }
  },

  disconnectWallet: () => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          walletAddress: undefined,
        },
      });
    }
  },

  // Data actions
  setMetrics: (metrics: DashboardMetric[]) => {
    set({ metrics });
  },

  setTransactions: (transactions: Transaction[]) => {
    set({ transactions });
  },

  setAnalytics: (analytics: UserDashboardAnalytics | null) => {
    set({ analytics });
  },

  addTransaction: (transaction: Transaction) => {
    const currentTransactions = get().transactions;
    set({
      transactions: [transaction, ...currentTransactions].slice(0, 50), // Keep only latest 50
    });
  },

  // UI state actions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Combined actions
  initializeDashboard: async (authUser?: User | null) => {
    const {
      setLoading,
      setError,
      setUser,
      setMetrics,
      setTransactions,
      setAnalytics,
    } = get();

    try {
      setLoading(true);
      setError(null);

      if (authUser) {
        const dashboardUser: DashboardUser = {
          id: authUser.id,
          name: authUser.username || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          avatar: "", // No avatar in API yet, will be added later
          walletAddress: authUser.walletAddress || undefined,
        };
        setUser(dashboardUser);
      }

      // Fetch analytics from backend
      const analyticsRes = await DashboardApi.getAnalytics();
      if (!analyticsRes.success || !analyticsRes.data) {
        throw new Error(analyticsRes.message || "Failed to fetch analytics");
      }

      const analytics: UserDashboardAnalytics = analyticsRes.data;

      // Store the full analytics data
      setAnalytics(analytics);

      // Map today's metrics and totals
      const metrics: DashboardMetric[] = [
        {
          id: "revenue",
          title: "Today's Revenue",
          value: `$${analytics.today.revenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          trend: analytics.salesAnalytics.daily.slice(-7).map((p) => p.revenue),
        },
        {
          id: "orders",
          title: "Today's Orders",
          value: analytics.today.orders,
          trend: analytics.salesAnalytics.daily.slice(-7).map((p) => p.orders),
        },
        {
          id: "totalRevenue",
          title: "Total Revenue",
          value: `$${analytics.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          trend: analytics.salesAnalytics.monthly
            .slice(-6)
            .map((p) => p.revenue),
        },
        {
          id: "totalOrders",
          title: "Total Orders",
          value: analytics.totalOrders.toLocaleString(),
          trend: analytics.salesAnalytics.monthly
            .slice(-6)
            .map((p) => p.orders),
        },
      ];

      // Map backend transactions (purchases) into existing Transaction shape
      const transactions: Transaction[] = analytics.transactions.map((t) => ({
        id: t.id,
        from: t.buyer?.id || "buyer",
        to: t.course?.id || "course",
        amount: t.price,
        currency: t.token.split(":")[0] || "USD",
        timestamp: new Date(t.purchasedAt),
        status: "completed",
        type: "transfer",
        userWallet: t.buyer?.username || t.buyer?.id || "user",
      }));

      setMetrics(metrics);
      setTransactions(transactions);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize dashboard";
      setError(errorMessage);
      console.error("Dashboard initialization error:", error);
    } finally {
      setLoading(false);
    }
  },

  refreshData: async () => {
    const { setLoading, setError, initializeDashboard, user } = get();

    try {
      setLoading(true);
      setError(null);

      if (user) {
        const refreshUser: User = {
          id: user.id,
          username: user.name,
          email: user.email,
          createdAt: new Date().toISOString(),
          walletAddress: user.walletAddress,
        };
        await initializeDashboard(refreshUser);
      } else {
        await initializeDashboard(undefined);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh data";
      setError(errorMessage);
      console.error("Dashboard refresh error:", error);
    } finally {
      setLoading(false);
    }
  },

  reset: () => {
    set(initialState);
  },
}));
