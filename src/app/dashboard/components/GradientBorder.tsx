'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  borderRadius?: string;
  gradient?: string;
}

/**
 * GradientBorder Component
 * Wrapper component that creates a gradient border effect compatible with border-radius
 */
const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  className,
  borderWidth = 1,
  borderRadius = 'rounded-xl',
  gradient = 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
}) => {
  return (
    <div
      className={cn('relative', borderRadius, className)}
      style={{
        background: gradient,
        padding: `${borderWidth}px`,
      }}
    >
      <div
        className={cn('w-full h-full', borderRadius)}
        style={{
          background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GradientBorder;
