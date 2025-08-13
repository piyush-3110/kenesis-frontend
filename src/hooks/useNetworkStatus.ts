/**
 * Network Status Hook
 * Handles online/offline states and provides user feedback
 */

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/useUIStore';

interface NetworkState {
  isOnline: boolean;
  isReconnecting: boolean;
  connectionType?: string;
  speed?: 'slow' | 'fast' | 'unknown';
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isReconnecting: false,
  });
  
  const { addToast, removeToast, clearToasts } = useUIStore();
  const [offlineToastId, setOfflineToastId] = useState<string | null>(null);

  const detectConnectionSpeed = useCallback(async (): Promise<'slow' | 'fast' | 'unknown'> => {
    if (!navigator.onLine) return 'unknown';
    
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health-check', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return duration < 500 ? 'fast' : 'slow';
    } catch {
      return 'unknown';
    }
  }, []);

  const handleOnline = useCallback(async () => {
    setNetworkState(prev => ({ ...prev, isOnline: true, isReconnecting: true }));
    
    // Remove offline toast
    if (offlineToastId) {
      removeToast(offlineToastId);
      setOfflineToastId(null);
    }
    
    // Detect connection speed
    const speed = await detectConnectionSpeed();
    
    setNetworkState(prev => ({ 
      ...prev, 
      isReconnecting: false,
      speed 
    }));
    
    // Show reconnection success
    addToast({
      type: 'success',
      message: 'Connection restored!',
      duration: 3000,
    });
  }, [addToast, removeToast, offlineToastId, detectConnectionSpeed]);

  const handleOffline = useCallback(() => {
    setNetworkState(prev => ({ 
      ...prev, 
      isOnline: false, 
      isReconnecting: false,
      speed: 'unknown' 
    }));
    
    // Show persistent offline toast
    const toastId = Math.random().toString(36).substr(2, 9);
    setOfflineToastId(toastId);
    
    addToast({
      type: 'warning',
      message: 'Connection lost. Please check your internet connection.',
      duration: Infinity, // Don't auto-dismiss
    });
  }, [addToast]);

  useEffect(() => {
    // Initial connection speed detection
    if (navigator.onLine) {
      detectConnectionSpeed().then(speed => {
        setNetworkState(prev => ({ ...prev, speed }));
      });
    }

    // Connection type detection (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setNetworkState(prev => ({ 
          ...prev, 
          connectionType: connection.effectiveType 
        }));
      }
    }

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, detectConnectionSpeed]);

  return networkState;
};

/**
 * Auto-retry hook for failed requests
 */
export const useAutoRetry = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;
  
  const { isOnline } = useNetworkStatus();
  const { addToast } = useUIStore();

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Wait for network if offline
        if (!isOnline && attempt > 0) {
          addToast({
            type: 'info',
            message: 'Waiting for network connection...',
            duration: 2000,
          });
          
          // Wait for network to come back online
          await new Promise<void>((resolve) => {
            const checkOnline = () => {
              if (navigator.onLine) {
                resolve();
              } else {
                setTimeout(checkOnline, 1000);
              }
            };
            checkOnline();
          });
        }
        
        const result = await operation(...args);
        
        // Show success message if this was a retry
        if (attempt > 0) {
          addToast({
            type: 'success',
            message: 'Operation completed successfully!',
            duration: 3000,
          });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error;
        }
        
        // Show retry notification
        if (attempt < maxRetries) {
          addToast({
            type: 'info',
            message: `Retrying... (${attempt + 1}/${maxRetries})`,
            duration: 2000,
          });
        }
        
        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }, [operation, maxRetries, retryDelay, backoffMultiplier, shouldRetry, isOnline, addToast]);

  return { executeWithRetry };
};

/**
 * Smart toast manager that handles toast overflow and prioritization
 */
export const useSmartToasts = () => {
  const { toasts, addToast: originalAddToast, removeToast, clearToasts } = useUIStore();
  
  const MAX_TOASTS = 4;
  const TOAST_PRIORITIES = {
    error: 4,
    warning: 3,
    success: 2,
    info: 1,
  };

  const addSmartToast = useCallback((toast: Parameters<typeof originalAddToast>[0]) => {
    // If we're at max capacity, remove lower priority toasts
    if (toasts.length >= MAX_TOASTS) {
      const currentPriority = TOAST_PRIORITIES[toast.type];
      
      // Find the lowest priority toast to remove
      const lowestPriorityToast = toasts
        .map((t, index) => ({ ...t, index }))
        .sort((a, b) => TOAST_PRIORITIES[a.type] - TOAST_PRIORITIES[b.type])[0];
      
      if (TOAST_PRIORITIES[lowestPriorityToast.type] < currentPriority) {
        removeToast(lowestPriorityToast.id);
      }
    }
    
    originalAddToast(toast);
  }, [toasts, originalAddToast, removeToast]);

  return {
    toasts,
    addToast: addSmartToast,
    removeToast,
    clearToasts,
  };
};

/**
 * Clipboard operations with toast feedback
 */
export const useClipboard = () => {
  const { addToast } = useUIStore();

  const copyToClipboard = useCallback(async (text: string, successMessage = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        type: 'success',
        message: successMessage,
        duration: 2000,
      });
      return true;
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          addToast({
            type: 'success',
            message: successMessage,
            duration: 2000,
          });
          return true;
        } else {
          throw new Error('Copy command failed');
        }
      } catch (fallbackError) {
        addToast({
          type: 'error',
          message: 'Failed to copy to clipboard',
          duration: 3000,
        });
        return false;
      }
    }
  }, [addToast]);

  return { copyToClipboard };
};
