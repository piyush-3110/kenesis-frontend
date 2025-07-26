'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AFFILIATE_COLORS } from '../constants';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * ErrorState Component
 * Displays error messages with optional retry functionality
 */
const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-4">
          <AlertTriangle 
            className="mx-auto text-red-400" 
            size={48}
          />
        </div>
        
        {/* Error Title */}
        <h3
          className="mb-2"
          style={{
            color: AFFILIATE_COLORS.TEXT_PRIMARY,
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          Something went wrong
        </h3>
        
        {/* Error Message */}
        <p
          className="mb-6"
          style={{
            color: AFFILIATE_COLORS.TEXT_SECONDARY,
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 450,
            lineHeight: '140%',
          }}
        >
          {error}
        </p>
        
        {/* Retry Button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mx-auto"
            style={{
              background: AFFILIATE_COLORS.BUTTON_BG,
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
