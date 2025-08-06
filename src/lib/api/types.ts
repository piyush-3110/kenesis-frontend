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

// Wallet authentication
export interface WalletNonceRequest {
  walletAddress: string;
}

export interface WalletNonceResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface WalletRegisterRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
  bio?: string;
  chainId: number;
}

export interface WalletLoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
}

export interface WalletLinkRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
  chainId: number;
}

export interface WalletUser {
  _id: string;
  walletAddress: string;
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

export interface WalletLinkResponse {
  user: {
    _id: string;
    username?: string;
    email?: string;
    walletAddress: string;
    emailVerified?: boolean;
    walletMetadata: {
      chainId: number;
      verified: boolean;
      verifiedAt: string;
      lastSyncAt: string;
    };
  };
  message: string;
}
