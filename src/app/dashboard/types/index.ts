/**
 * Dashboard Types
 * Defines all TypeScript interfaces and types for the dashboard
 */

export interface DashboardMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href: string;
  isActive?: boolean;
  requiresRole?: string;
  badge?: {
    count: number;
    variant?: "primary" | "secondary" | "danger";
  };
  isSection?: boolean;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletAddress?: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: {
    percentage: number;
    direction: "up" | "down";
    period: string;
  };
  trend?: number[];
  icon?: React.ComponentType<{ className?: string }>;
}

// Legacy local transaction (wallet) representation used by Transactions component UI.
// We'll map backend analytics purchases into this shape minimally.
export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  type: "deposit" | "withdrawal" | "transfer";
  userWallet: string;
}

export interface DashboardState {
  selectedMenuItem: string;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  user: DashboardUser | null;
  metrics: DashboardMetric[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onItemClick?: (itemId: string) => void;
}

export interface UserProfileProps {
  user: DashboardUser;
  onViewProfile?: () => void;
  className?: string;
}

export interface NavigationItemProps {
  item: DashboardMenuItem;
  isActive?: boolean;
  onClick?: (item: DashboardMenuItem) => void;
  className?: string;
}
