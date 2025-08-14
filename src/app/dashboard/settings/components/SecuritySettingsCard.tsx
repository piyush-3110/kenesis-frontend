"use client";

import React, { useState } from "react";
import { Shield } from "lucide-react";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { requestPasswordReset } from "../api/settingsApi";
import { useUIStore } from "@/store/useUIStore";
import GradientBox from "./GradientBox";

/**
 * SecuritySettingsCard Component
 * Handles password reset and security settings
 */
const SecuritySettingsCard: React.FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { addToast } = useUIStore();

  const [isResetting, setIsResetting] = useState(false);

  const handleOpenForgotPassword = async () => {
    if (!currentUser?.email) {
      addToast({
        type: "error",
        message:
          "No email address found. Please ensure you have an email associated with your account.",
      });
      return;
    }

    try {
      setIsResetting(true);
      await requestPasswordReset(currentUser.email);

      addToast({
        type: "success",
        message: "Password reset email sent! Please check your inbox.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send password reset email";
      addToast({
        type: "error",
        message: errorMessage,
      });
      console.error("Password reset error:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <GradientBox className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">
            Security Settings
          </h3>
        </div>

        <div className="space-y-6">
          {/* Password Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Password</h4>
            <p className="text-sm text-gray-400">
              Manage your account password and security preferences
            </p>

            <div className="space-y-3">
              <button
                onClick={handleOpenForgotPassword}
                disabled={isResetting || !currentUser?.email}
                className="w-full text-left p-4 bg-[#0A0E27] border border-gray-600 rounded-lg hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {isResetting
                        ? "Sending Reset Email..."
                        : "Reset Password"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {!currentUser?.email
                        ? "Email required for password reset"
                        : "Reset your password via email"}
                    </div>
                  </div>
                  {isResetting ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Account Security Info */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h5 className="text-white font-medium mb-2">Security Tips</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Use a strong, unique password</li>
              <li>• Change your password regularly</li>
              <li>• Never share your password with others</li>
            </ul>
          </div>
        </div>
      </GradientBox>
    </>
  );
};

export default SecuritySettingsCard;
