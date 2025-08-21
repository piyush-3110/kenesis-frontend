import { http } from "@/lib/http/axios";
import type { ApiEnvelope } from "../auth/types";
import type {
  CoursesListData,
  CoursesListEnvelope,
  CoursesQuery,
} from "./types";
import { Category } from "@/types/Product";

export const MarketplaceAPI = {
  // GET /api/courses
  listCourses: (params?: CoursesQuery) =>
    http.get<ApiEnvelope<CoursesListData>>("/api/courses", { params }),

  // GET /api/courses/categories
  listCategories: () =>
    http.get<ApiEnvelope<Category[]>>("/api/courses/categories"),
};

export type { CoursesListEnvelope };
