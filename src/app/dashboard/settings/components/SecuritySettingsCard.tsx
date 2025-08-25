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
      
    </>
  );
};

export default SecuritySettingsCard;
