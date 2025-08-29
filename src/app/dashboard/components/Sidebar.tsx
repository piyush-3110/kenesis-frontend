"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProps } from "../types";
import { useDashboardStore } from "../store/useDashboardStore";
import { useLogout } from "@/features/auth/hooks";

import {
  DASHBOARD_MENU_ITEMS,
  DASHBOARD_BOTTOM_ITEMS,
  DASHBOARD_COLORS,
} from "../constants";
import NavigationItem from "./NavigationItem";
import UserProfile from "./UserProfile";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import Link from "next/link";
import Image from "next/image";

/**
 * Sidebar Component
 * Main dashboard navigation sidebar with futuristic design
 */
const Sidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
  isMobileOpen = false,
  onMobileClose,
  onItemClick,
}) => {
  const router = useRouter();
  const logout = useLogout();
  const {
    selectedMenuItem,
    setSelectedMenuItem,
    initializeDashboard,
    disconnectWallet,
  } = useDashboardStore();

  // Get real user data from auth store
  const { data: authUser } = useCurrentUser();

  // Create dashboard user object from auth user
  const user = authUser
    ? {
        id: authUser.id,
        name: authUser.username || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar: authUser.avatar, // No avatar in API yet, will be added later
        walletAddress: authUser.walletAddress || undefined,
      }
    : null;

  // Initialize dashboard data on mount
  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  const handleItemClick = (itemId: string) => {
    setSelectedMenuItem(itemId);
    onItemClick?.(itemId);

    // Close mobile sidebar when item is clicked
    if (isMobileOpen) {
      onMobileClose?.();
    }

    // Handle special cases
    if (itemId === "logout") {
      // Handle logout logic
      handleLogout();
      return;
    }
  };

  const handleLogout = async () => {
    try {
      // Disconnect wallet first
      disconnectWallet();

      // Call the proper logout action with toast notifications and redirects
      await logout.mutate();

      // The logout action will handle the redirect automatically
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect in case of unexpected errors
      router.push("/");
    }
  };

  const handleViewProfile = () => {
    // Navigate to profile page
    router.push("/dashboard/profile");

    // Close mobile sidebar if open
    if (isMobileOpen) {
      onMobileClose?.();
    }
  };

  const sidebarContent = (
    <div
      className="h-full flex flex-col"
      style={{
        background: DASHBOARD_COLORS.PRIMARY_BG,
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/images/landing/logo.png"
        alt="Kenesis Logo"
        width={100}
        height={120}
        priority
        className="h-6 w-24 md:h-8 md:w-36"
      />
    </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {/* Main navigation items */}
        <nav className="space-y-2">
          {DASHBOARD_MENU_ITEMS.filter(item => {
            // If item requires a role, check if user has that role
            if (item.requiresRole) {
              return authUser?.role === item.requiresRole;
            }
            // If no role required, show to all users
            return true;
          }).map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={selectedMenuItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </nav>

        {/* Divider */}
        <div
          className="my-6 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #0680FF 50%, transparent 100%)",
          }}
        />

        {/* Bottom navigation items */}
        <nav className="space-y-2">
          {DASHBOARD_BOTTOM_ITEMS.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={selectedMenuItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* User Profile */}
      {user && !isCollapsed && (
        <UserProfile user={user} onViewProfile={handleViewProfile} />
      )}

      {/* Collapsed user indicator */}
      {user && isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 transition-all duration-300",
          "border-r",
          // Desktop styles
          "lg:relative lg:translate-x-0 lg:z-10",
          // Mobile styles
          "lg:block",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Width - use proper responsive classes
          isCollapsed
            ? "w-16 lg:w-20" // Collapsed width
            : "w-64 lg:w-72 xl:w-80", // Full width with responsive scaling
          className
        )}
        style={{
          background: DASHBOARD_COLORS.PRIMARY_BG,
          borderRight: "1px solid transparent",
          borderImage: "linear-gradient(180deg, #0680FF 0%, #010519 88.45%) 1",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
