/**
 * Enhanced Loading States Hook
 * Provides standardized loading patterns for different UI scenarios
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export interface LoadingState {
  loading: boolean;
  progress?: number;
  status?: string;
  error?: string | null;
}

export interface UseLoadingOptions {
  successMessage?: string;
  errorMessage?: string;
  showGlobalLoader?: boolean;
  minDuration?: number; // Minimum loading time to prevent flashing
}

/**
 * Enhanced loading hook with toast integration
 */
export const useLoading = (options: UseLoadingOptions = {}) => {
  const [state, setState] = useState<LoadingState>({
    loading: false,
    progress: undefined,
    status: undefined,
    error: null,
  });
  
  const { addToast, setGlobalLoading } = useUIStore();
  const minDurationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startLoading = useCallback((status?: string) => {
    startTimeRef.current = Date.now();
    setState({ loading: true, progress: undefined, status, error: null });
    
    if (options.showGlobalLoader) {
      setGlobalLoading(true);
    }
  }, [options.showGlobalLoader, setGlobalLoading]);

  const updateProgress = useCallback((progress: number, status?: string) => {
    setState(prev => ({ ...prev, progress, status: status || prev.status }));
  }, []);

  const updateStatus = useCallback((status: string) => {
    setState(prev => ({ ...prev, status }));
  }, []);

  const stopLoading = useCallback((success: boolean = true, message?: string) => {
    const elapsed = Date.now() - startTimeRef.current;
    const minDuration = options.minDuration || 0;
    const remainingTime = Math.max(0, minDuration - elapsed);

    const finishLoading = () => {
      setState({ loading: false, progress: undefined, status: undefined, error: null });
      
      if (options.showGlobalLoader) {
        setGlobalLoading(false);
      }

      // Show toast if message provided or default messages are set
      const toastMessage = message || (success ? options.successMessage : options.errorMessage);
      if (toastMessage) {
        addToast({
          type: success ? 'success' : 'error',
          message: toastMessage,
        });
      }
    };

    if (remainingTime > 0) {
      setTimeout(finishLoading, remainingTime);
    } else {
      finishLoading();
    }
  }, [options, setGlobalLoading, addToast]);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
    
    if (options.showGlobalLoader) {
      setGlobalLoading(false);
    }

    addToast({
      type: 'error',
      message: error,
    });
  }, [options.showGlobalLoader, setGlobalLoading, addToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (minDurationRef.current) {
        clearTimeout(minDurationRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    updateProgress,
    updateStatus,
    setError,
  };
};

/**
 * Async operation wrapper with loading states
 */
export const useAsyncOperation = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseLoadingOptions = {}
) => {
  const loading = useLoading(options);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    try {
      loading.startLoading();
      const result = await operation(...args);
      loading.stopLoading(true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      loading.stopLoading(false, errorMessage);
      return null;
    }
  }, [operation, loading]);

  return {
    execute,
    loading: loading.loading,
    progress: loading.progress,
    status: loading.status,
    error: loading.error,
  };
};

/**
 * File upload hook with progress tracking
 */
export const useFileUpload = () => {
  const loading = useLoading({
    successMessage: 'File uploaded successfully!',
    errorMessage: 'Upload failed. Please try again.',
  });

  const upload = useCallback(async (
    file: File,
    uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<any>
  ) => {
    try {
      loading.startLoading('Preparing upload...');
      
      const result = await uploadFn(file, (progress) => {
        loading.updateProgress(progress, `Uploading ${file.name}...`);
      });
      
      loading.stopLoading(true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      loading.setError(errorMessage);
      throw error;
    }
  }, [loading]);

  return {
    upload,
    loading: loading.loading,
    progress: loading.progress,
    status: loading.status,
    error: loading.error,
  };
};

/**
 * Form submission hook with validation and loading
 */
export const useFormSubmission = <T extends Record<string, any>>(
  submitFn: (data: T) => Promise<any>,
  options: UseLoadingOptions & {
    validationFn?: (data: T) => string | null;
  } = {}
) => {
  const loading = useLoading({
    successMessage: 'Form submitted successfully!',
    errorMessage: 'Failed to submit form. Please try again.',
    minDuration: 500, // Prevent flashing on fast responses
    ...options,
  });

  const submit = useCallback(async (data: T) => {
    try {
      // Client-side validation
      if (options.validationFn) {
        const validationError = options.validationFn(data);
        if (validationError) {
          loading.setError(validationError);
          return null;
        }
      }

      loading.startLoading('Submitting...');
      const result = await submitFn(data);
      loading.stopLoading(true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      loading.stopLoading(false, errorMessage);
      return null;
    }
  }, [submitFn, options, loading]);

  return {
    submit,
    loading: loading.loading,
    error: loading.error,
  };
};

// Export commonly used loading configurations
export const LOADING_CONFIGS = {
  // Authentication operations
  LOGIN: {
    successMessage: 'Welcome back!',
    errorMessage: 'Login failed. Please check your credentials.',
    minDuration: 800,
  },
  LOGOUT: {
    successMessage: 'Logged out successfully',
    minDuration: 500,
  },
  SIGNUP: {
    successMessage: 'Account created! Please verify your email.',
    errorMessage: 'Failed to create account. Please try again.',
    minDuration: 1000,
  },
  
  // Data operations
  SAVE_PROFILE: {
    successMessage: 'Profile updated successfully!',
    errorMessage: 'Failed to save changes. Please try again.',
    minDuration: 500,
  },
  CREATE_PRODUCT: {
    successMessage: 'Product created successfully!',
    errorMessage: 'Failed to create product. Please try again.',
    showGlobalLoader: true,
    minDuration: 1000,
  },
  DELETE_ITEM: {
    successMessage: 'Item deleted successfully',
    errorMessage: 'Failed to delete item. Please try again.',
    minDuration: 500,
  },
  
  // Payment operations
  PROCESS_PAYMENT: {
    successMessage: 'Payment processed successfully!',
    errorMessage: 'Payment failed. Please try again.',
    showGlobalLoader: true,
    minDuration: 1500,
  },
  
  // File operations
  UPLOAD_FILE: {
    successMessage: 'File uploaded successfully!',
    errorMessage: 'Upload failed. Please check file size and format.',
  },
} as const;
