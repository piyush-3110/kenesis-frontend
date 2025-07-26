'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProps } from '../types';
import { useDashboardStore } from '../store/useDashboardStore';
import { 
  DASHBOARD_MENU_ITEMS, 
  DASHBOARD_BOTTOM_ITEMS, 
  DASHBOARD_CONFIG,
  DASHBOARD_COLORS 
} from '../constants';
import NavigationItem from './NavigationItem';
import UserProfile from './UserProfile';
import { cn } from '@/lib/utils';
import { X, Menu } from 'lucide-react';

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
  const {
    selectedMenuItem,
    user,
    setSelectedMenuItem,
    setSidebarCollapsed,
    initializeDashboard,
    connectWallet,
    disconnectWallet,
  } = useDashboardStore();

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
    if (itemId === 'logout') {
      // Handle logout logic
      disconnectWallet();
      console.log('Logout clicked');
    }
  };

  const handleViewProfile = () => {
    // Navigate to profile page
    router.push('/dashboard/profile');
    
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
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
              style={{
                boxShadow: '0 0 20px rgba(6, 128, 255, 0.3)',
              }}
            >
              <span className="text-white font-bold text-lg">K</span>
            </div>
            
            {!isCollapsed && (
              <h1
                className="text-white font-medium"
                style={{
                  fontFamily: 'CircularXX, Inter, sans-serif',
                  fontSize: '20px',
                  fontWeight: 500,
                  lineHeight: '100%',
                }}
              >
                Kinesis
              </h1>
            )}
          </div>

          {/* Mobile close button */}
          {isMobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 lg:hidden"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {/* Main navigation items */}
        <nav className="space-y-2">
          {DASHBOARD_MENU_ITEMS.map((item) => (
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
            background: 'linear-gradient(90deg, transparent 0%, #0680FF 50%, transparent 100%)',
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
        <UserProfile
          user={user}
          onViewProfile={handleViewProfile}
        />
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 transition-all duration-300',
          'border-r',
          // Desktop styles
          'lg:relative lg:translate-x-0',
          // Mobile styles
          'lg:block',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Width - use proper responsive classes
          isCollapsed 
            ? 'w-16 lg:w-20' // Collapsed width
            : 'w-64 lg:w-72 xl:w-80', // Full width with responsive scaling
          className
        )}
        style={{
          background: DASHBOARD_COLORS.PRIMARY_BG,
          borderRight: '1px solid transparent',
          borderImage: 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%) 1',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
