/**
 * Base API client
 * Handles HTTP requests with proper token management and automatic token refresh
 */

import { TokenManager } from "../tokenManager";
import type {
  ApiResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "./types";

// Environment configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kenesis-backend.onrender.com";

console.log("API Base URL configured:", API_BASE_URL);

/**
 * Base API client with automatic token handling and refresh
 */
class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      console.error("No refresh token available");
      return false;
    }

    try {
      console.log("🔄 Attempting to refresh access token...");

      const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Token refresh failed:", data.message);
        // Clear tokens on refresh failure
        TokenManager.clearTokens();
        return false;
      }

      // Update stored tokens
      const newTokens = {
        accessToken: data.data.accessToken || data.accessToken,
        refreshToken: data.data.refreshToken || data.refreshToken,
      };

      TokenManager.setTokens(newTokens);
      console.log("✅ Tokens refreshed successfully");
      return true;
    } catch (error) {
      console.error("❌ Token refresh network error:", error);
      TokenManager.clearTokens();
      return false;
    }
  }

  /**
   * Check if error indicates expired token
   */
  private isTokenExpiredError(message: string): boolean {
    const expiredPatterns = [
      "token has expired",
      "token expired",
      "access token expired",
      "jwt expired",
      "token is expired",
      "expired token",
      "unauthorized",
      "invalid token",
    ];

    return expiredPatterns.some((pattern) =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {
    // If already refreshing, wait for the refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      const refreshSuccess = await this.refreshPromise;
      if (!refreshSuccess) {
        return {
          success: false,
          message: "Authentication failed. Please log in again.",
        };
      }
    }

    const url = `${this.baseURL}${endpoint}`;

    // Get access token and add to headers
    const accessToken = TokenManager.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Parse JSON response
      const data = await response.json();

      // Handle API response format
      if (!response.ok) {
        const errorMessage =
          data.message || `HTTP ${response.status}: ${response.statusText}`;

        // Check if this is a token expiration error and we haven't already retried
        if (
          !isRetry &&
          (response.status === 401 || this.isTokenExpiredError(errorMessage)) &&
          TokenManager.getRefreshToken()
        ) {
          console.log("🔄 Detected token expiration, attempting refresh...");

          // Set refreshing flag and create refresh promise
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshPromise = this.refreshToken();
          }

          const refreshSuccess = await this.refreshPromise;
          this.isRefreshing = false;
          this.refreshPromise = null;

          if (refreshSuccess) {
            console.log("🔄 Retrying original request with new token...");
            // Retry the original request with new token
            return this.request<T>(endpoint, options, true);
          } else {
            console.error("❌ Token refresh failed, authentication required");
            return {
              success: false,
              message: "Session expired. Please log in again.",
            };
          }
        }

        return {
          success: false,
          message: errorMessage,
          errors: data.errors,
          retryAfter: response.headers.get("Retry-After")
            ? parseInt(response.headers.get("Retry-After")!)
            : undefined,
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
