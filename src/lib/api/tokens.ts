/**
 * Token API
 * Handles token refresh operations
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types';

export const tokenAPI = {
  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> => {
    return apiClient.post<RefreshTokenResponse>('/api/auth/refresh-token', data);
  },
};
