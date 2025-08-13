'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency, formatCompactNumber } from '@/shared/utils/formatters';
import type { UserDashboardAnalytics } from '@/lib/api/dashboardApi';

interface TimeSeriesPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface TooltipData {
  label: string;
  revenue: number;
  orders: number;
  x: number;
  y: number;
}

interface SalesAnalyticsProps {
  analytics: UserDashboardAnalytics | null;
  isLoading: boolean;
}

/**
 * Clean Chart Implementation - Accurate data visualization
 */
const SalesChart: React.FC<{
  data: TimeSeriesPoint[];
  activeTab: string;
  showRevenue: boolean;
}> = ({ data, activeTab, showRevenue }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Responsive chart dimensions
  const CHART_HEIGHT = 280;
  const PADDING = { top: 20, right: 40, bottom: 50, left: 60 };
  
  // Use container width for responsive design
  const [containerWidth, setContainerWidth] = React.useState(800);
  
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const CHART_WIDTH = Math.max(containerWidth, 600); // Minimum width
  const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
  const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // Data processing
  const values = useMemo(() => {
    return data.map(d => showRevenue ? d.revenue : d.orders);
  }, [data, showRevenue]);

  // Y-axis domain (always start from 0 for sales)
  const minValue = 0;
  const maxValue = useMemo(() => {
    const dataMax = Math.max(...values, 0);
    
    if (dataMax === 0) return 100; // Default when no data
    
    // Calculate nice maximum
    const order = Math.pow(10, Math.floor(Math.log10(dataMax)));
    const normalized = dataMax / order;
    
    let niceMax;
    if (normalized <= 1) niceMax = 1;
    else if (normalized <= 2) niceMax = 2;
    else if (normalized <= 5) niceMax = 5;
    else niceMax = 10;
    
    return niceMax * order;
  }, [values]);

  // Scale functions
  const xScale = React.useCallback((index: number) => {
    if (data.length <= 1) return PADDING.left + PLOT_WIDTH / 2;
    return PADDING.left + (index / (data.length - 1)) * PLOT_WIDTH;
  }, [data.length, PADDING.left, PLOT_WIDTH]);

  const yScale = React.useCallback((value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    return PADDING.top + PLOT_HEIGHT * (1 - ratio);
  }, [minValue, maxValue, PADDING.top, PLOT_HEIGHT]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const value = minValue + (maxValue - minValue) * (i / (tickCount - 1));
      ticks.push({
        value,
        y: yScale(value),
        label: showRevenue ? formatCompactNumber(value) : Math.round(value).toString()
      });
    }
    return ticks.reverse();
  }, [minValue, maxValue, yScale, showRevenue]);

  // Path generation
  const pathData = useMemo(() => {
    if (data.length === 0) return '';
    
    const points = data.map((d, i) => {
      const value = showRevenue ? d.revenue : d.orders;
      return `${xScale(i)},${yScale(value)}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [data, showRevenue, xScale, yScale]);

  // Area path for gradient fill
  const areaData = useMemo(() => {
    if (data.length === 0) return '';
    
    const baselineY = yScale(0);
    const points = data.map((d, i) => {
      const value = showRevenue ? d.revenue : d.orders;
      return `${xScale(i)},${yScale(value)}`;
    });
    
    const firstX = xScale(0);
    const lastX = xScale(data.length - 1);
    
    return `M ${firstX},${baselineY} L ${points.join(' L ')} L ${lastX},${baselineY} Z`;
  }, [data, showRevenue, xScale, yScale]);

  const handlePointHover = (item: TimeSeriesPoint, index: number) => {
    const value = showRevenue ? item.revenue : item.orders;
    setTooltip({
      label: item.label,
      revenue: item.revenue,
      orders: item.orders,
      x: xScale(index),
      y: yScale(value)
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-40 sm:h-48 lg:h-64 flex items-center justify-center">
        <div className="text-gray-400 text-sm">
          No data available for {activeTab.toLowerCase()} view
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-40 sm:h-48 lg:h-64 relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="overflow-visible"
        onMouseLeave={() => setTooltip(null)}
        preserveAspectRatio="none"
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
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PADDING.left}
            y1={tick.y}
            x2={CHART_WIDTH - PADDING.right}
            y2={tick.y}
            stroke={tick.value === 0 ? "rgba(255,255,255,0.3)" : "rgba(107,114,128,0.2)"}
            strokeWidth={tick.value === 0 ? "1" : "0.5"}
          />
        ))}

        {/* Area fill */}
        <path
          d={areaData}
          fill="url(#salesGradient)"
          fillOpacity="0.1"
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#salesGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const value = showRevenue ? item.revenue : item.orders;
          return (
            <g key={index}>
              <circle
                cx={xScale(index)}
                cy={yScale(value)}
                r="8"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => handlePointHover(item, index)}
              />
              <circle
                cx={xScale(index)}
                cy={yScale(value)}
                r={tooltip?.label === item.label ? "4" : "2"}
                fill="#0680FF"
                stroke="white"
                strokeWidth="1"
                className="transition-all duration-200 pointer-events-none"
              />
            </g>
          );
        })}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PADDING.left - 8}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-gray-400 text-[10px] tabular-nums"
            style={{ fontFamily: 'Inter, sans-serif' }}
            fill="rgb(156, 163, 175)"
          >
            {tick.label}
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((item, index) => {
          // Show labels with smart spacing - more aggressive filtering
          const maxLabels = Math.min(6, data.length); // Cap at 6 labels max
          const skip = Math.max(1, Math.ceil(data.length / maxLabels));
          
          // Always show first and last, then every nth
          const showLabel = index === 0 || 
                           index === data.length - 1 || 
                           (index % skip === 0 && index !== 0 && index !== data.length - 1);
          
          if (!showLabel) return null;
          
          return (
            <text
              key={index}
              x={xScale(index)}
              y={CHART_HEIGHT - PADDING.bottom + 16}
              textAnchor="middle"
              className="text-gray-400 text-[10px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
              fill="rgb(156, 163, 175)"
            >
              {item.label}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && containerRef.current && (
        <div
          className="absolute z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 pointer-events-none shadow-lg"
          style={{
            left: `${Math.max(10, Math.min(90, (tooltip.x / CHART_WIDTH) * 100))}%`,
            top: `${Math.max(0, Math.min(50, (tooltip.y / CHART_HEIGHT) * 100 - 20))}%`,
            transform: tooltip.x > CHART_WIDTH * 0.8 ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)',
            minWidth: '140px',
            maxWidth: '180px',
          }}
        >
          <div className="text-white text-sm font-medium mb-1 truncate">{tooltip.label}</div>
          <div className="text-gray-300 text-xs">
            Revenue: {formatCurrency(tooltip.revenue)}
          </div>
          <div className="text-gray-300 text-xs">
            Orders: {tooltip.orders.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ analytics, isLoading }) => {
  const [activeTab, setActiveTab] = useState('Daily');
  const [showRevenue, setShowRevenue] = useState(true);

  const tabs = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const currentData = useMemo(() => {
    if (!analytics?.salesAnalytics) return [];
    
    switch (activeTab.toLowerCase()) {
      case 'daily':
        return analytics.salesAnalytics.daily || [];
      case 'weekly':
        return analytics.salesAnalytics.weekly || [];
      case 'monthly':
        return analytics.salesAnalytics.monthly || [];
      case 'yearly':
        return analytics.salesAnalytics.yearly || [];
      default:
        return [];
    }
  }, [analytics, activeTab]);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="h-40 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-white">Sales Analytics</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Time Period Tabs */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setShowRevenue(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                showRevenue
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setShowRevenue(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                !showRevenue
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              Orders
            </button>
          </div>
        </div>
      </div>

      <SalesChart
        data={currentData}
        activeTab={activeTab}
        showRevenue={showRevenue}
      />
    </div>
  );
};

export default SalesAnalytics;
