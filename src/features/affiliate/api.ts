"use client";

import { http } from "@/lib/http/axios";
import type { ApiEnvelope } from "@/features/auth/types";
import type {
  AvailableCoursesQuery,
  AvailableCoursesData,
  AffiliateJoinData,
} from "./types";

export const AffiliateAPI = {
  /**
   * List courses the current user can join as an affiliate
   * GET /api/affiliates/available-courses
   */
  getAvailableCourses: async (params: AvailableCoursesQuery = {}) => {
    return http.get<ApiEnvelope<AvailableCoursesData>>(
      "/api/courses/affiliates/available-courses",
      { params }
    );
  },

  /**
   * Get a single available course by ID (for affiliate view / detail)
   * GET /api/affiliates/available-courses/:courseId
   */
  getAvailableCourse: async (
    courseId: string,
    options?: { purchaseAmount?: number; includeStats?: boolean }
  ) => {
    return http.get<ApiEnvelope<import("./types").AvailableCourseDetail>>(
      `/api/courses/affiliates/available-courses/${courseId}`,
      { params: options }
    );
  },

  /**
   * Join affiliate program for a course
   * POST /api/courses/:courseId/affiliates/join
   */
  joinAffiliate: async (courseId: string) => {
    return http.post<ApiEnvelope<AffiliateJoinData>>(
      `/api/courses/${courseId}/affiliates/join`,
      {}
    );
  },
};
