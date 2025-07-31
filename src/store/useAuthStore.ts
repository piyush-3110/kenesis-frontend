import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TokenManager, type ApiUser, type AuthTokens } from '@/lib/api';
import { useLogin, useRegister, useSession } from '@/hooks/useAuth';

/**
 * User interface for authentication store
 */
export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Signup data interface
 */
export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  bio?: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  initializeAuth: () => void;
  clearAuth: () => void;
}

/**
 * Convert API user to store user format
 */
const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  username: apiUser.username,
  bio: apiUser.bio,
  role: apiUser.role,
  emailVerified: apiUser.emailVerified,
  createdAt: apiUser.createdAt,
});

/**
 * Auth Store Implementation using Zustand
 * Handles authentication state with proper token management
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      tokens: null,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setTokens: (tokens) => {
        set({ tokens });
        if (tokens) {
          TokenManager.setTokens(tokens);
        } else {
          TokenManager.clearTokens();
        }
      },

      initializeAuth: () => {
        const accessToken = TokenManager.getAccessToken();
        const refreshToken = TokenManager.getRefreshToken();
        
        if (accessToken && refreshToken) {
          set({
            isAuthenticated: true,
            tokens: { accessToken, refreshToken }
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            tokens: null
          });
        }
      },

      clearAuth: () => {
        TokenManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          tokens: null
        });
      },
    }),
    {
      name: 'kenesis-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Auth action hooks that integrate with the store
 */
export const useAuthActions = () => {
  const { setUser, setTokens, clearAuth } = useAuthStore();
  const loginHook = useLogin();
  const registerHook = useRegister();
  const sessionHook = useSession();

  return {
    // Login action
    login: async (email: string, password: string) => {
      try {
        const response = await loginHook.login({ email, password });
        const user = mapApiUserToUser(response.user);
        
        setUser(user);
        setTokens(response.tokens);
        
        return { user, needsVerification: !response.user.emailVerified };
      } catch (error) {
        throw error;
      }
    },

    // Register action
    register: async (userData: SignupData) => {
      try {
        const response = await registerHook.register({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          bio: userData.bio,
        });
        
        const user = mapApiUserToUser(response.user);
        
        setUser(user);
        setTokens(response.tokens);
        
        return { user, needsVerification: !response.user.emailVerified };
      } catch (error) {
        throw error;
      }
    },

    // Logout action
    logout: async (revokeAll: boolean = false) => {
      try {
        await sessionHook.logout(revokeAll);
        clearAuth();
      } catch (error) {
        // Clear auth even if API call fails
        clearAuth();
        throw error;
      }
    },

    // Hook states
    loginLoading: loginHook.loading,
    loginError: loginHook.error,
    registerLoading: registerHook.loading,
    registerError: registerHook.error,
    sessionLoading: sessionHook.loading,
    sessionError: sessionHook.error,

    // Clear errors
    clearLoginError: loginHook.clearError,
    clearRegisterError: registerHook.clearError,
    clearSessionError: sessionHook.clearError,
  };
};

// Selectors for optimal performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthTokens = () => useAuthStore((state) => state.tokens);
