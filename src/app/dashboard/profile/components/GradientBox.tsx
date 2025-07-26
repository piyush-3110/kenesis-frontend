'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBoxProps {
  children: React.ReactNode;
  className?: string;
  borderGradient?: string;
  backgroundGradient?: string;
  borderWidth?: string;
}

/**
 * GradientBox Component
 * Reusable component for creating boxes with gradient borders and backgrounds
 * Ensures proper separation of border and background gradients
 */
const GradientBox: React.FC<GradientBoxProps> = ({
  children,
  className,
  borderGradient = 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%)',
  backgroundGradient = 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
  borderWidth = '1.06px'
}) => {
  return (
    <div 
      className={cn("rounded-lg", className)}
      style={{
        background: borderGradient,
        padding: borderWidth
      }}
    >
      <div 
        className="rounded-lg w-full h-full"
        style={{
          background: backgroundGradient
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GradientBox;
