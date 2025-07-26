'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { AFFILIATE_COLORS } from '../constants';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Toast Component
 * Individual toast notification with auto-dismiss
 */
const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for animation
  }, [id, onClose]);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <AlertCircle size={20} className="text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/50';
      case 'error':
        return 'border-red-500/50';
      default:
        return 'border-blue-500/50';
    }
  };

  return (
    <div
      className={`
        relative transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBorderColor()}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        max-w-md w-full
      `}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium"
            style={{
              color: AFFILIATE_COLORS.TEXT_PRIMARY,
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {title}
          </h4>
          {message && (
            <p
              className="mt-1"
              style={{
                color: AFFILIATE_COLORS.TEXT_SECONDARY,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-700 transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
