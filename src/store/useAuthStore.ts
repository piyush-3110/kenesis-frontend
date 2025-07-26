import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User interface for authentication
 */
interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  isVerified: boolean;
  walletAddress?: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Signup data interface
 */
interface SignupData {
  email: string;
  password: string;
  fullName: string;
  agreeToTerms: boolean;
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  connectWallet: (walletAddress: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          // Mock login - replace with real API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (email === 'test@example.com' && password === 'password') {
            const user: User = {
              id: 'user-123',
              fullName: 'John Doe',
              email: email,
              avatar: '/images/landing/avatar1.png',
              role: 'student',
              isVerified: true,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            set({ user, isAuthenticated: true, loading: false });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      signup: async (userData: SignupData) => {
        try {
          set({ loading: true, error: null });
          
          // Mock signup - replace with real API
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          if (!userData.agreeToTerms) {
            throw new Error('You must agree to the terms and conditions');
          }

          const user: User = {
            id: 'user-' + Date.now(),
            fullName: userData.fullName,
            email: userData.email,
            role: 'student',
            isVerified: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          
          set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          
          // Mock forgot password - replace with real API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      connectWallet: async (walletAddress: string) => {
        try {
          set({ loading: true, error: null });
          
          const { user } = get();
          if (!user) {
            throw new Error('User must be logged in to connect wallet');
          }

          // Mock wallet connection - replace with real API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const updatedUser = { ...user, walletAddress };
          set({ user: updatedUser, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for optimal performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);
