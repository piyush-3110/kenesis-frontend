import { useCallback, useMemo } from 'react';
import { useAddToast } from '@/store/useUIStore';

/**
 * Custom hook for common toast messages
 * Provides consistent messaging across the dashboard
 */
export const useToastMessages = () => {
  const addToast = useAddToast();

  const showSuccess = useCallback((message: string) => {
    addToast({ type: 'success', message });
  }, [addToast]);

  const showError = useCallback((message: string) => {
    addToast({ type: 'error', message });
  }, [addToast]);

  const showWarning = useCallback((message: string) => {
    addToast({ type: 'warning', message });
  }, [addToast]);

  const showInfo = useCallback((message: string) => {
    addToast({ type: 'info', message });
  }, [addToast]);

  // Predefined common messages
  const messages = useMemo(() => ({
    courseUpdated: () => showSuccess('Course updated successfully'),
    courseDeleted: () => showSuccess('Course deleted successfully'),
    courseSubmitted: () => showSuccess('Course submitted for review successfully'),
    moduleDeleted: (title: string) => showSuccess(`Module "${title}" deleted successfully`),
    networkError: () => showError('Network error occurred. Please try again.'),
    invalidInput: (field: string) => showWarning(`Please provide a valid ${field}`),
    navigationError: () => showError('Failed to navigate. Please try again.'),

    // Module specific messages
    moduleLoadError: () => showError('Failed to load module content. Please try again.'),
    modulesLoadError: () => showError('Failed to load course modules. Please check your connection.'),
    chapterLoadError: () => showError('Failed to load course chapters. Please refresh the page.'),
    moduleNotFound: () => showError('Module not found. Please select a different module.'),
    moduleContentError: (message: string) => showError(message || 'Failed to load module content'),
    accessDenied: () => showError('Access denied to this module content'),
    authRequired: () => showError('Authentication required to access this content'),
  }), [showSuccess, showError, showWarning]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    messages,
  };
};
