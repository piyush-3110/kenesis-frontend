"use client";

import { useQuery } from "@tanstack/react-query";
import { MarketplaceAPI } from "@/features/marketplace/api";
import type { CourseFilters } from "../types";

export const useAffiliateCourses = (filters: CourseFilters) => {
  return useQuery({
    queryKey: ["affiliate-courses", filters],
    queryFn: async () => {
      // Build API parameters
      const params: Record<string, string | number> = {
        page: filters.page || 1,
        limit: filters.limit || 10,
      };

      if (filters.q) params.q = filters.q;
      if (filters.type) params.type = filters.type;
      if (filters.level) params.level = filters.level;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      // Price range
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice !== undefined && filters.maxPrice < 1000) {
        params.maxPrice = filters.maxPrice;
      }

      // Rating range
      if (filters.minRating !== undefined && filters.minRating > 0) {
        params.minRating = filters.minRating;
      }
      if (filters.maxRating !== undefined && filters.maxRating < 5) {
        params.maxRating = filters.maxRating;
      }

      // Commission range
      if (filters.minCommission !== undefined && filters.minCommission > 0) {
        params.minCommission = filters.minCommission;
      }
      if (filters.maxCommission !== undefined && filters.maxCommission < 50) {
        params.maxCommission = filters.maxCommission;
      }

      // Categories
      if (filters.categoryIds) {
        params.categoryIds = filters.categoryIds;
      }

      const response = await MarketplaceAPI.listAvailableAffiliateCourses(
        params
      );

      if (!response?.data?.success || !response?.data?.data) {
        throw new Error(response?.data?.message || "Failed to load courses");
      }

      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAffiliateCategories = () => {
  return useQuery({
    queryKey: ["affiliate-categories"],
    queryFn: async () => {
      const response = await MarketplaceAPI.listCategories();

      if (!response?.data?.success || !response?.data?.data) {
        throw new Error(response?.data?.message || "Failed to load categories");
      }

      return response.data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
