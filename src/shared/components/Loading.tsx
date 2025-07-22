'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const renderSpinner = () => (
    <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-blue-500 rounded-full animate-pulse ${
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          }`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-gray-300 rounded animate-pulse ${sizeClasses[size]}`} />
  );

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderVariant()}
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Skeleton components for different content types
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
    <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="flex items-center space-x-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export const ReviewSkeleton: React.FC = () => (
  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

export const VideoPlayerSkeleton: React.FC = () => (
  <div className="relative bg-black rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-800"></div>
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="h-1 bg-gray-700 rounded-full mb-4"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
          <div className="w-20 h-4 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default Loading;
