"use client";

import React from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";
import DashboardLayout from "../components/DashboardLayout";
import { AchievementContent } from "@/features/learning/components/AchievementContent";

/**
 * My Achievement Page
 * Dashboard page showing user's certificates and achievements
 */
const MyAchievementPage: React.FC = () => {
  return (
    <RequireAuth>
      <DashboardLayout
        title="My Achievements"
        subtitle="View and manage your course completion certificates"
      >
        <div className="p-4 sm:p-6">
          <AchievementContent className="max-w-7xl mx-auto" />
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
};

export default MyAchievementPage;
