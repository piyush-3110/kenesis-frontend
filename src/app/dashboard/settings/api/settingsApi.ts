/**
 * Settings API Service
 * Handles API calls for user profile updates and settings management
 */

import { http } from "@/lib/http/axios";
import type { ApiEnvelope, User } from "@/features/auth/types";

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

export interface UpdateProfileWithFileRequest {
  username?: string;
  bio?: string;
  avatar?: File;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

export interface UpdateSocialMediaRequest {
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

export interface UpdateProfileResponse {
  user: User;
}

/**
 * Update user profile information (JSON only, no files)
 */
export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  try {
    const response = await http.put<ApiEnvelope<UpdateProfileResponse>>(
      "/api/users/profile",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update profile");
    }

    return response.data.data!;
  } catch (error: unknown) {
    // Enhanced error handling for better UX
    const apiError = error as {
      response?: {
        status?: number;
        data?: { message?: string };
      };
      message?: string;
    };

    if (apiError?.response?.status === 409) {
      throw new Error(
        "Username is already taken. Please choose a different username."
      );
    }
    if (apiError?.response?.status === 400) {
      const errorMsg =
        apiError?.response?.data?.message || "Invalid input data";
      throw new Error(errorMsg);
    }
    if (apiError?.response?.status === 429) {
      throw new Error("Too many updates. Please wait a moment and try again.");
    }
    if (error instanceof Error) {
      if (error.message.includes("network")) {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }
      if (error.message.includes("validation")) {
        throw new Error("Please check your input and try again.");
      }
      throw error;
    }
    throw new Error("Failed to update profile. Please try again.");
  }
};

/**
 * Update social media links only (optimized for social media updates)
 */
export const updateSocialMediaLinks = async (
  data: UpdateSocialMediaRequest
): Promise<UpdateProfileResponse> => {
  try {
    const response = await http.put<ApiEnvelope<UpdateProfileResponse>>(
      "/api/users/profile",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to update social media links"
      );
    }

    return response.data.data!;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("invalid url")) {
        throw new Error("Please enter valid URLs for social media links.");
      }
      if (error.message.includes("rate limit")) {
        throw new Error(
          "Too many updates. Please wait a moment and try again."
        );
      }
      throw error;
    }
    throw new Error("Failed to update social media links. Please try again.");
  }
};

/**
 * Update user profile with file upload using FormData
 */
export const updateUserProfileWithFile = async (
  data: UpdateProfileWithFileRequest
): Promise<UpdateProfileResponse> => {
  try {
    const formData = new FormData();

    if (data.username) formData.append("username", data.username);
    if (data.bio) formData.append("bio", data.bio);
    if (data.avatar) formData.append("avatar", data.avatar);
    if (data.socialMedia)
      formData.append("socialMedia", JSON.stringify(data.socialMedia));

    const response = await http.put<ApiEnvelope<UpdateProfileResponse>>(
      "/api/users/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update profile");
    }

    return response.data.data!;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("file size")) {
        throw new Error(
          "File size too large. Please choose an image under 5MB."
        );
      }
      if (error.message.includes("file type")) {
        throw new Error(
          "Invalid file type. Please upload a JPG, PNG, or GIF image."
        );
      }
      if (error.message.includes("network")) {
        throw new Error(
          "Upload failed due to network issues. Please try again."
        );
      }
      throw error;
    }
    throw new Error("Failed to update profile. Please try again.");
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    const response = await http.post<ApiEnvelope<null>>(
      "/api/auth/forgot-password",
      {
        email,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to send password reset email"
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        throw new Error("No account found with this email address.");
      }
      if (error.message.includes("rate limit")) {
        throw new Error(
          "Too many reset requests. Please wait before trying again."
        );
      }
      throw error;
    }
    throw new Error("Failed to send password reset email. Please try again.");
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    const response = await http.post<ApiEnvelope<null>>(
      "/api/auth/reset-password",
      {
        token,
        newPassword,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to reset password");
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        throw new Error("Reset link has expired. Please request a new one.");
      }
      if (error.message.includes("invalid")) {
        throw new Error("Invalid reset link. Please request a new one.");
      }
      if (error.message.includes("password")) {
        throw new Error("Password must be at least 8 characters long.");
      }
      throw error;
    }
    throw new Error("Failed to reset password. Please try again.");
  }
};
