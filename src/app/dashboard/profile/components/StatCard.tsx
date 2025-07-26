'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import GradientBox from './GradientBox';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  className?: string;
}

/**
 * StatCard Component
 * Displays a statistic with title, value, and optional trend indicator
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with commas
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <GradientBox className={cn("h-full", className)}>
      <div className="p-6 h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-gray-400 text-sm font-medium mb-1">
              {title}
            </h3>
            <div className="text-white text-2xl md:text-3xl font-bold">
              {formatValue(value)}
            </div>
          </div>
          {icon && (
            <div className="ml-4 text-blue-400 opacity-60">
              {icon}
            </div>
          )}
        </div>

        {/* Subtitle and trend */}
        <div className="mt-auto">
          {subtitle && (
            <p className="text-gray-500 text-xs mb-2">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              getTrendColor(trend.direction)
            )}>
              {getTrendIcon(trend.direction)}
              <span>{trend.value}</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </GradientBox>
  );
};

export default StatCard;
