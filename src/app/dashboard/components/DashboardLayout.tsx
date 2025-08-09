"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { DASHBOARD_COLORS } from "../constants";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useDashboardStore } from "../store/useDashboardStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * DashboardLayout Component
 * Main layout wrapper for dashboard pages
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
  title = "Dashboard",
  subtitle = "Monitor your business performance and analytics",
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { user, connectWallet, disconnectWallet } = useDashboardStore();

  // Fetch user profile on dashboard layout mount
  const { fetchUserProfile } = useUserProfile();
  React.useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleConnectWallet = () => {
    if (user?.isConnected) {
      disconnectWallet();
    } else {
      // Simulate wallet connection with a mock address
      const mockWalletAddress = "0x742d35cc6628c532";
      connectWallet(mockWalletAddress);
    }
  };

  const handleNotificationClick = () => {
    console.log("Notification clicked");
    // You can implement notification logic here
  };

  return (
    <div
      className={cn("min-h-screen flex", className)}
      style={{
        background: DASHBOARD_COLORS.PRIMARY_BG,
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
        onItemClick={(itemId) => {
          console.log("Navigation item clicked:", itemId);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile menu button - only show on mobile when sidebar is closed */}
        <div className="lg:hidden flex items-center justify-between p-4">
          <button
            onClick={handleMobileSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          {/* Mobile TopBar actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 relative"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5-5V9a6 6 0 1 0-12 0v3l-5 5h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
                />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </button>

            <button
              onClick={handleConnectWallet}
              className="text-xs px-2 py-1 rounded bg-blue-600/20 border border-blue-500/50 text-white"
            >
              {user?.isConnected ? "●" : "○"}
            </button>
          </div>
        </div>

        {/* Desktop TopBar */}
        <div className="hidden lg:block">
          <TopBar
            title={title}
            subtitle={subtitle}
            onNotificationClick={handleNotificationClick}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
function useUserProfile(): { fetchUserProfile: any; } {
  throw new Error("Function not implemented.");
}

