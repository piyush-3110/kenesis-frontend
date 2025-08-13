"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import GradientBorder from "./GradientBorder";
import { useDashboardStore } from "../store/useDashboardStore";
import { formatCurrency, formatCompactNumber } from "@/shared/utils/formatters";
import { TimeSeriesPoint } from "@/lib/api/dashboardApi";

interface SalesAnalyticsProps {
  className?: string;
}

interface TooltipData {
  label: string;
  revenue: number;
  orders: number;
  x: number;
  y: number;
}

/**
 * SalesChart Component
 * Interactive line chart for sales analytics with tooltips
 */
const SalesChart: React.FC<{
  data: TimeSeriesPoint[];
  activeTab: string;
  showRevenue: boolean;
}> = ({ data, activeTab, showRevenue }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const formatYAxisLabel = React.useCallback((value: number) => {
    if (showRevenue) {
      return formatCompactNumber(value);
    }
    return value.toString();
  }, [showRevenue]);

  const values = useMemo(() => data.map((d) => (showRevenue ? d.revenue : d.orders)), [data, showRevenue]);
  const max = useMemo(() => Math.max(...values), [values]);
  const min = useMemo(() => Math.min(...values), [values]);
  const range = useMemo(() => max - min || 1, [max, min]);

  const points = useMemo(() => {
    return data
      .map((item, index) => {
        const value = showRevenue ? item.revenue : item.orders;
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 80; // 80% of height for padding
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, showRevenue, min, range]);

  const yAxisLabels = useMemo(() => {
    const steps = 4;
    const step = range / steps;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = max - (step * i);
      return formatYAxisLabel(value);
    });
  }, [max, range, formatYAxisLabel]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-40 sm:h-48 lg:h-64 flex items-center justify-center">
        <div className="text-gray-400 text-sm">
          No data available for {activeTab.toLowerCase()} view
        </div>
      </div>
    );
  }

  const handleMouseEnter = (item: TimeSeriesPoint, index: number) => {
    const value = showRevenue ? item.revenue : item.orders;
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80;
    
    setTooltip({
      label: item.label,
      revenue: item.revenue,
      orders: item.orders,
      x,
      y,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="w-full h-40 sm:h-48 lg:h-64 relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="overflow-visible"
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="salesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0680FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#022ED2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0680FF" stopOpacity="0.4" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[20, 40, 60, 80].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(107, 114, 128, 0.2)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area under curve */}
        <path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill="url(#salesGradient)"
          fillOpacity="0.1"
        />

        {/* Main line */}
        <polyline
          fill="none"
          stroke="url(#salesGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          filter="url(#glow)"
        />

        {/* Interactive data points */}
        {data.map((item, index) => {
          const value = showRevenue ? item.revenue : item.orders;
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - min) / range) * 80;
          
          return (
            <g key={index}>
              {/* Invisible larger circle for easier hover */}
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => handleMouseEnter(item, index)}
              />
              {/* Visible data point */}
              <circle
                cx={x}
                cy={y}
                r={tooltip?.label === item.label ? "4" : "2"}
                fill="#0680FF"
                stroke="white"
                strokeWidth="1"
                className="transition-all duration-200 pointer-events-none"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 pointer-events-none"
          style={{
            left: `${tooltip.x}%`,
            top: `${tooltip.y - 20}%`,
            transform: 'translate(-50%, -100%)',
            minWidth: '120px',
          }}
        >
          <div className="text-white text-sm font-medium mb-1">{tooltip.label}</div>
          <div className="text-gray-300 text-xs">
            Revenue: {formatCurrency(tooltip.revenue)}
          </div>
          <div className="text-gray-300 text-xs">
            Orders: {tooltip.orders.toLocaleString()}
          </div>
        </div>
      )}

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1 sm:px-2 overflow-hidden">
        {data.map((item, index) => (
          <span
            key={index}
            className="text-gray-400 text-xs truncate"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(8px, 1.5vw, 11px)",
            }}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-2 top-0 bottom-8 flex flex-col justify-between text-gray-400 text-xs">
        {yAxisLabels.map((label, index) => (
          <span key={index} style={{ fontSize: "clamp(9px, 1.5vw, 11px)" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * SalesAnalytics Component
 * Sales analytics card with time period tabs and interactive line chart
 */
const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [showRevenue, setShowRevenue] = useState(true);
  const { analytics, isLoading } = useDashboardStore();

  const tabs: Array<{ key: "daily" | "weekly" | "monthly" | "yearly"; label: string }> = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  // Get data based on active tab from analytics
  const salesData = useMemo(() => {
    if (!analytics?.salesAnalytics) return [];
    
    return analytics.salesAnalytics[activeTab] || [];
  }, [analytics, activeTab]);

  const totalRevenue = useMemo(() => {
    return salesData.reduce((sum: number, point: TimeSeriesPoint) => sum + point.revenue, 0);
  }, [salesData]);

  const totalOrders = useMemo(() => {
    return salesData.reduce((sum: number, point: TimeSeriesPoint) => sum + point.orders, 0);
  }, [salesData]);

  if (isLoading) {
    return (
      <GradientBorder
        className={cn(
          "transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5",
          className
        )}
      >
        <div className="p-4 lg:p-6 flex items-center justify-center h-80">
          <div className="text-gray-400">Loading analytics...</div>
        </div>
      </GradientBorder>
    );
  }

  return (
    <GradientBorder
      className={cn(
        "transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5",
        className
      )}
    >
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3">
          <div className="flex flex-col">
            <h3
              className="text-white truncate"
              style={{
                fontFamily: "CircularXX, Inter, sans-serif",
                fontSize: "clamp(14px, 2.5vw, 18px)",
                fontWeight: 450,
                lineHeight: "140%",
              }}
            >
              Sales Analytics
            </h3>
            {salesData.length > 0 && (
              <div className="flex items-center gap-4 mt-1">
                <div className="text-gray-400 text-xs">
                  Total Revenue: {formatCurrency(totalRevenue)}
                </div>
                <div className="text-gray-400 text-xs">
                  Total Orders: {totalOrders.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Time period tabs */}
          <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200",
                  "whitespace-nowrap flex-shrink-0",
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(10px, 1.8vw, 13px)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric toggle buttons */}
        {salesData.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowRevenue(true)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs transition-all duration-200",
                showRevenue
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/50"
                  : "bg-gray-800/50 text-gray-400 hover:text-white"
              )}
            >
              Revenue
            </button>
            <button
              onClick={() => setShowRevenue(false)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs transition-all duration-200",
                !showRevenue
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/50"
                  : "bg-gray-800/50 text-gray-400 hover:text-white"
              )}
            >
              Orders
            </button>
          </div>
        )}

        {/* Chart */}
        <SalesChart 
          data={salesData} 
          activeTab={activeTab}
          showRevenue={showRevenue}
        />
      </div>
    </GradientBorder>
  );
};

export default SalesAnalytics;
