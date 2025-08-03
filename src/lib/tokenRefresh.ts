/**
 * Token Refresh Manager
 * Handles automatic token refresh in background following integration.md guidelines
 * Silent operation with no UI blocking or verbose error handling
 */

import { TokenManager } from '@/lib/api';

class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  
  // Refresh tokens 5 minutes before expiry (standard practice)
  private readonly REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes

  /**
   * Start automatic token refresh
   * Call this after successful login
   */
  startAutoRefresh(refreshAction: () => Promise<boolean>) {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      if (!this.isRefreshing && TokenManager.hasTokens()) {
        this.isRefreshing = true;
        
        try {
          const success = await refreshAction();
          if (!success) {
            this.stopAutoRefresh();
            // Redirect to login will be handled by the auth store
          }
        } catch (error) {
          console.error('Auto refresh error:', error);
          this.stopAutoRefresh();
        } finally {
          this.isRefreshing = false;
        }
      }
    }, this.REFRESH_INTERVAL);

    console.log('Auto token refresh started');
  }

  /**
   * Stop automatic token refresh
   * Call this on logout or auth failure
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('Auto token refresh stopped');
    }
  }

  /**
   * Manual token refresh
   * For immediate refresh needs
   */
  async refreshNow(refreshAction: () => Promise<boolean>): Promise<boolean> {
    if (this.isRefreshing) {
      return false;
    }

    this.isRefreshing = true;
    try {
      return await refreshAction();
    } finally {
      this.isRefreshing = false;
    }
  }
}

// Export singleton instance
export const tokenRefreshManager = new TokenRefreshManager();

/**
 * Custom hook for token refresh management
 * Integrates with auth store following integration guidelines
 */
export const useTokenRefresh = () => {
  const startAutoRefresh = (refreshAction: () => Promise<boolean>) => {
    tokenRefreshManager.startAutoRefresh(refreshAction);
  };

  const stopAutoRefresh = () => {
    tokenRefreshManager.stopAutoRefresh();
  };

  const refreshNow = async (refreshAction: () => Promise<boolean>) => {
    return tokenRefreshManager.refreshNow(refreshAction);
  };

  return {
    startAutoRefresh,
    stopAutoRefresh,
    refreshNow,
  };
};
