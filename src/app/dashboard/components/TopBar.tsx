'use client';

import React from 'react';
import { Bell, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_COLORS } from '../constants';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onConnectWallet?: () => void;
  onNotificationClick?: () => void;
  walletAddress?: string;
  isWalletConnected?: boolean;
  className?: string;
}

/**
 * TopBar Component
 * Top navigation bar for dashboard pages
 */
const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onConnectWallet,
  onNotificationClick,
  walletAddress,
  isWalletConnected = false,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between p-4 lg:p-6">
        {/* Left side - Title */}
        <div className="flex-1">
          <h1
            className="text-white text-xl lg:text-2xl xl:text-3xl font-medium mb-1"
            style={{
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontWeight: 500,
              lineHeight: '100%',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-gray-400 text-sm lg:text-base"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                lineHeight: '140%',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Notification Button */}
          <button
            onClick={onNotificationClick}
            className={cn(
              'relative p-2 lg:p-3 rounded-lg transition-all duration-200',
              'hover:bg-gray-800/50 hover:scale-105',
              'border border-gray-700/50 hover:border-blue-500/50'
            )}
          >
            <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
            
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900">
              <div className="w-full h-full bg-red-500 rounded-full animate-pulse" />
            </div>
          </button>

          {/* Wallet Connect Button */}
          <button
            onClick={onConnectWallet}
            className={cn(
              'flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200',
              'border border-transparent',
              isWalletConnected
                ? 'bg-gradient-to-r from-green-600/20 to-transparent border-green-500/50 hover:from-green-600/30'
                : 'bg-gradient-to-r from-blue-600/20 to-transparent border-blue-500/50 hover:from-blue-600/30',
              'hover:scale-105 hover:shadow-lg'
            )}
            style={{
              fontFamily: 'Rubik, monospace',
              fontSize: 'clamp(12px, 2vw, 16px)',
              fontWeight: 400,
            }}
          >
            <Wallet className="w-4 h-4 lg:w-5 lg:h-5 text-gray-300" />
            
            <span className="text-white hidden sm:block">
              {isWalletConnected && walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Connect Wallet'
              }
            </span>
            
            {/* Mobile only icon */}
            <span className="text-white text-xs sm:hidden">
              {isWalletConnected ? '●' : '○'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Gradient bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, #0680FF 0%, #010519 100%)',
        }}
      />
    </div>
  );
};

export default TopBar;
