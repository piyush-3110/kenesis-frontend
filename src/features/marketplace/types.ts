import type { ApiEnvelope } from "../auth/types";

// Request query params for GET /api/courses
export type CoursesQuery = {
  q?: string;
  type?: "video" | "document";
  level?: "beginner" | "intermediate" | "advanced";
  instructor?: string; // 24-char hex ObjectId
  sortBy?: "createdAt" | "title" | "averageRating" | "price";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  page?: number; // default 1
  limit?: number; // 1–50, default 20
};

// Response item shape according to backend docs
export type InstructorSummary = {
  id: string;
  username?: string;
  avatar?: string;
};

export type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document";
  shortDescription?: string;
  thumbnail?: string;
  isPublished: true;
  instructor: InstructorSummary;
  price: number;
  stats: { rating?: number; reviewCount: number; duration?: number };
  level: string;
  language: string;
  createdAt: string;
  updatedAt: string;
};

export type CoursesPagination = {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
};

export type CoursesFiltersEcho = {
  q?: string;
  type?: "video" | "document";
  level?: "beginner" | "intermediate" | "advanced";
  instructor?: string;
  sortBy?: "createdAt" | "title" | "averageRating" | "price";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
};

export type CoursesListData = {
  courses: CourseSummary[];
  pagination: CoursesPagination;
  filters: CoursesFiltersEcho;
};

export type CoursesListEnvelope = ApiEnvelope<CoursesListData>;

// Categories endpoint type
export type CourseCategory = { id: string; name: string; count: number };
