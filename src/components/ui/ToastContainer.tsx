'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToasts, useUIStore } from '@/store/useUIStore';

/**
 * Toast Component
 * Individual toast notification with auto-dismiss and animations
 */
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, type, message }) => {
  const { removeToast } = useUIStore();

  const handleClose = () => {
    removeToast(id);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10';
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        ${getStyles()}
      `}
      style={{
        backdropFilter: 'blur(10px)',
        background: `linear-gradient(135deg, ${type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
          type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
          type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
          'rgba(59, 130, 246, 0.1)'} 0%, rgba(255,255,255,0.05) 100%)`,
      }}
    >
      {getIcon()}
      <div className="flex-1 text-sm text-white font-medium leading-relaxed">
        {message}
      </div>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-white transition-colors p-1 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * ToastContainer Component
 * Container for managing multiple toast notifications
 */
const ToastContainer: React.FC = () => {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
