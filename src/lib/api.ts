/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Layer for Kenesis Platform
 * Handles all authentication and API calls with proper security and error handling
 * Follows integration.md guidelines for clean, secure integration
 */

import { TokenManager } from "@/features/auth/tokenManager";
import { http } from "./http/axios";

// Environment configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kenesis-backend.onrender.com";

/**
 * API Types
 */
export interface ApiResponse<T = unknown> {
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

export interface WalletUser {
  _id: string;
  walletAddress: string;
  bio?: string;
  walletMetadata: {
    chainId: number;
    verified: boolean;
    verifiedAt: string;
    lastSyncAt: string;
  };
  createdAt: string;
}

export interface WalletAuthResponse {
  user: WalletUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface WalletLinkResponse {
  user: {
    _id: string;
    username?: string;
    email?: string;
    walletAddress: string;
    emailVerified?: boolean;
    walletMetadata: {
      chainId: number;
      verified: boolean;
      verifiedAt: string;
      lastSyncAt: string;
    };
  };
  message: string;
}

/**
 * Course Management Types
 */
export interface CreateCourseRequest {
  title: string;
  description: string;
  shortDescription: string;
  type: "video" | "document";
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  price: number;
  tokenToPayWith: string; // JSON string of array
  accessDuration: number; // seconds, -1 for unlimited
  affiliatePercentage: number; // e.g., 1000 = 10%
  availableQuantity: number; // -1 for unlimited
  thumbnail: File;
  previewVideo: File;
  metadata?: string; // JSON string containing requirements, learningOutcomes, targetAudience
}

export interface UpdateCourseRequest {
  title?: string; // 3–100 chars, trimmed
  shortDescription?: string; // 20–200 chars, trimmed
  description?: string; // 50–5000 chars, trimmed
  level?: "beginner" | "intermediate" | "advanced";
  language?: string; // Format: ^[a-z]{2}(-[A-Z]{2})?$ (e.g., "en", "en-US")
  metadata?: {
    requirements?: string[]; // max 10, each 1–200 chars
    learningOutcomes?: string[]; // max 15, each 1–200 chars
    targetAudience?: string[]; // max 10, each 1–100 chars
  };
  price?: number; // Course price (accepted but not enforced by schema)
}

/**
 * Course Update Response - following API documentation
 */
export interface UpdateCourseResponse {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  status: string;
  price: number;
  instructor: {
    id: string;
    username: string;
    avatar: string;
  };
  stats: {
    rating: number;
    reviewCount: number;
    duration: number;
  };
  level: string;
  language: string;
  metadata: {
    requirements: string[];
    learningOutcomes: string[];
    targetAudience: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterRequest {
  title: string;
  description: string;
  order?: number;
}

// Chapter Update Request - following API documentation
export interface UpdateChapterRequest {
  title?: string; // min: 3, max: 200, trimmed
  description?: string; // min: 10, max: 1000, trimmed
  order?: number; // integer, min: 1, max: 1000
}

// Chapter Update Response - following API documentation
export interface UpdateChapterResponse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleRequest {
  chapterId: string;
  title: string;
  type: "video" | "document";
  description?: string;
  order?: number;
  duration?: number;
  isPreview?: boolean;
  mainFile?: File;
  attachments?: File[];
}

/**
 * Module Update Request - matches new backend API
 * PUT /api/courses/:id/modules/:moduleId
 * All fields are optional for updates
 */
export interface UpdateModuleRequest {
  title?: string; // Module title (1-200 characters)
  description?: string; // Module description (max 1000 characters)
  order?: number; // Module order within chapter (minimum 1)
  duration?: number; // Module duration in seconds (minimum 0)
  isPreview?: boolean; // Whether module is a preview
  mainFile?: File; // Optional main content file
  attachments?: File[]; // Optional array of attachment files (max 10)
  // Note: Removed fields like prerequisites, learningOutcomes, resources, content, etc.
  // as they are not supported by the new backend API
}

/**
 * Module Update Response - matches new backend API
 */
export interface UpdateModuleResponse {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  type: "video" | "document";
  order: number;
  duration: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

// Published Course API Types (matching backend specification)
export interface PublishedCourse {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document";
  shortDescription: string;
  thumbnail: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  pricing: {
    type: "paid" | "free";
    amount: number;
    currency: "USD" | "ETH" | "BTC";
  };
  instructor: {
    id: string;
    username: string;
    avatar: string;
  };
  stats: {
    enrollmentCount: number;
    rating: number;
    reviewCount: number;
    duration: number;
    chapterCount: number;
    moduleCount: number;
  };
  metadata: {
    level: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// My Courses API Types (for logged-in user's courses)
export interface MyCourse {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document";
  status: "draft" | "submitted" | "approved" | "rejected" | "published";
  shortDescription?: string;
  thumbnail?: string;
  stats: {
    rating?: number;
    reviewCount: number;
    duration?: number; // for video courses (in seconds)
    totalPages?: number; // for document courses
  };
  price: number;
  tokenToPayWith: string[]; // Array of accepted payment tokens
  affiliatePercentage: number;
  accessDuration: number; // -1 for unlimited
  availableQuantity: number;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
}

export interface GetMyCoursesParams {
  status?: "draft" | "submitted" | "approved" | "rejected" | "published";
  type?: "video" | "document";
  page?: number; // minimum: 1, default: 1
  limit?: number; // minimum: 1, maximum: 50, default: 10
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface MyCoursesResponse {
  courses: MyCourse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: {
    status?: string;
    type?: string;
    sortBy: string;
    sortOrder: string;
  };
}

export interface GetPublishedCoursesParams {
  q?: string; // Search query (max 100 characters)
  type?: "video" | "document";
  level?: "beginner" | "intermediate" | "advanced";
  currency?: "USD" | "ETH" | "BTC";
  minPrice?: number;
  maxPrice?: number;
  instructor?: string; // MongoDB ObjectId
  sortBy?:
    | "createdAt"
    | "title"
    | "price"
    | "averageRating"
    | "enrollmentCount";
  sortOrder?: "asc" | "desc";
  page?: number; // minimum: 1, default: 1
  limit?: number; // minimum: 1, maximum: 50, default: 20
}

export interface PublishedCoursesResponse {
  courses: PublishedCourse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  filters: {
    q?: string;
    type?: string;
    level?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  type: "video" | "document";
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  price: number;
  currency: string;
  rating: number;
  totalRatings: number;
  image: string;
  category: string;
  author: string;
  createdAt: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "published";
  isPurchased?: boolean;
  purchaseDate?: string;
  accessLevel?: "preview" | "full";
  topics?: string[];
}

/**
 * Token Management Utilities
 */
// export const TokenManager = {
//   getAccessToken: (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("kenesis_access_token");
//   },

//   getRefreshToken: (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("kenesis_refresh_token");
//   },

//   setTokens: (tokens: AuthTokens): void => {
//     if (typeof window === "undefined") return;
//     localStorage.setItem("kenesis_access_token", tokens.accessToken);
//     localStorage.setItem("kenesis_refresh_token", tokens.refreshToken);
//   },

//   clearTokens: (): void => {
//     if (typeof window === "undefined") return;
//     localStorage.removeItem("kenesis_access_token");
//     localStorage.removeItem("kenesis_refresh_token");
//   },

//   hasTokens: (): boolean => {
//     return !!(TokenManager.getAccessToken() && TokenManager.getRefreshToken());
//   },
// };

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
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Response is not JSON - probably HTML error page
        const text = await response.text();
        console.error(
          `Non-JSON Response [${response.status}]:`,
          text.substring(0, 200)
        );
        return {
          success: false,
          message: `Server error (${response.status}). Please check if the API is running correctly.`,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting (429) specifically
        if (response.status === 429) {
          console.warn(`Rate Limited [${response.status}]:`, data);
          return {
            success: false,
            message:
              data.message ||
              "Too many requests. Please wait a moment and try again.",
            errors: data.errors,
            retryAfter: data.retryAfter || 60, // Default to 60 seconds if not provided
          };
        }

        console.error(`API Error [${response.status}]:`, data);
        return {
          success: false,
          message: data.message || "Request failed",
          errors: data.errors,
          retryAfter: data.retryAfter,
        };
      }

      console.log(
        `✅ API Success [${response.status}]:`,
        data.message || "Request successful"
      );
      console.log("📊 Response data:", data.data || data);
      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
    } catch (error) {
      console.error("API Response Parse Error:", error);
      return {
        success: false,
        message:
          "Failed to parse server response. Please check your network connection.",
      };
    }
  }

  async post<T>(endpoint: string, payload?: unknown): Promise<ApiResponse<T>> {
    try {
      console.log(`🚀 Making POST request to: ${this.baseURL}${endpoint}`);
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if access token is available
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("🔑 Added Authorization header");
      } else {
        console.log(
          "🔓 No access token found, proceeding without Authorization header"
        );
      }

      console.log(`📡 Final headers:`, headers);
      console.log(`📤 Request body:`, JSON.stringify(payload));

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on ${endpoint}:`, error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      console.log(
        `🚀 Making FormData POST request to: ${this.baseURL}${endpoint}`
      );

      // Don't set Content-Type for FormData - axios handles the boundary.
      console.log("📤 FormData contents:", Array.from(formData.entries()));

      const res = await http.post(`${this.baseURL}${endpoint}`, formData);
      // If backend uses ApiEnvelope shape, normalize it. Otherwise, pass through.
      const data = res.data;
      if (typeof data?.success === "boolean") {
        return data as ApiResponse<T>;
      }
      // Fallback: assume success with data
      return { success: true, data } as ApiResponse<T>;
    } catch (err: any) {
      // Prefer backend-provided error message
      const status = err?.response?.status;
      const data = err?.response?.data;

      console.error(
        `❌ POST FormData ${endpoint} failed:`,
        status,
        data || err
      );

      // More specific error handling based on status code and response
      let message: string;

      if (status === 0 || !status) {
        message = "Network error. Please check your connection and try again.";
      } else if (status === 401) {
        message =
          data?.message || "Authentication required. Please log in again.";
      } else if (status === 403) {
        message =
          data?.message ||
          "Access denied. You don't have permission to perform this action.";
      } else if (status === 404) {
        message = data?.message || "Resource not found.";
      } else if (status === 409) {
        message = data?.message || "Conflict. This resource already exists.";
      } else if (status === 422 || status === 400) {
        // Validation errors - prefer field-specific messages
        if (data?.errors && Array.isArray(data.errors)) {
          message = data.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join(", ");
        } else {
          message =
            data?.message || "Validation error. Please check your input.";
        }
      } else if (status === 429) {
        message =
          data?.message || "Too many requests. Please wait and try again.";
      } else if (status >= 500) {
        message = data?.message || "Server error. Please try again later.";
      } else {
        message = data?.message || `Request failed (${status}).`;
      }

      const errors = data?.errors;
      return {
        success: false,
        message,
        errors,
        retryAfter: data?.retryAfter,
      };
    }
  }

  async put<T>(endpoint: string, payload?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`🚀 Making PUT request to: ${this.baseURL}${endpoint}`);
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if access token is available
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("🔑 Added Authorization header");
      } else {
        console.log(
          "🔓 No access token found, proceeding without Authorization header"
        );
      }

      console.log(`📡 Final headers:`, headers);
      console.log(`📤 Request body:`, JSON.stringify(payload));

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`📥 Response status: ${response.status}`);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on ${endpoint}:`, error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  async putFormData<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      console.log(
        `🚀 Making FormData PUT request to: ${this.baseURL}${endpoint}`
      );

      // Build headers (don't set Content-Type for FormData - browser will set it with boundary)
      const headers: Record<string, string> = {};

      // Add Authorization header if access token is available
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("🔑 Added Authorization header");
      } else {
        console.log(
          "🔓 No access token found, proceeding without Authorization header"
        );
      }

      console.log(`📡 Final headers:`, headers);
      console.log("📤 FormData contents:", Array.from(formData.entries()));

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers,
        body: formData,
      });

      console.log(`📥 Response status: ${response.status}`);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on ${endpoint}:`, error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(`🚀 Making DELETE request to: ${this.baseURL}${endpoint}`);
      const headers: Record<string, string> = {};
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("🔑 Added Authorization header");
      } else {
        console.log(
          "🔓 No access token found, proceeding without Authorization header"
        );
      }
      console.log(`📡 Final headers:`, headers);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers,
      });
      console.log(`📥 Response status: ${response.status}`);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on DELETE ${endpoint}:`, error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(`🚀 Making GET request to: ${this.baseURL}${endpoint}`);
      const headers: Record<string, string> = {};
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("🔑 Added Authorization header");
      } else {
        console.log(
          "🔓 No access token found, proceeding without Authorization header"
        );
      }
      console.log(`📡 Final headers:`, headers);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers,
      });
      console.log(`📥 Response status: ${response.status}`);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Network Error on GET ${endpoint}:`, error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  async getWithQuery<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const fullEndpoint = queryParams.toString()
      ? `${endpoint}?${queryParams}`
      : endpoint;
    return this.get<T>(fullEndpoint);
  }

  /**
   * Update module details with proper type handling
   * Converts FormData to JSON when no files are present to ensure proper typing
   * Filters out unwanted fields and handles type conversions
   */
  async updateModuleWithProperTypes<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      console.log(
        `🚀 Making smart update request to: ${this.baseURL}${endpoint}`
      );

      // Fields to exclude from the update
      const excludedFields = [
        "prerequisites",
        "learningOutcome",
        "learningOutcomes",
        "resource",
        "resources",
        "content",
        "contentTitle",
        "section",
      ];

      // Check if FormData contains any files
      let hasFiles = false;
      const cleanedFormData = new FormData();

      for (const [key, value] of formData.entries()) {
        // Skip excluded fields
        if (
          excludedFields.includes(key) ||
          key.includes("content[") ||
          key.includes("learningObjectives[")
        ) {
          console.log(`🚫 Excluding field: ${key}`);
          continue;
        }

        if (value instanceof File) {
          hasFiles = true;
          cleanedFormData.append(key, value);
        } else {
          // Handle type conversions for FormData
          if (key === "duration" || key === "order") {
            const numValue = parseInt(value as string, 10);
            if (!isNaN(numValue)) {
              cleanedFormData.append(key, numValue.toString());
            }
          } else if (key === "isRequired" || key === "isPreview") {
            // Convert string boolean values
            const boolValue = value === "true";
            cleanedFormData.append(key, boolValue.toString());
          } else {
            cleanedFormData.append(key, value);
          }
        }
      }

      console.log("🧹 Cleaned FormData entries:");
      for (const [key, value] of cleanedFormData.entries()) {
        console.log(
          `  ✅ ${key}: ${
            value instanceof File
              ? `[File: ${value.name}]`
              : `${value} (${typeof value})`
          }`
        );
      }

      if (hasFiles) {
        // Use FormData for file uploads
        console.log("📎 Files detected, using cleaned FormData");
        return this.putFormData<T>(endpoint, cleanedFormData);
      } else {
        // Convert to JSON for better type handling
        console.log(
          "📝 No files detected, converting to JSON for proper types"
        );
        const jsonData: any = {};

        for (const [key, value] of cleanedFormData.entries()) {
          // Handle special type conversions
          if (key === "duration" || key === "order") {
            const numValue = parseInt(value as string, 10);
            if (!isNaN(numValue)) {
              jsonData[key] = numValue;
            }
          } else if (key === "isRequired" || key === "isPreview") {
            jsonData[key] = value === "true";
          } else {
            jsonData[key] = value;
          }
        }

        console.log("🔄 Final JSON data with proper types:");
        Object.entries(jsonData).forEach(([key, value]) => {
          console.log(`  ✅ ${key}: ${value} (${typeof value})`);
        });
        console.log("📤 Sending JSON:", jsonData);
        return this.put<T>(endpoint, jsonData);
      }
    } catch (error) {
      console.error(`Network Error on ${endpoint}:`, error);
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      };
    }
  }

  /**
   * Helper method to set nested properties from form notation like content[text] or learningObjectives[0]
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split(/[\[\]]+/).filter(Boolean);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];

      if (!current[key]) {
        // Create array if next key is numeric, object otherwise
        current[key] = /^\d+$/.test(nextKey) ? [] : {};
      }
      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
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
  register: async (
    data: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>("/api/auth/register", data);
  },

  /**
   * Login user
   * POST /api/auth/login
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>("/api/auth/login", data);
  },

  /**
   * Logout user
   * POST /api/auth/logout
   * Requires Authorization header with access token
   */
  logout: async (): Promise<ApiResponse> => {
    return apiClient.post("/api/auth/logout", {});
  },

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    return apiClient.post("/api/auth/verify-email", { token });
  },

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  resendVerification: async (email: string): Promise<ApiResponse> => {
    return apiClient.post("/api/auth/resend-verification", { email });
  },

  /**
   * Refresh tokens
   * POST /api/auth/refresh-token
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> => {
    return apiClient.post<RefreshTokenResponse>(
      "/api/auth/refresh-token",
      data
    );
  },

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiClient.post("/api/auth/forgot-password", { email });
  },

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    return apiClient.post("/api/auth/reset-password", { token, newPassword });
  },

  // Wallet Authentication Endpoints moved to modular client at src/lib/api/walletAuth.ts
};

/**
 * Course Management API
 * Following backend specifications exactly
 */
export const CourseAPI = {
  /**
   * Create new course
   * POST /api/courses
   * Requires multipart/form-data and Authorization header
   * Following exact API specification
   */
  createCourse: async (
    courseData: FormData
  ): Promise<
    ApiResponse<{
      course: {
        id: string;
        title: string;
        slug: string;
        status: string;
        createdAt: string;
      };
      uploadStats?: {
        thumbnailUploaded: boolean;
        previewVideoUploaded: boolean;
      };
    }>
  > => {
    return apiClient.postFormData("/api/courses", courseData);
  },

  /**
   * Create chapter for a course
   * POST /api/courses/{courseId}/chapters
   * Requires Authorization header
   */
  createChapter: async (
    courseId: string,
    chapterData: { title: string; description: string; order?: number }
  ): Promise<
    ApiResponse<{
      id: string;
      courseId: string;
      title: string;
      description: string;
      status: string;
      order: number;
      moduleCount: number;
      totalDuration: number;
      createdAt: string;
      updatedAt: string;
    }>
  > => {
    return apiClient.post(`/api/courses/${courseId}/chapters`, chapterData);
  },

  /**
   * Create module for a course
   * POST /api/courses/{courseId}/modules
   * Requires multipart/form-data and Authorization header
   */
  createModule: async (
    courseId: string,
    moduleData: FormData
  ): Promise<
    ApiResponse<{
      module: {
        id: string;
        chapterId: string;
        title: string;
        type: string;
        status: string;
        order: number;
        duration?: number;
        isPreview: boolean;
        createdAt: string;
      };
      uploadStats: {
        mainFileUploaded: boolean;
        attachmentsCount: number;
        totalFiles: number;
      };
    }>
  > => {
    return apiClient.postFormData(
      `/api/courses/${courseId}/modules`,
      moduleData
    );
  },

  /**
   * Submit course for admin review
   * POST /api/courses/{courseId}/submit-for-review
   * Requires Authorization header
   */
  submitForReview: async (
    courseId: string,
    message?: string
  ): Promise<ApiResponse> => {
    return apiClient.post(`/api/courses/${courseId}/submit-for-review`, {
      message,
    });
  },

  /**
   * Get published courses (public endpoint)
   * GET /api/courses
   * No authentication required
   * Supports filtering, search, sorting, and pagination
   */
  getPublishedCourses: async (
    params?: GetPublishedCoursesParams
  ): Promise<ApiResponse<PublishedCoursesResponse>> => {
    console.log("Fetching published courses with params:", params);
    return apiClient.getWithQuery("/api/courses", params);
  },

  /**
   * Get my courses (logged-in user's courses)
   * GET /api/courses/my-courses
   * Requires authentication
   * Supports filtering, sorting, and pagination
   */
  getMyCourses: async (
    params?: GetMyCoursesParams
  ): Promise<ApiResponse<MyCoursesResponse>> => {
    console.log("📚 [API] Starting getMyCourses request...");
    console.log("📚 [API] Request params:", JSON.stringify(params, null, 2));
    console.log("📚 [API] API endpoint: /api/courses/my-courses");

    try {
      const response = await http.get("/api/courses/my-courses", {
        params,
      });

      console.log(
        "📚 [API] getMyCourses response received:",
        JSON.stringify(response, null, 2)
      );

      // Handle the response properly - it should be ApiResponse<MyCoursesResponse>
      const apiResponse = response.data as ApiResponse<MyCoursesResponse>;

      if (apiResponse.success) {
        console.log("✅ [API] My courses fetched successfully");
        console.log(
          "✅ [API] Courses data:",
          JSON.stringify(apiResponse.data, null, 2)
        );
      } else {
        console.error(
          "❌ [API] Failed to fetch my courses:",
          apiResponse.message
        );
        console.error(
          "❌ [API] Full error response:",
          JSON.stringify(apiResponse, null, 2)
        );
      }

      return apiResponse;
    } catch (error: any) {
      console.error("❌ [API] Network error in getMyCourses:", error);
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Network error. Please check your connection and try again.",
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Get single course by ID
   * GET /api/courses/{courseId}
   */
  getCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    console.log("📖 [API] Starting getCourse request...");
    console.log("📖 [API] Course ID:", courseId);
    console.log("📖 [API] API endpoint: /api/courses/" + courseId);

    const response = await http.get(`/api/courses/${courseId}`);

    console.log(
      "📖 [API] getCourse response received:",
      JSON.stringify(response, null, 2)
    );

    // Extract the actual API response from axios response.data
    const apiResponse = response.data;

    if (apiResponse.success) {
      console.log("✅ [API] Course fetched successfully");
      console.log(
        "✅ [API] Course data:",
        JSON.stringify(apiResponse.data, null, 2)
      );
    } else {
      console.error("❌ [API] Failed to fetch course:", apiResponse.message);
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(apiResponse, null, 2)
      );
    }

    return apiResponse;
  },

  /**
   * Update course details
   * PUT /api/courses/{courseId}
   * Requires authorization
   */
  updateCourse: async (
    courseId: string,
    courseData: UpdateCourseRequest
  ): Promise<ApiResponse<any>> => {
    console.log("🎓 Updating course:", {
      courseId,
      hasTitle: !!courseData.title,
      hasShortDescription: !!courseData.shortDescription,
      hasDescription: !!courseData.description,
      level: courseData.level,
      language: courseData.language,
      hasMetadata: !!courseData.metadata,
      hasPrice: typeof courseData.price === "number",
      updateFields: Object.keys(courseData),
    });

    const response = await apiClient.put(
      `/api/courses/${courseId}`,
      courseData
    );

    if (response.success) {
      console.log("✅ Course update successful");
    } else {
      console.error("❌ Course update failed:", response.message);
    }

    return response;
  },

  /**
   * Get course chapters with optional modules
   * GET /api/courses/{courseId}/chapters
   */
  getChapters: async (
    courseId: string,
    includeModules: boolean = false
  ): Promise<ApiResponse<any>> => {
    console.log("📚 [API] Starting getChapters request...");
    console.log("📚 [API] Course ID:", courseId);
    console.log("📚 [API] Include modules:", includeModules);
    console.log(
      "📚 [API] API endpoint: /api/courses/" + courseId + "/chapters"
    );

    const response = await apiClient.getWithQuery(
      `/api/courses/${courseId}/chapters`,
      { includeModules }
    );

    console.log(
      "📚 [API] getChapters response received:",
      JSON.stringify(response, null, 2)
    );

    if (response.success) {
      console.log("✅ [API] Chapters fetched successfully");
      console.log(
        "✅ [API] Chapters data:",
        JSON.stringify(response.data, null, 2)
      );
    } else {
      console.error("❌ [API] Failed to fetch chapters:", response.message);
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(response, null, 2)
      );
    }

    return response;
  },

  /**
   * Get single chapter details
   * GET /api/courses/{courseId}/chapters/{chapterId}
   */
  getChapter: async (
    courseId: string,
    chapterId: string
  ): Promise<ApiResponse<any>> => {
    return http.get(`/api/courses/${courseId}/chapters/${chapterId}`);
  },

  /**
   * Update chapter details
   * PUT /api/courses/{courseId}/chapters/{chapterId}
   * Following the API documentation for chapter updates
   */
  updateChapter: async (
    courseId: string,
    chapterId: string,
    chapterData: UpdateChapterRequest
  ): Promise<ApiResponse<UpdateChapterResponse>> => {
    console.log("🚀 Chapter update request:", {
      endpoint: `/api/courses/${courseId}/chapters/${chapterId}`,
      method: "PUT",
      data: chapterData,
    });

    const response = await apiClient.put<UpdateChapterResponse>(
      `/api/courses/${courseId}/chapters/${chapterId}`,
      chapterData
    );

    console.log("📥 Chapter update response:", {
      success: response.success,
      message: response.message,
      hasData: !!response.data,
    });

    return response;
  },

  /**
   * Delete chapter
   * DELETE /api/courses/{courseId}/chapters/{chapterId}
   */
  deleteChapter: async (
    courseId: string,
    chapterId: string
  ): Promise<ApiResponse<any>> => {
    return http.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
  },

  /**
   * Get modules for a specific chapter
   * GET /api/courses/{courseId}/chapters/{chapterId}/modules
   */
  getModulesForChapter: async (
    chapterId: string,
    courseId: string
  ): Promise<
    ApiResponse<{
      modules: {
        id: string;
        title: string;
        description?: string;
        type: string;
        order: number;
        duration: number;
        isPreview: boolean;
      }[];
    }>
  > => {
    console.log("📚 [API] Starting getModulesForChapter request...");
    console.log("📚 [API] Course ID:", courseId);
    console.log("📚 [API] Chapter ID:", chapterId);
    console.log(
      "📚 [API] API endpoint: /api/courses/" +
        courseId +
        "/chapters/" +
        chapterId +
        "/modules"
    );

    const response = await http.get(
      `/api/courses/${courseId}/chapters/${chapterId}/modules`
    );

    console.log(
      "📚 [API] getModulesForChapter response received:",
      JSON.stringify(response, null, 2)
    );

    // Extract the actual API response from axios response.data
    const apiResponse = response.data;

    if (apiResponse.success) {
      console.log("✅ [API] Modules fetched successfully");
      console.log(
        "✅ [API] Modules data:",
        JSON.stringify(apiResponse.data, null, 2)
      );
    } else {
      console.error("❌ [API] Failed to fetch modules:", apiResponse.message);
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(apiResponse, null, 2)
      );
    }

    return apiResponse;
  },

  /**
   * Get course modules (DEPRECATED - backend requires chapterId as URL param)
   * GET /api/courses/{courseId}/modules
   * Supports filtering by chapterId (required), status, and type
   */
  getModules: async (
    courseId: string,
    params: {
      chapterId: string; // Required by backend
      status?: "draft" | "published";
      type?: "video" | "document";
    }
  ): Promise<
    ApiResponse<{
      modules: any[];
      stats: {
        totalModules: number;
        videoModules: number;
        documentModules: number;
        previewModules: number;
        totalDuration: number;
      };
    }>
  > => {
    return apiClient.getWithQuery(`/api/courses/${courseId}/modules`, params);
  },

  /**
   * Get module content
   * GET /api/courses/{courseId}/chapters/{chapterId}/modules/{moduleId}/content
   * Updated to new endpoint format requiring chapterId
   */
  getModuleContent: async (
    courseId: string,
    chapterId: string,
    moduleId: string
  ): Promise<
    ApiResponse<{
      id: string;
      chapterId: string;
      title: string;
      description: string;
      type: "video" | "document";
      order: number;
      duration: number;
      videoUrl?: string;
      attachments?: Array<{
        name: string;
        url: string;
        fileSize: number;
        mimeType: string;
      }>;
      isPreview: boolean;
      metadata?: {
        accessedAt: string;
        hasAccess: boolean;
      };
      createdAt: string;
      updatedAt: string;
    }>
  > => {
    console.log("🎥 [API] Starting getModuleContent request...");
    console.log("🎥 [API] Course ID:", courseId);
    console.log("🎥 [API] Chapter ID:", chapterId);
    console.log("🎥 [API] Module ID:", moduleId);
    console.log(
      "🎥 [API] API endpoint: /api/courses/" +
        courseId +
        "/chapters/" +
        chapterId +
        "/modules/" +
        moduleId +
        "/content"
    );

    const response = await http.get(
      `/api/courses/${courseId}/chapters/${chapterId}/modules/${moduleId}/content`
    );

    console.log(
      "🎥 [API] getModuleContent response received:",
      JSON.stringify(response, null, 2)
    );

    // Extract the actual API response from axios response.data
    const apiResponse = response.data;

    if (apiResponse.success) {
      console.log("✅ [API] Module content fetched successfully");
      console.log(
        "✅ [API] Module content data:",
        JSON.stringify(apiResponse.data, null, 2)
      );
    } else {
      console.error(
        "❌ [API] Failed to fetch module content:",
        apiResponse.message
      );
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(apiResponse, null, 2)
      );
    }

    return apiResponse;
  },

  /**
   * Update module details
   * PUT /api/courses/{courseId}/modules/{moduleId}
   * New endpoint format as per backend API documentation
   */
  updateModule: async (
    courseId: string,
    moduleId: string,
    moduleData: FormData
  ): Promise<ApiResponse<UpdateModuleResponse>> => {
    console.log("🔧 API updateModule called with NEW ENDPOINT:", {
      courseId,
      moduleId,
    });
    console.log(
      "🔧 CourseId type:",
      typeof courseId,
      "ModuleId type:",
      typeof moduleId
    );
    console.log("🔧 FormData entries:", Array.from(moduleData.entries()));

    return apiClient.updateModuleWithProperTypes<UpdateModuleResponse>(
      `/api/courses/${courseId}/modules/${moduleId}`,
      moduleData
    );
  },

  /**
   * Delete module
   * DELETE /api/courses/{courseId}/chapters/{chapterId}/modules/{moduleId}
   */
  deleteModule: async (
    courseId: string,
    chapterId: string,
    moduleId: string
  ): Promise<ApiResponse<any>> => {
    return http.delete(
      `/api/courses/${courseId}/chapters/${chapterId}/modules/${moduleId}`
    );
  },

  /**
   * Delete entire course
   * DELETE /api/courses/{courseId}
   */
  deleteCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    return http.delete(`/api/courses/${courseId}`);
  },

  /**
   * Get course categories
   * GET /api/courses/categories
   */
  getCategories: async (): Promise<
    ApiResponse<Array<{ id: string; name: string; count: number }>>
  > => {
    return http.get("/api/courses/categories");
  },

  /**
   * Get user's purchased courses
   * GET /api/courses/purchases/my-purchases
   */
  getMyPurchases: async (params?: {
    page?: number;
    limit?: number;
    status?: "active" | "expired" | "all";
  }): Promise<ApiResponse<any>> => {
    console.log("🛒 [API] Starting getMyPurchases request...");
    console.log("🛒 [API] Request params:", JSON.stringify(params, null, 2));
    console.log("🛒 [API] API endpoint: /api/courses/purchases/my-purchases");

    const response = await apiClient.getWithQuery(
      "/api/courses/purchases/my-purchases",
      params
    );

    console.log(
      "🛒 [API] getMyPurchases response received:",
      JSON.stringify(response, null, 2)
    );

    if (response.success) {
      console.log("✅ [API] User purchases fetched successfully");
      console.log(
        "✅ [API] Purchases data:",
        JSON.stringify(response.data, null, 2)
      );
    } else {
      console.error("❌ [API] Failed to fetch purchases:", response.message);
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(response, null, 2)
      );
    }

    return response;
  },

  /**
   * Check course access for a specific course
   * GET /api/courses/purchases/access/{courseId}
   */
  checkCourseAccess: async (courseId: string): Promise<ApiResponse<any>> => {
    console.log("🔐 [API] Starting checkCourseAccess request...");
    console.log("🔐 [API] Course ID:", courseId);
    console.log(
      "🔐 [API] API endpoint: /api/courses/purchases/access/" + courseId
    );

    const response = await http.get(
      `/api/courses/purchases/access/${courseId}`
    );

    console.log(
      "🔐 [API] checkCourseAccess response received:",
      JSON.stringify(response, null, 2)
    );

    // Extract the actual API response from axios response.data
    const apiResponse = response.data;

    if (apiResponse.success) {
      console.log("✅ [API] Course access checked successfully");
      console.log(
        "✅ [API] Access data:",
        JSON.stringify(apiResponse.data, null, 2)
      );
    } else {
      console.error(
        "❌ [API] Failed to check course access:",
        apiResponse.message
      );
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(apiResponse, null, 2)
      );
    }

    return apiResponse;
  },
};

/**
 * User API
 * All user-related API calls
 */
export const UserAPI = {
  /**
   * Get current user profile
   * GET /api/users/profile
   * Requires Authorization header
   */
  getProfile: async (): Promise<ApiResponse<{ user: ApiUser }>> => {
    console.log("👤 [API] Starting getProfile request...");
    console.log("👤 [API] API endpoint: /api/users/profile");

    const response = await http.get("/api/users/profile");

    console.log(
      "👤 [API] getProfile response received:",
      JSON.stringify(response, null, 2)
    );

    // Extract the actual API response from axios response.data
    const apiResponse = response.data;

    if (apiResponse.success) {
      console.log("✅ [API] User profile fetched successfully");
      console.log(
        "✅ [API] User data:",
        JSON.stringify(apiResponse.data, null, 2)
      );
    } else {
      console.error(
        "❌ [API] Failed to fetch user profile:",
        apiResponse.message
      );
      console.error(
        "❌ [API] Full error response:",
        JSON.stringify(apiResponse, null, 2)
      );
    }

    return apiResponse;
  },
};

/**
 * Error Formatting Utility
 */
export const formatApiError = (response: ApiResponse): string => {
  if (response.errors && response.errors.length > 0) {
    return response.errors
      .map((err) => `${err.field}: ${err.message}`)
      .join(", ");
  }
  return response.message || "An unexpected error occurred";
};

/**
 * Retry After Formatter
 */
export const formatRetryAfter = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
};

/**
 * Utility function to convert CreateModuleRequest to FormData
 */
// export const createModuleFormData = (moduleData: CreateModuleRequest): FormData => {
//   const formData = new FormData();

//   // Required fields
//   formData.append('chapterId', moduleData.chapterId);
//   formData.append('title', moduleData.title);
//   formData.append('type', moduleData.type);

//   // Optional fields
//   if (moduleData.description) {
//     formData.append('description', moduleData.description);
//   }
//   if (moduleData.order !== undefined) {
//     formData.append('order', moduleData.order.toString());
//   }
//   if (moduleData.duration !== undefined) {
//     formData.append('duration', moduleData.duration.toString());
//   }
//   if (moduleData.isPreview !== undefined) {
//     formData.append('isPreview', moduleData.isPreview.toString());
//   }
//   if (moduleData.mainFile) {
//     formData.append('mainFile', moduleData.mainFile);
//   }
//   if (moduleData.attachments) {
//     moduleData.attachments.forEach((attachment, index) => {
//       formData.append('attachments', attachment);
//     });
//   }

//   return formData;
// };

/**
 * Utility function to convert CreateCourseRequest to FormData
 * Following backend API specifications exactly
 */
export const createCourseFormData = (
  courseData: CreateCourseRequest
): FormData => {
  const formData = new FormData();

  // Required fields
  formData.append("title", courseData.title);
  formData.append("description", courseData.description);
  formData.append("shortDescription", courseData.shortDescription);
  formData.append("type", courseData.type);
  formData.append("level", courseData.level);
  formData.append("language", courseData.language);
  formData.append("price", courseData.price.toString());
  // tokenToPayWith can be provided as a JSON string (legacy) or as an array of strings
  try {
    const parsed = JSON.parse(courseData.tokenToPayWith);
    if (Array.isArray(parsed)) {
      parsed.forEach((t) => formData.append("tokenToPayWith", String(t)));
    } else {
      // Fallback to raw string if not an array
      formData.append("tokenToPayWith", courseData.tokenToPayWith);
    }
  } catch {
    // If it's not JSON, assume already a single token string or comma-separated
    // Prefer splitting by comma into multiple entries if applicable
    const maybeMany = courseData.tokenToPayWith.includes(",")
      ? courseData.tokenToPayWith
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [courseData.tokenToPayWith];
    maybeMany.forEach((t) => formData.append("tokenToPayWith", t));
  }
  formData.append("accessDuration", courseData.accessDuration.toString());
  formData.append(
    "affiliatePercentage",
    courseData.affiliatePercentage.toString()
  );
  formData.append("availableQuantity", courseData.availableQuantity.toString());
  formData.append("thumbnail", courseData.thumbnail);
  formData.append("previewVideo", courseData.previewVideo);

  // Optional fields
  if (courseData.metadata) {
    formData.append("metadata", courseData.metadata);
  }

  return formData;
};

/**
 * Utility function to convert CreateModuleRequest to FormData
 */
export const createModuleFormData = (
  moduleData: CreateModuleRequest
): FormData => {
  const formData = new FormData();

  // Required fields
  formData.append("chapterId", moduleData.chapterId);
  formData.append("title", moduleData.title);
  formData.append("type", moduleData.type);

  // Optional fields
  if (moduleData.description) {
    formData.append("description", moduleData.description);
  }
  if (moduleData.order !== undefined) {
    formData.append("order", moduleData.order.toString());
  }
  if (moduleData.duration !== undefined) {
    formData.append("duration", moduleData.duration.toString());
  }
  if (moduleData.isPreview !== undefined) {
    formData.append("isPreview", moduleData.isPreview.toString());
  }
  if (moduleData.mainFile) {
    formData.append("mainFile", moduleData.mainFile);
  }
  if (moduleData.attachments) {
    moduleData.attachments.forEach((attachment) => {
      formData.append("attachments", attachment);
    });
  }

  return formData;
};
