"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import GradientBorder from "./GradientBorder";
import { useDashboardStore } from "../store/useDashboardStore";

interface SalesAnalyticsProps {
  className?: string;
}

/**
 * SalesChart Component
 * Line chart for sales analytics
 */
const SalesChart: React.FC<{ data: { month: string; value: number }[] }> = ({
  data,
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - min) / range) * 80; // 80% of height for padding
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-40 sm:h-48 lg:h-64">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        className="overflow-visible"
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

        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - min) / range) * 80;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#0680FF"
              stroke="white"
              strokeWidth="1"
              className="hover:r-3 transition-all duration-200"
            />
          );
        })}
      </svg>

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
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * SalesAnalytics Component
 * Sales analytics card with time period tabs and line chart
 */
const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState("Monthly");
  const { metrics } = useDashboardStore(); // keep if needed later
  // We'll derive sales analytics from last initialize (metrics don't include time series yet)
  // For now, we tap directly into window-managed store by extending store later; placeholder.

  const tabs = ["Daily", "Weekly", "Monthly", "Yearly"];

  // Temporary: no direct analytics time series stored yet in store; this will be replaced when store is extended.
  const salesData = useMemo(() => {
    // Placeholder if metrics contain trends (e.g., revenue trend for last 7 days)
    const revenueMetric = metrics.find((m) => m.id === "revenue");
    if (revenueMetric?.trend) {
      return revenueMetric.trend.map((v, i) => ({
        month: `${i + 1}`,
        value: v,
      }));
    }
    return [] as { month: string; value: number }[];
  }, [metrics]);

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

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900/50 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200",
                  "whitespace-nowrap flex-shrink-0",
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(10px, 1.8vw, 13px)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <SalesChart data={salesData} />

        {/* Y-axis labels */}
        <div className="absolute left-2 top-16 bottom-16 flex flex-col justify-between text-gray-400 text-xs">
          {["180k", "120k", "60k", "0"].map((label) => (
            <span key={label} style={{ fontSize: "clamp(9px, 1.5vw, 11px)" }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </GradientBorder>
  );
};

export default SalesAnalytics;
