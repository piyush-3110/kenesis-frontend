'use client';

import { useEffect, useState } from 'react';

// Types for user authentication
export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  isConnected: boolean;
}

// Mock user for development - replace with actual auth system
const MOCK_USER: User = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
  walletAddress: '0x742d35cc6628c532',
  isConnected: true,
};

/**
 * Custom hook for user authentication
 * Replace this with your actual authentication system
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // In a real app, you would check authentication here
      // For now, using mock user
      setUser(MOCK_USER);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const getCurrentUserId = (): string | null => {
    return user?.id || null;
  };

  const isAuthenticated = (): boolean => {
    return !!user && user.isConnected;
  };

  return {
    user,
    isLoading,
    getCurrentUserId,
    isAuthenticated,
  };
};

// Export for use in the store
export { MOCK_USER };
