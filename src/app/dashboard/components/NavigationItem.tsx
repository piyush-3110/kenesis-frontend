'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationItemProps } from '../types';
import { DASHBOARD_COLORS } from '../constants';
import { cn } from '@/lib/utils';

/**
 * NavigationItem Component
 * Renders a single navigation item in the sidebar
 */
const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isActive = false,
  onClick,
  className,
}) => {
  const { icon: Icon, label, badge, href } = item;

  const handleClick = () => {
    onClick?.(item);
  };

  const itemContent = (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer',
        'hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-transparent',
        'hover:border-l-2 hover:border-l-blue-500',
        isActive && [
          'bg-gradient-to-r from-blue-600/20 to-transparent',
          'border-l-2 border-l-blue-500',
          'shadow-lg shadow-blue-500/10',
        ],
        className
      )}
      onClick={handleClick}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '16.4px',
        fontWeight: 500,
        lineHeight: '140%',
      }}
    >
      {/* Icon */}
      {Icon && (
        <Icon
          className={cn(
            'w-5 h-5 transition-colors duration-200',
            isActive ? 'text-blue-400' : 'text-gray-400',
            'group-hover:text-blue-400'
          )}
        />
      )}

      {/* Label */}
      <span
        className={cn(
          'flex-1 transition-colors duration-200',
          isActive ? 'text-white' : 'text-gray-300',
          'group-hover:text-white'
        )}
      >
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            'bg-blue-500 text-white',
            'min-w-[20px] h-5 flex items-center justify-center'
          )}
        >
          {badge.count}
        </div>
      )}

      {/* Active indicator */}
      {isActive && (
        <div
          className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"
          style={{
            boxShadow: '0 0 8px rgba(6, 128, 255, 0.5)',
          }}
        />
      )}
    </div>
  );

  if (item.id === 'logout') {
    return (
      <button
        className="w-full text-left"
        onClick={handleClick}
        type="button"
      >
        {itemContent}
      </button>
    );
  }

  return (
    <Link href={href} className="block">
      {itemContent}
    </Link>
  );
};

export default NavigationItem;
