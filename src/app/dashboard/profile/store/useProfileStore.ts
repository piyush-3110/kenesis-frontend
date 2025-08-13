"use client";

import { create } from "zustand";
import type { User } from "@/types/auth";
import type {
  ProfileStore,
  InstructorProfile,
  InstructorStats,
  Course,
} from "../types";
import { UserApi } from "@/lib/api/userApi";

// Note: stats will be fetched from backend via UserApi.getDashboardOverview

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Advanced React Patterns",
    description: "Master advanced React patterns and best practices",
    thumbnail: "/images/course-1.jpg",
    price: 99.99,
    originalPrice: 149.99,
    rating: 4.8,
    reviewCount: 234,
    studentCount: 1247,
    duration: "8h 30m",
    level: "Advanced",
    category: "Web Development",
    tags: ["React", "JavaScript", "Frontend"],
    isPublished: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "2",
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js",
    thumbnail: "/images/course-2.jpg",
    price: 79.99,
    rating: 4.7,
    reviewCount: 156,
    studentCount: 892,
    duration: "6h 45m",
    level: "Intermediate",
    category: "Backend Development",
    tags: ["Node.js", "Express", "API"],
    isPublished: true,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
];

/**
 * Profile Store
 * Manages instructor profile data, stats, and courses
 */
export const useProfileStore = create<ProfileStore>((set, get) => ({
  // State
  profile: null,
  stats: null,
  courses: [],
  loading: false,
  error: null,

  // Actions
  loadProfile: async (user?: User) => {
    try {
      set({ loading: true, error: null });

      if (user) {
        // Map User to InstructorProfile
        const profile: InstructorProfile = {
          id: user.id,
          username: user.username,
          avatar: undefined, // Not available in User type
          bio: user.bio,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified || false,
          email: user.email,
          walletAddress: user.walletAddress || undefined,
          socialMedia: {
            website: undefined,
            twitter: undefined,
            linkedin: undefined,
            facebook: undefined,
            instagram: undefined,
          },
        };

        set({ profile, loading: false });
        return;
      }

      // If no user provided, set error
      throw new Error("No user data provided to load profile");
    } catch (error) {
      console.error("Failed to load profile:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load profile",
        loading: false,
      });
    }
  },

  loadStats: async () => {
    try {
      set({ loading: true, error: null });
      // Fetch dashboard overview from backend
      const res = await UserApi.getDashboardOverview();
      if (!res.data.success || !res.data.data) {
        throw new Error(
          res.data.message || "Failed to fetch dashboard overview"
        );
      }

      const api = res.data;
      const stats: InstructorStats = {
        totalStudents: api.data.totalStudents ?? 0,
        totalCourses: api.data.totalCourses ?? 0,
        totalEarnings: api.data.totalEarnings ?? 0,
        averageRating: api.data.averageRating ?? 0,
        totalReviews: api.data.totalReviews ?? 0,
        completionRate: api.data.completionRate ?? null,
      };

      set({ stats, loading: false });
    } catch (error) {
      console.error("Failed to load stats:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load stats",
        loading: false,
      });
    }
  },

  loadCourses: async () => {
    try {
      set({ loading: true, error: null });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      set({ courses: mockCourses, loading: false });
    } catch (error) {
      console.error("Failed to load courses:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load courses",
        loading: false,
      });
    }
  },

  updateProfile: async (profileData: Partial<InstructorProfile>) => {
    try {
      set({ loading: true, error: null });

      const currentProfile = get().profile;
      if (!currentProfile) {
        throw new Error("No profile loaded");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update profile
      const updatedProfile = { ...currentProfile, ...profileData };
      set({ profile: updatedProfile, loading: false });

      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
        loading: false,
      });
      return false;
    }
  },

  resetError: () => {
    set({ error: null });
  },
}));
