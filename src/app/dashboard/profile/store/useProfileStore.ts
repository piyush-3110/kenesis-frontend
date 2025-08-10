"use client";

import { create } from "zustand";
import { InstructorProfile, InstructorStats, ProfileStore } from "../types";

const mockStats: InstructorStats = {
  totalStudents: 12847,
  totalCourses: 15,
  totalEarnings: 89420.5,
  averageRating: 4.8,
  totalReviews: 2341,
  completionRate: 87.5,
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  stats: null,
  courses: [],
  loading: false,
  error: null,

  // Load profile data
  loadProfile: async () => {
    set({ loading: true, error: null });

    try {
      // Get real user data from auth store
      const { useAuthStore } = await import("@/store/useAuthStore");
      const authUser = useAuthStore.getState().user;

      if (authUser) {
        // Map auth user to instructor profile
        const profile: InstructorProfile = {
          id: authUser.id,
          username:
            authUser.username || authUser.email?.split("@")[0] || "User",
          avatar: "", // No avatar in API yet
          bio:
            authUser.bio ||
            "Welcome to my profile! I'm excited to share my knowledge and help you learn.",
          createdAt: authUser.createdAt || new Date().toISOString(),
          emailVerified: authUser.emailVerified || false,
          socialMedia: {
            website: "",
            twitter: "",
            linkedin: "",
            instagram: "",
            facebook: "",
          },
        };

        set({
          profile,
          loading: false,
        });
      } else {
        // No user data
        set({
          profile: null,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load profile",
        loading: false,
      });
    }
  },

  // Load stats data
  loadStats: async () => {
    set({ loading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      set({
        stats: mockStats,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load stats",
        loading: false,
      });
    }
  },

  // Load courses data
  loadCourses: async () => {
    set({ loading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      set({
        courses: [],
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load courses",
        loading: false,
      });
    }
  },

  // Update profile
  updateProfile: async (profileUpdate: Partial<InstructorProfile>) => {
    const { profile } = get();
    if (!profile) return false;

    set({ loading: true, error: null });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedProfile = { ...profile, ...profileUpdate };
      set({
        profile: updatedProfile,
        loading: false,
      });

      return true;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
        loading: false,
      });
      return false;
    }
  },

  // Reset error state
  resetError: () => set({ error: null }),
}));
