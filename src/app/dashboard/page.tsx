"use client";

import React, { useEffect } from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";
import DashboardLayout from "./components/DashboardLayout";
import KPICard from "./components/KPICard";
import SalesAnalytics from "./components/SalesAnalytics";
import Transactions from "./components/Transactions";
import { useDashboardStore } from "./store/useDashboardStore";

/**
 * Dashboard Page
 * Main dashboard overview page with modular components
 */
const DashboardPage: React.FC = () => {
  const { metrics, analytics, initializeDashboard, isLoading } =
    useDashboardStore();

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  if (isLoading) {
    return (
      <RequireAuth>
        <DashboardLayout>
          <div className="p-4 sm:p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <DashboardLayout
        title="Dashboard Overview"
        subtitle="Monitor your business performance and analytics"
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {metrics.map((metric) => (
              <KPICard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
              />
            ))}
          </div>

          {/* Charts Row: Sales Analytics full width */}
          <div className="w-full">
            <SalesAnalytics 
              analytics={analytics}
              isLoading={isLoading}
            />
          </div>

          {/* Transactions: Full width below analytics */}
          <div className="w-full">
            <Transactions />
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
};

export default DashboardPage;
