/**
 * User-related API endpoints
 * Includes dashboard overview for instructors
 */

import { AxiosResponse } from "axios";
import { http } from "../http/axios";

export interface DashboardOverview {
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number | null;
}

export const UserApi = {
  /**
   * GET /api/users/dashboard/overview
   * Requires Bearer token; instructor inferred from JWT
   */
  getDashboardOverview: async (): Promise<
    AxiosResponse<{
      data: DashboardOverview;
      message: string;
      success: boolean;
    }>
  > => {
    const response = http.get<{
      success: boolean;
      message: string;
      data: DashboardOverview;
    }>("/api/users/dashboard/overview");
    return response;
  },
};

export type { ApiResponse } from "./apiTypes";
