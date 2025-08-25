"use client";

import { create } from "zustand";
import {
  AffiliationStats,
  AffiliationFilters,
  MyAffiliateCourse,
} from "../types";
import {
  getMyAffiliations,
  getAffiliationStats,
  leaveAffiliateProgram,
} from "../api/affiliationsApi";

interface MyAffiliationsStore {
  // State
  affiliations: MyAffiliateCourse[];
  stats: AffiliationStats | null;
  filters: AffiliationFilters;
  loading: boolean;
  error: string | null;

  // Actions
  loadAffiliations: () => Promise<void>;
  loadStats: () => Promise<void>;
  setFilters: (filters: Partial<AffiliationFilters>) => void;
  leaveProgram: (courseId: string) => Promise<boolean>;
  resetError: () => void;
}

export const useMyAffiliationsStore = create<MyAffiliationsStore>(
  (set, get) => ({
    // Initial state
    affiliations: [],
    stats: null,
    filters: {
      status: "all", // active | paused | all
      sortBy: "joinedAt",
      sortOrder: "desc",
    },
    loading: false,
    error: null,

    // Load affiliations with current filters
    loadAffiliations: async () => {
      set({ loading: true, error: null });

      try {
        const affiliations = await getMyAffiliations();
        set({ affiliations, loading: false });
      } catch (error) {
        console.error("Failed to load affiliations:", error);
        set({
          error: "Failed to load affiliations. Please try again.",
          loading: false,
        });
      }
    },

    // Load statistics
    loadStats: async () => {
      try {
        const stats = await getAffiliationStats();
        set({ stats });
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    },

    // Update filters and reload data
    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));

      // Reload data with new filters
      get().loadAffiliations();
    },

    // Leave affiliate program
    leaveProgram: async (courseId) => {
      try {
        const ok = await leaveAffiliateProgram(courseId);
        if (ok) {
          // Remove or mark as paused locally
          set((state) => ({
            affiliations: state.affiliations.map((a) =>
              a.courseId === courseId ? { ...a, status: "paused" } : a
            ),
          }));
          // Optionally reload stats
          get().loadStats();
        }
        return ok;
      } catch (err) {
        console.error("Failed to leave program:", err);
        set({ error: "Failed to leave program. Please try again." });
        return false;
      }
    },

    // Reset error state
    resetError: () => {
      set({ error: null });
    },
  })
);
