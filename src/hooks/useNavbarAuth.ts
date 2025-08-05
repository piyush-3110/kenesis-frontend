import { useMemo } from 'react';
import { useAuthUser, useIsAuthenticated } from '@/store/useAuthStore';

/**
 * Optimized hook for navbar authentication state
 * Minimizes re-renders and provides only necessary data
 */
export const useNavbarAuth = () => {
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();

  // Memoize navbar data to prevent unnecessary re-renders
  const navbarData = useMemo(() => ({
    isAuthenticated,
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.username?.charAt(0)?.toUpperCase() || 'U',
    isEmailVerified: user?.emailVerified || false,
  }), [isAuthenticated, user?.username, user?.email, user?.emailVerified]);

  return navbarData;
};
