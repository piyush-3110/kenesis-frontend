/**
 * Wallet Authentication API (SIWE)
 * New simplified flow: prepare -> verify
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  WalletPrepareRequest,
  WalletPrepareResponse,
  WalletVerifyRequest,
  WalletAuthResponse,
} from './types';

export const walletAuthAPI = {
  /**
   * Prepare a SIWE challenge
   * POST /api/auth/wallet/prepare
   * - If Authorization header is present, backend treats this as link mode
   */
  prepare: async (
    data: WalletPrepareRequest
  ): Promise<ApiResponse<WalletPrepareResponse>> => {
    return apiClient.post<WalletPrepareResponse>('/api/auth/wallet/prepare', data);
  },

  /**
   * Verify signed SIWE message
   * POST /api/auth/wallet/verify
   * - Works for both login/register and link flows
   */
  verify: async (
    data: WalletVerifyRequest
  ): Promise<ApiResponse<WalletAuthResponse>> => {
    return apiClient.post<WalletAuthResponse>('/api/auth/wallet/verify', data);
  },
};
