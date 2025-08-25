"use client";

import React, { useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useProfileStore } from "./store/useProfileStore";
import StatCard from "./components/StatCard";
import InstructorCard from "./components/InstructorCard";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

/**
 * ProfilePage Component
 * Main Profile page within the dashboard
 * Shows instructor info, stats, courses, and about section
 */
const ProfilePage: React.FC = () => {
  const { profile, stats, loading, error, loadProfile, loadStats, resetError } =
    useProfileStore();

  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  // Load initial data - pass user data to avoid duplicate API calls
  useEffect(() => {
    if (currentUser) {
      loadProfile(currentUser); // Pass user data to store
    } else if (!isUserLoading) {
      loadProfile(); // Fallback if no user data
    }
    loadStats();
  }, [currentUser, isUserLoading, loadProfile, loadStats]);

  // Reset error when component unmounts
  useEffect(() => {
    return () => resetError();
  }, [resetError]);

  if ((loading || isUserLoading) && !currentUser) {
    return (
      <DashboardLayout
        title="Profile"
        subtitle="Manage your profile and track your teaching performance"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg">Loading profile...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Profile"
        subtitle="Manage your profile and track your teaching performance"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your profile and track your teaching performance"
    >
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {/* Page Title with Gradient Underline */}
        {/* <div className="relative">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
            Profile
          </h1>
         
          <div 
            className="absolute bottom-0 left-0 h-[2px] w-full"
            style={{
              background: 'linear-gradient(90deg, #0680FF 0%, #010519 88.45%)'
            }}
          />
        </div> */}

        {/* Instructor Card */}
        {profile && (
          <section>
            <InstructorCard profile={profile} />
          </section>
        )}

        {/* Stats Section */}
        {stats && (
          <section>
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-2">
                Performance Overview
              </h2>
              <p className="text-gray-400 text-sm">
                Track your teaching metrics and student engagement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                subtitle="Students enrolled across all courses"
                icon={<Users size={24} />}
              />

              <StatCard
                title="Total Courses"
                value={stats.totalCourses}
                subtitle="Published and draft courses"
                icon={<BookOpen size={24} />}
              />

              <StatCard
                title="Total Earnings"
                value={`$${stats.totalEarnings.toLocaleString()}`}
                subtitle="Revenue from course sales"
                icon={<DollarSign size={24} />}
              />

              <StatCard
                title="Average Rating"
                value={stats.averageRating.toFixed(1)}
                subtitle={`Based on ${stats.totalReviews.toLocaleString()} reviews`}
                icon={<Star size={24} />}
              />

              <StatCard
                title="Student Reviews"
                value={stats.totalReviews}
                subtitle="Total feedback received"
                icon={<MessageCircle size={24} />}
              />

              <StatCard
                title="Completion Rate"
                value={
                  stats.completionRate == null
                    ? "N/A"
                    : `${stats.completionRate}%`
                }
                subtitle="Students who complete courses"
                icon={<TrendingUp size={24} />}
              />
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
