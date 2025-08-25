'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarWithBorderProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  borderGradient?: string;
  verified?: boolean;
}

/**
 * AvatarWithBorder Component
 * Avatar component with gradient border and optional verification badge
 */
const AvatarWithBorder: React.FC<AvatarWithBorderProps> = ({
  src,
  alt,
  size = 'lg',
  className,
  borderGradient = 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%)',
  verified = false
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const borderSizes = {
    sm: '2px',
    md: '2.5px',
    lg: '3px',
    xl: '3.5px'
  };

  return (
    <div className={cn("relative", className)}>
      {/* Avatar with gradient border */}
      <div 
        className={cn("rounded-full", sizeClasses[size])}
        style={{
          background: borderGradient,
          padding: borderSizes[size]
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-800">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      {/* Verification badge */}
      {verified && (
        <div className="absolute -bottom-1 -right-1">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-black">
            <svg 
              className="w-3 h-3 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarWithBorder;
