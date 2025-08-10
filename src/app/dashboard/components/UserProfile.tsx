"use client";

import React from "react";
import Image from "next/image";
import { UserProfileProps } from "../types";
import { cn } from "@/lib/utils";
import { ChevronRight, User } from "lucide-react";

/**
 * UserProfile Component
 * Displays user information at the bottom of the sidebar
 */
const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onViewProfile,
  className,
}) => {
  const handleViewProfile = () => {
    onViewProfile?.();
  };

  return (
    <div className={cn("p-4 border-t border-gray-800", className)}>
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <p
            className="text-white font-medium truncate"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16.4px",
              fontWeight: 500,
              lineHeight: "140%",
            }}
          >
            {user.name}
          </p>

          {/* Wallet status */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                user.walletAddress ? "bg-green-500" : "bg-gray-500"
              )}
            />
            <span
              className="text-gray-400 text-sm truncate"
              style={{
                fontFamily: "Rubik, monospace",
                fontSize: "12px",
                fontWeight: 400,
              }}
            >
              {user.walletAddress
                ? `${user.walletAddress.slice(
                    0,
                    6
                  )}...${user.walletAddress.slice(-4)}`
                : "Wallet not linked"}
            </span>
          </div>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        onClick={handleViewProfile}
        className={cn(
          "w-full flex items-center justify-between p-2 rounded-lg",
          "bg-gradient-to-r from-gray-800/50 to-transparent",
          "border border-gray-700/50",
          "hover:from-blue-600/20 hover:border-blue-500/50",
          "transition-all duration-200",
          "group"
        )}
      >
        <span
          className="text-gray-300 group-hover:text-white transition-colors duration-200"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
          }}
        >
          View Profile
        </span>

        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
      </button>
    </div>
  );
};

export default UserProfile;
