import { http } from "@/lib/http/axios";
import type { ApiEnvelope } from "../auth/types";
import type {
  CoursesListData,
  CoursesListEnvelope,
  CoursesQuery,
} from "./types";
import { Category } from "@/types/Product";
import type {
  CourseFilters,
  AvailableCoursesResponse,
} from "@/app/dashboard/affiliate-showcase/types";

export const MarketplaceAPI = {
  // GET /api/courses
  listCourses: (params?: CoursesQuery) =>
    http.get<ApiEnvelope<CoursesListData>>("/api/courses", { params }),

  // GET /api/courses/categories
  listCategories: () =>
    http.get<ApiEnvelope<Category[]>>("/api/courses/categories"),

  // GET /api/courses/affiliates/available-courses
  listAvailableAffiliateCourses: async (params?: CourseFilters) => {
    // Use mock API for development
    try {
      return http.get<ApiEnvelope<AvailableCoursesResponse>>(
        "/api/courses/affiliates/available-courses",
        { params }
      );
    } catch (error) {
      console.error("Mock API failed, falling back to real API:", error);
      // Fallback to real API if mock fails
    }
  },
};

export type { CoursesListEnvelope };
