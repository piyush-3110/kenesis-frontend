"use client";

import { useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { MarketplaceAPI } from "./api";
import { coursesQuerySchema } from "./schemas";
import type { CoursesListData, CoursesQuery, CourseSummary } from "./types";
import type { ExtendedProduct } from "@/types/Review";

// Map backend CourseSummary -> UI ExtendedProduct used by ProductCard
export function mapCourseToExtendedProduct(
  course: CourseSummary
): ExtendedProduct {
  const rating =
    typeof course.stats?.rating === "number" ? course.stats.rating : 0;
  const reviewCount = course.stats?.reviewCount ?? 0;
  return {
    id: course.id,
    title: course.title,
    author: course.instructor?.username || "Unknown",
    price: course.price ?? 0,
    currency: "USD",
    rating,
    reviewCount,
    image: course.thumbnail,
    thumbnail: course.thumbnail,
    description: course.shortDescription,
    createdAt: course.createdAt,
    category: undefined,
    type: course.type,
    isPurchased: false,
    reviews: [],
    reviewSummary: {
      averageRating: rating,
      totalReviews: reviewCount,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    purchasedBy: [],
    courseAccess: { hasAccess: false },
    content: [],
    topics: [],
  } as ExtendedProduct;
}

// Build and validate query
export function buildCoursesQuery(params: CoursesQuery): CoursesQuery {
  const parsed = coursesQuerySchema.safeParse(params);
  if (parsed.success) return parsed.data;
  // On validation error, return safe defaults
  return {
    page: Math.max(1, Number(params.page || 1)),
    limit: Math.min(50, Math.max(1, Number(params.limit || 20))),
    q: params.q?.slice(0, 100),
    type: params.type,
    level: params.level,
    instructor: params.instructor,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
    minPrice:
      typeof params.minPrice === "number" && params.minPrice >= 0
        ? params.minPrice
        : undefined,
    maxPrice:
      typeof params.maxPrice === "number" && params.maxPrice >= 0
        ? params.maxPrice
        : undefined,
  };
}

// Simple list query
export function useCoursesList(params: CoursesQuery) {
  const queryParams = useMemo(() => buildCoursesQuery(params), [params]);

  return useQuery({
    queryKey: ["courses:list", queryParams],
    queryFn: async () => {
      const res = await MarketplaceAPI.listCourses(queryParams);
      // Axios returns .data wrapper already
      return res.data as unknown as {
        success: boolean;
        message: string;
        data: CoursesListData;
      };
    },
    select: (envelope) => envelope.data,
    staleTime: 30_000,
  });
}

// Infinite list query
export function useInfiniteCourses(
  params: Omit<CoursesQuery, "page"> & { limit?: number }
) {
  const baseParams = useMemo(
    () => buildCoursesQuery({ ...params, page: 1 }),
    [params]
  );

  return useInfiniteQuery({
    queryKey: ["courses:infinite", baseParams],
    queryFn: async ({ pageParam }) => {
      const res = await MarketplaceAPI.listCourses({
        ...baseParams,
        page: pageParam as number,
      });
      return res.data as unknown as {
        success: boolean;
        message: string;
        data: CoursesListData;
      };
    },
    getNextPageParam: (lastPage) => {
      const p = lastPage.data.pagination;
      return p.hasNextPage ? p.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      const pages = data.pages.map((p) => p.data);
      return {
        pages,
        pageParams: data.pageParams,
        flat: {
          items: pages.flatMap((p) => p.courses),
          pagination: pages[pages.length - 1]?.pagination,
        },
      };
    },
    staleTime: 30_000,
  });
}
