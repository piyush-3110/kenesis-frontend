import { http } from "@/lib/http/axios";
import type { ApiEnvelope } from "../auth/types";
import type {
  CoursesListData,
  CoursesListEnvelope,
  CoursesQuery,
  CourseCategory,
} from "./types";

export const MarketplaceAPI = {
  // GET /api/courses
  listCourses: (params?: CoursesQuery) =>
    http.get<ApiEnvelope<CoursesListData>>("/api/courses", { params }),

  // GET /api/courses/categories
  listCategories: () =>
    http.get<ApiEnvelope<CourseCategory[]>>("/api/courses/categories"),
};

export type { CoursesListEnvelope };
