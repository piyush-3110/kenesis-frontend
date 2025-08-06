/**
 * Auth State Store
 * Manages authentication state using Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TokenManager } from "@/lib/tokenManager";
import type { AuthState } from "@/types/auth";

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

      // Wallet state
      walletAddress: null,
      isWalletConnected: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          // Update wallet state from user
          walletAddress: user?.walletAddress || null,
          isWalletConnected: !!user?.isWalletConnected,
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

      updateUserVerification: (verified) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, emailVerified: verified },
          });
        }
      },

      clearAuth: () => {
        TokenManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          tokens: null,
          walletAddress: null,
          isWalletConnected: false,
        });
      },

      // Wallet actions
      setWalletAddress: (address) => {
        const { user } = get();
        set({
          walletAddress: address,
          isWalletConnected: !!address,
          user: user
            ? { ...user, walletAddress: address, isWalletConnected: !!address }
            : user,
        });
      },

      setWalletConnected: (connected) => {
        const { user } = get();
        set({
          isWalletConnected: connected,
          user: user ? { ...user, isWalletConnected: connected } : user,
        });
      },

      updateWalletMetadata: (metadata) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, walletMetadata: metadata },
          });
        }
      },
    }),
    {
      name: "kenesis-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for optimal performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthTokens = () => useAuthStore((state) => state.tokens);

// Wallet-specific selectors
export const useWalletAddress = () =>
  useAuthStore((state) => state.walletAddress);
export const useIsWalletConnected = () =>
  useAuthStore((state) => state.isWalletConnected);
export const useAuthMethod = () =>
  useAuthStore((state) => state.user?.authMethod);
export const useWalletMetadata = () =>
  useAuthStore((state) => state.user?.walletMetadata);
