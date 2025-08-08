/**
 * Enhanced Wallet Authentication Actions
 * Improved wallet auth with better user data handling
 */

import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/auth/authState";
import { useWalletAuth } from "@/hooks/auth/useWalletAuth";
import { tokenRefreshManager } from "@/lib/tokenRefresh";
import { useTokenRefresh } from "@/hooks/auth/useTokenRefresh";
import type { User, AuthIntent } from "@/types/auth";
import type { WalletAuthResponse, WalletUser } from "@/lib/api/types";

/**
 * Convert wallet user to store user format with enhanced data handling
 */
const mapWalletUserToUser = (walletUser: WalletUser): User => ({
  id: walletUser._id,
  walletAddress: walletUser.walletAddress,
  // Note: WalletUser from backend doesn't include username/email for pure wallet auth
  // These will be undefined for wallet-only users, which is expected
  username: undefined,
  email: undefined,
  emailVerified: undefined,
  bio: walletUser.bio,
  createdAt: walletUser.createdAt,
  authMethod: "wallet",
  isWalletConnected: true,
  walletMetadata: walletUser.walletMetadata,
});

/**
 * Convert wallet auth response to store user format
 */
const mapWalletAuthToUser = (authResponse: WalletAuthResponse): User => {
  return mapWalletUserToUser(authResponse.user);
};

/**
 * Enhanced wallet authentication actions hook
 */
export const useEnhancedWalletAuthActions = () => {
  const {
    setUser,
    setTokens,
    clearAuth,
    setWalletAddress,
    setWalletConnected,
  } = useAuthStore();
  const { addToast } = useUIStore();
  const walletAuthHook = useWalletAuth();
  const refreshTokenHook = useTokenRefresh();

  /**
   * Enhanced wallet authentication with better user data handling
   * @param bio - Optional bio for registration
   * @param intent - Whether to prioritize 'signup', 'signin', or 'auto'
   * @param userInfo - Optional additional user info (username, email)
   */
  const walletAuth = async (
    bio?: string,
    intent: AuthIntent = "auto",
    userInfo?: { username?: string; email?: string }
  ) => {
    try {
      const result = await walletAuthHook.authenticateWallet(bio, intent);

      if (result.success && result.data) {
        const user = mapWalletAuthToUser(result.data);

        // Enhance user data with provided info if available
        const enhancedUser: User = {
          ...user,
          username: user.username || userInfo?.username,
          email: user.email || userInfo?.email,
        };

        const tokens = {
          accessToken: result.data.tokens.accessToken,
          refreshToken: result.data.tokens.refreshToken,
        };

        setUser(enhancedUser);
        setTokens(tokens);

        // Start automatic token refresh
        tokenRefreshManager.startAutoRefresh(async () => {
          const currentRefreshToken =
            useAuthStore.getState().tokens?.refreshToken;
          if (!currentRefreshToken) return false;

          const refreshResult = await refreshTokenHook.refreshToken(
            currentRefreshToken
          );
          if (refreshResult) {
            setTokens({
              accessToken: refreshResult.accessToken,
              refreshToken: refreshResult.refreshToken,
            });
            return true;
          }
          return false;
        });

        addToast({
          type: "success",
          message: "🦄 Wallet connected successfully! Welcome to Kenesis.",
        });

        return { user: enhancedUser, tokens };
      } else {
        const errorMessage =
          result.error?.message || "Wallet authentication failed";
        addToast({
          type: "error",
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Wallet authentication error:", error);
      throw error;
    }
  };

  /**
   * Enhanced link wallet to existing email account
   */
  const linkWallet = async () => {
    try {
      const result = await walletAuthHook.linkWalletToAccount();

      if (result.success && result.data) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            username: result.data.user.username ?? currentUser.username,
            email: result.data.user.email ?? currentUser.email,
            emailVerified:
              result.data.user.emailVerified ?? currentUser.emailVerified,
            walletAddress: result.data.user.walletAddress,
            isWalletConnected: true,
            authMethod: "hybrid",
            walletMetadata: result.data.user.walletMetadata,
          };
          setUser(updatedUser);
        }

        addToast({
          type: "success",
          message: "🔗 Wallet linked to your account successfully!",
        });

        return result.data;
      } else {
        const errorMessage = result.error?.message || "Failed to link wallet";
        addToast({
          type: "error",
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Wallet linking error:", error);
      throw error;
    }
  };

  /**
   * Enhanced disconnect wallet from account
   */
  const disconnectWallet = () => {
    walletAuthHook.disconnectWallet();
    setWalletAddress(null);
    setWalletConnected(false);

    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.authMethod === "wallet") {
      // If wallet-only user, log them out completely
      clearAuth();
      addToast({
        type: "info",
        message: "Wallet disconnected. You have been logged out.",
      });
    } else if (currentUser) {
      // If hybrid user, keep email auth but remove wallet
      const updatedUser: User = {
        ...currentUser,
        walletAddress: null,
        isWalletConnected: false,
        authMethod: "email",
        walletMetadata: undefined,
      };
      setUser(updatedUser);
      addToast({
        type: "info",
        message: "Wallet disconnected from your account.",
      });
    }
  };

  return {
    // Actions
    walletAuth,
    linkWallet,
    disconnectWallet,

    // Hook states
    walletLoading: walletAuthHook.loading,
    walletError: walletAuthHook.error,
    walletAddress: walletAuthHook.address,
    walletChainId: walletAuthHook.chainId,
    isWalletConnected: walletAuthHook.isConnected,

    // Clear errors
    clearWalletError: walletAuthHook.clearError,

    // Additional wallet methods
    switchToChain: walletAuthHook.switchToChain,
    generateNonce: walletAuthHook.generateNonce,
  };
};
