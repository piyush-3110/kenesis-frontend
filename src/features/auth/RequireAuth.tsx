"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

function RequireAuthInternal({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  React.useEffect(() => {
    if (!isAuthenticated) {
      const next =
        pathname + (search?.toString() ? `?${search.toString()}` : "");
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, pathname, search, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-400">Redirecting to sign in…</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <RequireAuthInternal>{children}</RequireAuthInternal>
    </Suspense>
  );
}
