"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AffiliateAPI } from "./api";
import type {
  AvailableCoursesQuery,
  AvailableCoursesData,
  AffiliateJoinData,
} from "./types";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

export function useAvailableAffiliateCourses(
  params: AvailableCoursesQuery = {}
) {
  return useQuery<AvailableCoursesData, Error>({
    queryKey: ["affiliate", "available-courses", params],
    queryFn: async () => {
      const res = await AffiliateAPI.getAvailableCourses(params);
      const data = res.data;
      if (!data.success) throw new Error(data.message);
      return data.data as AvailableCoursesData;
    },
    staleTime: 30_000,
  });
}

export function useJoinAffiliate(courseId: string) {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: async () => {
      // Ensure wallet address exists before calling backend
      if (!user?.walletAddress) {
        const err = new Error(
          "Please connect your wallet to join affiliate programs."
        );
        // @ts-expect-error custom marker
        err.code = "NO_WALLET";
        throw err;
      }

      const res = await AffiliateAPI.joinAffiliate(courseId);
      const data = res.data;
      if (!data.success) throw new Error(data.message);
      return data.data as AffiliateJoinData;
    },
    onSuccess: () => {
      // Refresh available courses after joining
      qc.invalidateQueries({ queryKey: ["affiliate", "available-courses"] });
    },
  });
}
