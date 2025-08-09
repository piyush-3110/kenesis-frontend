/**
 * Token Manager
 * Handles storage and retrieval of authentication tokens
 */

import type { AuthTokens } from './api/types';

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'kenesis_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'kenesis_refresh_token';

  /**
   * Set authentication tokens
   */
  static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user has valid tokens
   */
  static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}
