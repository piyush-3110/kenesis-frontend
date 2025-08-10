"use client";

import React from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";

export function ProtectedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
