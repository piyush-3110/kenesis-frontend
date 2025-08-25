import { useState, useEffect } from 'react';

interface LocalStorageState<T> {
  value: T | null;
  setValue: (value: T) => void;
  removeValue: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing localStorage with type safety and error handling
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T | null = null
): LocalStorageState<T> {
  const [value, setValue] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsedValue = JSON.parse(item);
        setValue(parsedValue);
      } else {
        setValue(defaultValue);
      }
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setValue(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
      setError(null);
    } catch (err) {
      console.error(`Error setting localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const removeValue = () => {
    try {
      setValue(null);
      localStorage.removeItem(key);
      setError(null);
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    value,
    setValue: setStoredValue,
    removeValue,
    loading,
    error,
  };
}

/**
 * Hook for managing sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T | null = null
): LocalStorageState<T> {
  const [value, setValue] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        const parsedValue = JSON.parse(item);
        setValue(parsedValue);
      } else {
        setValue(defaultValue);
      }
    } catch (err) {
      console.error(`Error reading sessionStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setValue(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue);
      sessionStorage.setItem(key, JSON.stringify(newValue));
      setError(null);
    } catch (err) {
      console.error(`Error setting sessionStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const removeValue = () => {
    try {
      setValue(null);
      sessionStorage.removeItem(key);
      setError(null);
    } catch (err) {
      console.error(`Error removing sessionStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    value,
    setValue: setStoredValue,
    removeValue,
    loading,
    error,
  };
}
