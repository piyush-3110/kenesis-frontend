"use client";

import React, { useEffect } from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { Settings as SettingsIcon } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useSettingsStore } from "./store/useSettingsStore";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import ProfileDetailsCard from "./components/ProfileDetailsCard";
import SocialLinksCard from "./components/SocialLinksCard";
import SecuritySettingsCard from "./components/SecuritySettingsCard";
import SaveActions from "./components/SaveActions";

/**
 * SettingsPage Component
 * Main settings page within the dashboard
 * Allows users to edit their profile, notifications, and social links
 */
const SettingsPage: React.FC = () => {
  const { isLoading, error, loadSettings, clearError, updateProfile, updateSocialLinks } = useSettingsStore();
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

  // Debug logging
  console.log('Settings page render:', { 
    isLoading, 
    userLoading, 
    error, 
    userError, 
    currentUser: currentUser ? 'loaded' : 'null' 
  });

  // Load initial data and populate with user data when available
  useEffect(() => {
    loadSettings().catch((err) => {
      console.error('Failed to load settings:', err);
    });
  }, [loadSettings]);

  // Update profile data when user data becomes available
  useEffect(() => {
    if (currentUser && !userLoading) {
      console.log('Updating profile with user data:', currentUser);
      updateProfile({
        displayName: currentUser.username || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || "",
      });

      // Update social links if available
      if (currentUser.socialMedia) {
        updateSocialLinks({
          facebook: currentUser.socialMedia.facebook || "",
          twitter: currentUser.socialMedia.twitter || "",
          instagram: currentUser.socialMedia.instagram || "",
          linkedin: currentUser.socialMedia.linkedin || "",
          website: currentUser.socialMedia.website || "",
        });
      }
    }
  }, [currentUser, userLoading, updateProfile, updateSocialLinks]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Show loading state if either settings or user data is loading
  if (isLoading || userLoading) {
    console.log('Settings page loading state:', { isLoading, userLoading });
    return (
      <RequireAuth>
        <DashboardLayout
          title="Settings"
          subtitle="Manage your account preferences and profile information"
        >
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-400 text-lg">
                  {isLoading ? 'Loading settings...' : 'Loading user data...'}
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  // Handle errors from either settings or user data
  if (error || userError) {
    const displayError = error || (userError instanceof Error ? userError.message : "Failed to load user data");
    
    return (
      <DashboardLayout
        title="Settings"
        subtitle="Manage your account preferences and profile information"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">{displayError}</div>
              <button
                onClick={loadSettings}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RequireAuth>
      <DashboardLayout
        title="Settings"
        subtitle="Manage your account preferences and profile information"
      >
        <div className="p-4 md:p-6 lg:p-8 xl:p-12 min-h-screen">
          <div className="w-full max-w-7xl mx-auto space-y-10 lg:space-y-12">
            {/* Page Title with Gradient Underline */}
            <div className="relative pb-6">
              <div className="flex items-center gap-4 mb-4">
                <SettingsIcon className="w-8 h-8 text-blue-400" />
                <h1
                  className="text-white font-bold"
                  style={{
                    fontFamily: "Inter",
                    fontSize: "32px",
                    fontWeight: 700,
                    lineHeight: "140%",
                  }}
                >
                  Account Settings
                </h1>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Manage your profile information, preferences, and account
                settings
              </p>

              {/* Gradient underline */}
              <div
                className="absolute bottom-0 left-0 h-[3px] w-40"
                style={{
                  background:
                    "linear-gradient(90deg, #0680FF 0%, #010519 88.45%)",
                }}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column - Profile Details */}
              <div className="xl:col-span-8 space-y-8 lg:space-y-10">
                <section>
                  <ProfileDetailsCard />
                </section>

                <section>
                  <SocialLinksCard />
                </section>
              </div>

              {/* Right Column - Settings & Actions */}
              <div className="xl:col-span-4 space-y-8 lg:space-y-10">
                <section>
                  <SecuritySettingsCard />
                </section>

                <section>
                  <SaveActions />
                </section>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
};

export default SettingsPage;
