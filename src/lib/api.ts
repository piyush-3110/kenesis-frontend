/**
 * API Layer for Kenesis Platform
 * Handles all authentication and API calls with proper security and error handling
 * Follows integration.md guidelines for clean, secure integration
 */

// Environment configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kenesis-backend.onrender.com';

console.log('API Base URL configured:', API_BASE_URL);

/**
 * API Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  retryAfter?: number;
}

export interface ApiUser {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Login response format (different from register)
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

// Register response format (existing)
export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
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

// Refresh token response format
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Token Management Utilities
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

  hasTokens: (): boolean => {
    return !!(TokenManager.getAccessToken() && TokenManager.getRefreshToken());
  }
};

/**
 * Core API Client
 * Handles fetch requests with proper error handling
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON - probably HTML error page
        const text = await response.text();
        console.error(`Non-JSON Response [${response.status}]:`, text.substring(0, 200));
        return {
          success: false,
          message: `Server error (${response.status}). Please check if the API is running correctly.`
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`API Error [${response.status}]:`, data);
        return {
          success: false,
          message: data.message || 'Request failed',
          errors: data.errors,
          retryAfter: data.retryAfter
        };
      }

      console.log(`API Success [${response.status}]:`, data.message || 'Request successful');
      return {
        success: true,
        message: data.message || 'Success',
        data: data.data || data
      };
    } catch (error) {
      console.error('API Response Parse Error:', error);
      return {
        success: false,
        message: 'Failed to parse server response. Please check your network connection.'
      };
    }
  }

  async post<T>(endpoint: string, payload?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`🚀 Making POST request to: ${this.baseURL}${endpoint}`);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if access token is available
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔑 Added Authorization header');
      } else {
        console.log('🔓 No access token found, proceeding without Authorization header');
      }

      console.log(`📡 Final headers:`, headers);
      console.log(`📤 Request body:`, JSON.stringify(payload));

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on ${endpoint}:`, error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      console.log(`🚀 Making FormData POST request to: ${this.baseURL}${endpoint}`);

      // Build headers (don't set Content-Type for FormData - browser will set it with boundary)
      const headers: Record<string, string> = {};

      // Add Authorization header if access token is available
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔑 Added Authorization header');
      } else {
        console.log('🔓 No access token found, proceeding without Authorization header');
      }

      console.log(`📡 Final headers:`, headers);
      console.log('📤 FormData contents:', Array.from(formData.entries()));

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log(`📥 Response status: ${response.status}`);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on ${endpoint}:`, error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

/**
 * Authentication API
 * All auth-related API calls
 */
export const AuthAPI = {
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
    return apiClient.post('/api/auth/logout', {});
  },

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  resendVerification: async (email: string): Promise<ApiResponse> => {
    return apiClient.post('/api/auth/resend-verification', { email });
  },

  /**
   * Refresh tokens
   * POST /api/auth/refresh-token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
    return apiClient.post<RefreshTokenResponse>('/api/auth/refresh-token', data);
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

/**
 * Course Management API
 * All course-related API calls for instructors
 */
export const CourseAPI = {
  /**
   * Create new course
   * POST /api/courses
   * Requires multipart/form-data and Authorization header
   */
  createCourse: async (courseData: FormData): Promise<ApiResponse<{ course: string }>> => {
    return apiClient.postFormData<{ course: string }>('/api/courses', courseData);
  },

  /**
   * Create chapter for a course
   * POST /api/courses/{id}/chapters
   * Requires Authorization header
   */
  createChapter: async (courseId: string, chapterData: { title: string; description: string }): Promise<ApiResponse<{ chapterId: string }>> => {
    return apiClient.post<{ chapterId: string }>(`/api/courses/${courseId}/chapters`, chapterData);
  },

  /**
   * Create module for a course
   * POST /api/courses/{courseId}/modules
   * Requires multipart/form-data and Authorization header
   */
  createModule: async (courseId: string, moduleData: FormData): Promise<ApiResponse<any>> => {
    return apiClient.postFormData(`/api/courses/${courseId}/modules`, moduleData);
  },

  /**
   * Submit course for admin review
   * POST /api/courses/{id}/submit-for-review
   * Requires Authorization header
   */
  submitForReview: async (courseId: string, submissionNotes?: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/api/courses/${courseId}/submit-for-review`, { submissionNotes });
  },
};

/**
 * Error Formatting Utility
 */
export const formatApiError = (response: ApiResponse): string => {
  if (response.errors && response.errors.length > 0) {
    return response.errors.map(err => `${err.field}: ${err.message}`).join(', ');
  }
  return response.message || 'An unexpected error occurred';
};

/**
 * Retry After Formatter
 */
export const formatRetryAfter = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};
