import { http } from "@/lib/http/axios";
import type { ApiEnvelope } from "@/features/auth/types";
import type {
  AffiliationStats,
  MyAffiliateCourse,
  MyAffiliateCourseDetail,
} from "../types";

type MyAffiliatesResponse = {
  affiliateCourses: Array<{
    id: string; // programId
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    courseThumbnail: string;
    commissionPercent: number;
    affiliateCode?: string;
    sales?: number;
    earnings?: number;
    tokenToPayWith?: string[];
    joinedAt: string;
    lastReferralAt?: string;
    isActive: boolean;
    status: "active" | "paused";
  }>;
  total: number;
};

export const getMyAffiliations = async (): Promise<MyAffiliateCourse[]> => {
  const res = await http.get<ApiEnvelope<MyAffiliatesResponse>>(
    "/api/courses/affiliates/my-courses"
  );
  const data = res.data;
  if (!data.success) throw new Error(data.message);
  const list = data.data?.affiliateCourses || [];
  // Map backend shape to UI type
  return list.map((a) => ({
    programId: a.id,
    courseId: a.courseId,
    courseSlug: a.courseSlug,
    title: a.courseTitle,
    imageUrl: a.courseThumbnail,
    commissionPercent: a.commissionPercent,
    status: a.status,
    joinedAt: a.joinedAt,
    sales: a.sales,
    earnings: a.earnings,
    tokenToPayWith: a.tokenToPayWith,
    affiliateCode: a.affiliateCode,
    lastReferralAt: a.lastReferralAt,
    isActive: a.isActive,
  }));
};

export const leaveAffiliateProgram = async (
  courseId: string
): Promise<boolean> => {
  const res = await http.delete<ApiEnvelope>(
    `/api/courses/${courseId}/affiliates/leave`
  );
  const data = res.data;
  if (!data.success) throw new Error(data.message);
  return true;
};

export const getMyAffiliateCourseDetail = async (
  courseId: string,
  options?: { includeStats?: boolean }
): Promise<MyAffiliateCourseDetail> => {
  const res = await http.get<ApiEnvelope<MyAffiliateCourseDetail>>(
    `/api/courses/affiliates/my-courses/${courseId}`,
    { params: options }
  );
  const data = res.data;
  if (!data.success || !data.data) throw new Error(data.message);
  return data.data;
};

// Optional aggregated stats from list (client-side)
export const getAffiliationStats = async (): Promise<AffiliationStats> => {
  const items = await getMyAffiliations();
  const totalAffiliations = items.length;
  const activeAffiliations = items.filter((i) => i.status === "active").length;
  const pausedAffiliations = items.filter((i) => i.status === "paused").length;
  const totalEarnings = items.reduce((sum, i) => sum + (i.earnings || 0), 0);
  const totalSales = items.reduce((sum, i) => sum + (i.sales || 0), 0);
  return {
    totalAffiliations,
    activeAffiliations,
    pausedAffiliations,
    totalEarnings,
    totalSales,
  };
};
