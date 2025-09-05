"use client";

import React from "react";
import { useRouter } from "next/navigation";
// import { RequireAuth } from "@/features/auth/RequireAuth";
import { Settings as SettingsIcon } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { RequireAuth } from "@/features/auth/RequireAuth";

/**
 * Simple test version to debug settings page loading
 */
const SettingsPageTest: React.FC = () => {
  const router = useRouter();
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

  console.log('SettingsPageTest render:', { 
    userLoading, 
    userError, 
    currentUser: currentUser ? 'loaded' : 'null' 
  });

  if (userLoading) {
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
                <div className="text-gray-400 text-lg">Loading user data...</div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  if (userError) {
    return (
      <RequireAuth>
        <DashboardLayout
          title="Settings"
          subtitle="Manage your account preferences and profile information"
        >
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 text-lg mb-2">
                  Error: {userError instanceof Error ? userError.message : "Failed to load user data"}
                </div>
                <button
                  onClick={() => router.refresh()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
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
                Manage your profile information, preferences, and account settings
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

            {/* Simple User Info Display */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              {currentUser ? (
                <div className="space-y-2">
                  <p><span className="text-gray-400">Username:</span> {currentUser.username || 'N/A'}</p>
                  <p><span className="text-gray-400">Email:</span> {currentUser.email || 'N/A'}</p>
                  <p><span className="text-gray-400">Bio:</span> {currentUser.bio || 'N/A'}</p>
                  <p><span className="text-gray-400">Wallet:</span> {currentUser.walletAddress || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-gray-400">No user data available</p>
              )}
            </div>

            {/* Test Message */}
            <div className="bg-green-800/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400">✅ Settings page is loading successfully!</p>
              <p className="text-sm text-gray-400 mt-1">
                This test version confirms the basic page structure works.
              </p>
            </div>

          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
};

export default SettingsPageTest;
