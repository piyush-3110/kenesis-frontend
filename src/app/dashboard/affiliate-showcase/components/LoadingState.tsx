'use client';

import React from 'react';
import { AFFILIATE_COLORS } from '../constants';

/**
 * LoadingState Component
 * Loading state for affiliate showcase
 */
const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6">
      <div 
        className="w-full rounded-xl p-6 relative overflow-hidden"
        style={{
          background: AFFILIATE_COLORS.PRIMARY_BG,
        }}
      >
        {/* Border with gradient */}
        <div 
          className="absolute inset-0 rounded-xl p-[1px]"
          style={{
            background: AFFILIATE_COLORS.PRIMARY_BORDER,
          }}
        >
          <div 
            className="w-full h-full rounded-xl"
            style={{
              background: AFFILIATE_COLORS.PRIMARY_BG,
            }}
          />
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-96">
          <div className="text-center">
            {/* Spinning loader */}
            <div 
              className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-6"
              style={{
                borderColor: '#0680FF',
              }}
            />
            
            {/* Loading text */}
            <h3
              className="mb-2"
              style={{
                color: AFFILIATE_COLORS.TEXT_PRIMARY,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
              }}
            >
              Loading Affiliate Products
            </h3>
            
            <p
              style={{
                color: AFFILIATE_COLORS.TEXT_SECONDARY,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 450,
              }}
            >
              Discovering high-converting products for you...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
