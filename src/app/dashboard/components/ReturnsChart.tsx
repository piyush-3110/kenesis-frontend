'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import GradientBorder from './GradientBorder';

interface ReturnsChartProps {
  className?: string;
}

/**
 * BarChart Component
 * Bar chart for returns data
 */
const BarChart: React.FC<{ data: { month: string; value: number; percentage?: number }[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="w-full h-32 sm:h-40 lg:h-48">
      <div className="flex items-end justify-between h-full px-1 sm:px-2 pb-6 sm:pb-8">
        {data.map((item, index) => {
          const height = (item.value / max) * 100;
          const isHighest = item.value === max;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-0.5 sm:mx-1">
              {/* Percentage label on top of highest bar */}
              {isHighest && item.percentage && (
                <div
                  className="text-white text-xs font-medium mb-1 sm:mb-2 whitespace-nowrap"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(9px, 1.5vw, 12px)',
                  }}
                >
                  {item.percentage}%
                </div>
              )}
              
              {/* Bar */}
              <div
                className="w-full max-w-6 sm:max-w-8 lg:max-w-12 rounded-t-lg transition-all duration-300 hover:scale-105"
                style={{
                  height: `${height}%`,
                  background: 'linear-gradient(180deg, #0680FF 0%, #022ED2 100%)',
                  boxShadow: '0 0 15px rgba(6, 128, 255, 0.3)',
                  minHeight: '6px',
                }}
              />
              
              {/* Month label */}
              <span
                className="text-gray-400 text-xs mt-1 sm:mt-2 truncate"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(8px, 1.3vw, 10px)',
                }}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ReturnsChart Component
 * Returns analytics card with bar chart
 */
const ReturnsChart: React.FC<ReturnsChartProps> = ({ className }) => {
  // Mock data - replace with actual data from props/store
  const returnsData = [
    { month: 'Jan', value: 25 },
    { month: 'Feb', value: 35 },
    { month: 'Mar', value: 28 },
    { month: 'Apr', value: 45 },
    { month: 'May', value: 52, percentage: 43 }, // Highest with percentage
    { month: 'Jun', value: 38 },
  ];

  return (
    <GradientBorder
      className={cn(
        'transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5',
        className
      )}
    >
      <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6 gap-2">
        <h3
          className="text-white truncate"
          style={{
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: 'clamp(14px, 2.5vw, 18px)',
            fontWeight: 450,
            lineHeight: '140%',
          }}
        >
          Returns
        </h3>
        
        {/* Date filter */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span
            className="text-gray-400 text-xs whitespace-nowrap"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(10px, 1.5vw, 12px)',
            }}
          >
            Jan - Mar 25
          </span>
          <button className="text-gray-400 hover:text-white transition-colors duration-200 flex-shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <BarChart data={returnsData} />
      </div>
    </GradientBorder>
  );
};

export default ReturnsChart;
