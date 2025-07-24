import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

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
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
          name: 'Test User',
          email: email,
          avatar: '/images/landing/avatar1.png'
        };
        set({ user, isAuthenticated: true, loading: false });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, loading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
  },
}));

// Selectors for optimal performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);
