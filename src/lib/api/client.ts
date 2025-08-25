/**
 * Base API client
 * Handles HTTP requests with proper token management and automatic token refresh
 */

import { TokenManager } from "@/features/auth/tokenManager";
import type { ApiResponse } from "./apiTypes";

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
      "forbidden",
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
    console.log("🌐 [API-CLIENT] ============= MAKING REQUEST =============");
    console.log("🌐 [API-CLIENT] Endpoint:", endpoint);
    console.log("🌐 [API-CLIENT] Method:", options.method || "GET");
    console.log("🌐 [API-CLIENT] Is Retry:", isRetry);
    console.log("🌐 [API-CLIENT] Timestamp:", new Date().toISOString());
    
    // If already refreshing, wait for the refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      console.log("🌐 [API-CLIENT] Waiting for token refresh to complete...");
      const refreshSuccess = await this.refreshPromise;
      if (!refreshSuccess) {
        console.error("🌐 [API-CLIENT] Token refresh failed, returning auth error");
        return {
          success: false,
          message: "Authentication failed. Please log in again.",
        };
      }
    }

    const url = `${this.baseURL}${endpoint}`;
    console.log("🌐 [API-CLIENT] Full URL:", url);

    // Get access token and add to headers
    const accessToken = TokenManager.getAccessToken();
    console.log("🌐 [API-CLIENT] Access token present:", !!accessToken);
    console.log("🌐 [API-CLIENT] Access token length:", accessToken ? accessToken.length : 0);
    console.log("🌐 [API-CLIENT] Access token preview:", accessToken ? `${accessToken.substring(0, 20)}...` : "No token");
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      console.log("🌐 [API-CLIENT] Authorization header added");
    } else {
      console.warn("🌐 [API-CLIENT] No access token available for request");
    }
    
    console.log("🌐 [API-CLIENT] Final headers:", headers);

    try {
      console.log("🌐 [API-CLIENT] Sending fetch request...");
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("🌐 [API-CLIENT] ============= FETCH RESPONSE =============");
      console.log("🌐 [API-CLIENT] Response status:", response.status);
      console.log("🌐 [API-CLIENT] Response status text:", response.statusText);
      console.log("🌐 [API-CLIENT] Response ok:", response.ok);
      console.log("🌐 [API-CLIENT] Response headers:", Object.fromEntries(response.headers.entries()));

      // Parse JSON response
      console.log("🌐 [API-CLIENT] Parsing JSON response...");
      const data = await response.json();
      console.log("🌐 [API-CLIENT] Parsed data:", data);
      console.log("🌐 [API-CLIENT] Data type:", typeof data);
      console.log("🌐 [API-CLIENT] Data keys:", Object.keys(data || {}));

      // Handle API response format
      if (!response.ok) {
        const errorMessage =
          data.message || `HTTP ${response.status}: ${response.statusText}`;
        
        console.error("🌐 [API-CLIENT] ============= REQUEST FAILED =============");
        console.error("🌐 [API-CLIENT] Error status:", response.status);
        console.error("🌐 [API-CLIENT] Error message:", errorMessage);
        console.error("🌐 [API-CLIENT] Error data:", data);

        // Check if this is a token expiration error and we haven't already retried
        if (
          !isRetry &&
          (response.status === 401 ||
            response.status === 403 ||
            this.isTokenExpiredError(errorMessage)) &&
          TokenManager.getRefreshToken()
        ) {
          console.log("🔄 [API-CLIENT] Detected token expiration, attempting refresh...");

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

      console.log("🌐 [API-CLIENT] ============= SUCCESS RESPONSE =============");
      console.log("🌐 [API-CLIENT] Request successful, returning data");
      
      const successResponse = {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
      
      console.log("🌐 [API-CLIENT] Success response:", successResponse);
      console.log("🌐 [API-CLIENT] Success response JSON:", JSON.stringify(successResponse, null, 2));
      
      return successResponse;
    } catch (error) {
      console.error("🌐 [API-CLIENT] ============= FETCH ERROR =============");
      console.error("🌐 [API-CLIENT] Fetch error occurred:", error);
      console.error("🌐 [API-CLIENT] Error type:", typeof error);
      console.error("🌐 [API-CLIENT] Error constructor:", error?.constructor?.name);
      console.error("🌐 [API-CLIENT] Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("🌐 [API-CLIENT] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      console.error("🌐 [API-CLIENT] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

      const errorResponse = {
        success: false,
        message:
          error instanceof Error ? error.message : "Network error occurred",
      };
      
      console.error("🌐 [API-CLIENT] Returning error response:", errorResponse);
      return errorResponse;
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
