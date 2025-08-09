/**
 * Email Authentication API
 * Handles all email-based authentication endpoints
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  RegisterRequest,
  AuthResponse,
  LoginRequest,
  LoginResponse,
} from './types';

export const emailAuthAPI = {
  /**
   * Register new user
   * POST /api/auth/register
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/api/auth/register', data);
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/api/auth/login', data);
  },

  /**
   * Logout user
   * POST /api/auth/logout
   * Requires Authorization header with access token
   */
  logout: async (): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/logout');
  },

  /**
   * Verify email
   * GET /api/auth/verify-email?token=<token>
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    return apiClient.get(`/api/auth/verify-email?token=${token}`);
  },

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  resendVerification: async (email: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/resend-verification', { email });
  },

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/forgot-password', { email });
  },

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/reset-password', { token, newPassword });
  },
};
