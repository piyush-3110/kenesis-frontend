/**
 * API types and interfaces
 * Centralized type definitions for API communication
 */

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  retryAfter?: number;
}

// Authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// User types
export interface ApiUser {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

// Registration
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio?: string;
}

export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    bio: string;
    role: string;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Token refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Wallet authentication (SIWE) - New flow
export interface WalletPrepareRequest {
  // Optional but recommended; 0x-prefixed, 40 hex chars
  walletAddress?: string;
}

export interface WalletPrepareResponse {
  challengeId: string;
  message: string; // SIWE message to sign as-is
  expiresAt: string; // ISO-8601
}

export interface WalletVerifyRequest {
  challengeId: string;
  signature: string; // 0x + 130 hex chars
  message: string; // exact SIWE message that was signed
}

export interface WalletUser {
  _id: string;
  walletAddress: string;
  // When linking, backend may include public profile fields
  username?: string;
  email?: string;
  emailVerified?: boolean;
  bio?: string;
  walletMetadata: {
    chainId: number;
    verified: boolean;
    verifiedAt: string;
    lastSyncAt: string;
  };
  createdAt: string;
}

export interface WalletAuthResponse {
  user: WalletUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
