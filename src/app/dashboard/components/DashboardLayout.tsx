'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { DASHBOARD_COLORS } from '../constants';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DashboardLayout Component
 * Main layout wrapper for dashboard pages
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div 
      className={cn('min-h-screen flex', className)}
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
          console.log('Navigation item clicked:', itemId);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header - Mobile menu button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={handleMobileSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          
          <h1
            className="text-white font-medium"
            style={{
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            Dashboard
          </h1>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
