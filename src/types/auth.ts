/**
 * Centralized authentication types
 * All auth-related interfaces and types
 */

import type { WalletAuthResponse, WalletLinkResponse } from '@/lib/api/types';

/**
 * User interface for authentication store
 * Maps to backend user model
 */
export interface User {
  id: string;
  email?: string; // Optional for wallet-only users
  username?: string; // Optional for wallet-only users
  bio?: string;
  emailVerified?: boolean; // Optional for wallet-only users
  createdAt: string;

  // Wallet-specific fields
  walletAddress?: string | null;
  isWalletConnected?: boolean;
  authMethod?: "email" | "wallet" | "hybrid";
  walletMetadata?: {
    chainId: number;
    verified: boolean;
    verifiedAt: string;
    lastSyncAt: string;
  };
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
 * Login data interface
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;

  // Wallet state
  walletAddress: string | null;
  isWalletConnected: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  updateUserVerification: (verified: boolean) => void;
  clearAuth: () => void;

  // Wallet actions
  setWalletAddress: (address: string | null) => void;
  setWalletConnected: (connected: boolean) => void;
  updateWalletMetadata: (metadata: User["walletMetadata"]) => void;
}

/**
 * Auth tokens interface
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Wallet authentication error types
 */
export interface WalletAuthError {
  type:
    | "USER_NOT_FOUND"
    | "WALLET_ALREADY_REGISTERED"
    | "WALLET_ALREADY_LINKED"
    | "INVALID_SIGNATURE"
    | "NONCE_EXPIRED"
    | "NETWORK_ERROR"
    | "USER_REJECTED";
  message: string;
}

/**
 * Wallet authentication result
 */
export interface WalletAuthResult {
  success: boolean;
  data?: WalletAuthResponse;
  error?: WalletAuthError;
}

/**
 * Wallet linking result
 */
export interface WalletLinkResult {
  success: boolean;
  data?: WalletLinkResponse;
  error?: WalletAuthError;
}

/**
 * Authentication method intent
 */
export type AuthIntent = "signup" | "signin" | "auto";

/**
 * Authentication action results
 */
export interface AuthActionResult {
  success: boolean;
  message: string;
  isRateLimit?: boolean;
  isValidationError?: boolean;
  isSessionExpired?: boolean;
  isTokenInvalid?: boolean;
}
