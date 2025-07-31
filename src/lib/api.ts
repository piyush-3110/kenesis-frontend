/**
 * API Utility for Kenesis Platform
 * Handles all API calls with proper security and error handling
 * Follows integration.md guidelines for security and abstraction
 */

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiUser {
  id: string;
  email: string;
  username: string;
  bio?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  user: ApiUser;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('Environment variable NEXT_PUBLIC_API_BASE_URL is not defined');
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
}

console.log('API Base URL:', API_BASE_URL); // Debug log

/**
 * Token management utilities
 */
export const TokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kenesis_access_token');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kenesis_refresh_token');
  },

  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('kenesis_access_token', tokens.accessToken);
    localStorage.setItem('kenesis_refresh_token', tokens.refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('kenesis_access_token');
    localStorage.removeItem('kenesis_refresh_token');
  },

  isAuthenticated: (): boolean => {
    return !!TokenManager.getAccessToken();
  }
};

/**
 * Core API fetcher with security measures
 * Abstracts fetch logic as per integration guidelines
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Generic API request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('Making API request to:', url); // Debug log
    
    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists
    const accessToken = TokenManager.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('Request headers:', headers); // Debug log

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Remove credentials for wildcard CORS
        // credentials: 'include',
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response headers:', response.headers); // Debug log

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType); // Debug log
        throw new Error('Invalid response format');
      }

      const data: ApiResponse<T> = await response.json();
      console.log('Response data:', data); // Debug log

      // Handle HTTP errors
      if (!response.ok) {
        console.error('HTTP Error:', response.status, data); // Debug log
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error); // Debug log
      // Network or parsing errors
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Create singleton API client instance
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Authentication API methods
 * Handles all auth-related API calls with proper error handling
 */
export const AuthAPI = {
  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/api/auth/register', userData);
  },

  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<ApiResponse<any>> => {
    return apiClient.post('/api/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<ApiResponse<any>> => {
    return apiClient.post('/api/auth/resend-verification', { email });
  },

  /**
   * Revoke current session
   */
  revokeSession: async (): Promise<ApiResponse<any>> => {
    return apiClient.post('/api/auth/revoke-session');
  },

  /**
   * Revoke all sessions
   */
  revokeAllSessions: async (): Promise<ApiResponse<any>> => {
    return apiClient.post('/api/auth/revoke-all-sessions');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<ApiResponse<AuthTokens>> => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return apiClient.post<AuthTokens>('/api/auth/refresh', { refreshToken });
  },
};

/**
 * Error handler for API responses
 */
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};
