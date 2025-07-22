import { useState, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for handling async operations with loading, error, and data states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction();
      
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

/**
 * Hook for making API calls with caching
 */
export function useApi<T>(
  url: string,
  options?: RequestInit,
  dependencies: any[] = []
): AsyncState<T> & { cache: Map<string, any> } {
  const cacheRef = useRef(new Map<string, any>());
  
  const asyncFunction = async (): Promise<T> => {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Cache the result
    cacheRef.current.set(cacheKey, result);
    
    return result;
  };

  const asyncState = useAsync<T>(asyncFunction, [url, JSON.stringify(options), ...dependencies]);

  return {
    ...asyncState,
    cache: cacheRef.current,
  };
}

/**
 * Hook for handling form submissions
 */
export function useAsyncSubmit<T, P = any>(
  submitFunction: (data: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (formData: P) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await submitFunction(formData);
      
      setData(result);
      setSuccess(true);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed';
      setError(errorMessage);
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    success,
    submit,
    reset,
  };
}
