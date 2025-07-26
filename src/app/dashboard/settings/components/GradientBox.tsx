'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBoxProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * GradientBox Component
 * Reusable container with gradient border styling
 * Matches the design system used throughout the dashboard
 */
const GradientBox: React.FC<GradientBoxProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn('relative', className)}>
      {/* Outer container with gradient border */}
      <div 
        className="rounded-lg p-[1.06px]"
        style={{
          background: 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%)'
        }}
      >
        {/* Inner container with gradient background */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default GradientBox;
