"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/axios";
import type { ApiEnvelope, User } from "./types";
import { useAuth } from "./AuthProvider";

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await http.get<ApiEnvelope<{ user: User }>>(
        "/api/users/profile"
      );
      const data = res.data;
      if (!data.success) throw new Error(data.message);
      return data.data!.user;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
