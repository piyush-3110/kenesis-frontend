"use client";

import React from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";

export default function DashboardLayoutAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
