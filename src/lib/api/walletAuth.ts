/**
 * Wallet Authentication API
 * Handles all wallet-based authentication endpoints
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  WalletNonceRequest,
  WalletNonceResponse,
  WalletRegisterRequest,
  WalletLoginRequest,
  WalletLinkRequest,
  WalletAuthResponse,
  WalletLinkResponse,
} from './types';

export const walletAuthAPI = {
  /**
   * Request wallet nonce for signing
   * POST /api/auth/wallet/request-nonce
   */
  requestWalletNonce: async (
    data: WalletNonceRequest
  ): Promise<ApiResponse<WalletNonceResponse>> => {
    return apiClient.post<WalletNonceResponse>(
      '/api/auth/wallet/request-nonce',
      data
    );
  },

  /**
   * Register new user with wallet
   * POST /api/auth/wallet/register
   */
  walletRegister: async (
    data: WalletRegisterRequest
  ): Promise<ApiResponse<WalletAuthResponse>> => {
    return apiClient.post<WalletAuthResponse>(
      '/api/auth/wallet/register',
      data
    );
  },

  /**
   * Login existing user with wallet
   * POST /api/auth/wallet/login
   */
  walletLogin: async (
    data: WalletLoginRequest
  ): Promise<ApiResponse<WalletAuthResponse>> => {
    return apiClient.post<WalletAuthResponse>('/api/auth/wallet/login', data);
  },

  /**
   * Link wallet to existing email account
   * POST /api/auth/wallet/link
   * Requires Authorization header with access token
   */
  linkWallet: async (
    data: WalletLinkRequest
  ): Promise<ApiResponse<WalletLinkResponse>> => {
    return apiClient.post<WalletLinkResponse>('/api/auth/wallet/link', data);
  },
};
