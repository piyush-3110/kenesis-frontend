import { create } from "zustand";
import {
  DashboardState,
  DashboardUser,
  DashboardMetric,
  Transaction,
} from "../types";

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
  addTransaction: (transaction: Transaction) => void;

  // UI state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Combined actions
  initializeDashboard: () => Promise<void>;
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
  initializeDashboard: async () => {
    const { setLoading, setError, setUser, setMetrics, setTransactions } =
      get();

    try {
      setLoading(true);
      setError(null);

      // Get real user data from auth store instead of mock data
      const { useAuthStore } = await import("@/store/useAuthStore");
      const authUser = useAuthStore.getState().user;

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

      // Mock metrics
      const mockMetrics: DashboardMetric[] = [
        {
          id: "revenue",
          title: "Today's Revenue",
          value: "$15,000,000",
          change: {
            percentage: 12.5,
            direction: "up",
            period: "from yesterday",
          },
          trend: [100, 120, 110, 140, 130, 160, 150],
        },
        {
          id: "orders",
          title: "Today's Orders",
          value: "1,234",
          change: {
            percentage: 8.2,
            direction: "up",
            period: "from yesterday",
          },
          trend: [80, 90, 85, 100, 95, 110, 105],
        },
        {
          id: "visitors",
          title: "Today's Visitors",
          value: "45,678",
          change: {
            percentage: 3.1,
            direction: "down",
            period: "from yesterday",
          },
          trend: [200, 190, 195, 180, 185, 175, 170],
        },
      ];

      // Mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          userWallet: "0x742d35cc6628c532",
          from: "0x742d35cc6628c532",
          to: "0x8ba1f109551bd432",
          amount: 2500,
          currency: "USDT",
          timestamp: new Date(),
          status: "completed",
          type: "transfer",
        },
        {
          id: "2",
          userWallet: "0x123abc456def789",
          from: "0x123abc456def789",
          to: "0x987fed654cba321",
          amount: 1000,
          currency: "USDT",
          timestamp: new Date(Date.now() - 3600000),
          status: "completed",
          type: "deposit",
        },
        {
          id: "3",
          userWallet: "0x456def789abc123",
          from: "0x456def789abc123",
          to: "0x321cba654fed987",
          amount: 800,
          currency: "USDT",
          timestamp: new Date(Date.now() - 7200000),
          status: "pending",
          type: "withdrawal",
        },
      ];

      // Don't set mockUser anymore since we're using real user data above
      setMetrics(mockMetrics);
      setTransactions(mockTransactions);
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
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      setError(null);

      // Simulate data refresh
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, you would refetch data here
      console.log("Dashboard data refreshed");
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
