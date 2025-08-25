"use client";

import React from "react";
import { Calendar, Globe, Twitter, Linkedin, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import GradientBox from "./GradientBox";
import AvatarWithBorder from "./AvatarWithBorder";
import { InstructorProfile } from "../types";

interface InstructorCardProps {
  profile: InstructorProfile;
  className?: string;
}

/**
 * InstructorCard Component
 * Displays Profile information with avatar, bio, and social links
 */
const InstructorCard: React.FC<InstructorCardProps> = ({
  profile,
  className,
}) => {
  const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "website":
        return <Globe size={16} />;
      case "twitter":
        return <Twitter size={16} />;
      case "linkedin":
        return <Linkedin size={16} />;
      case "youtube":
        return <Youtube size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getSocialLabel = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <GradientBox className={cn("", className)}>
      <div className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          {/* Avatar */}
          <AvatarWithBorder
            src={profile.avatar || "/images/landing/avatar2.png"}
            alt={
              profile.username ||
              profile.email ||
              profile.walletAddress ||
              "User"
            }
            size="xl"
            verified={profile.emailVerified}
          />

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
              {profile.username}
            </h2>

            {/* Meta info */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Joined {formatJoinDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-3">About</h3>
          <p className="text-gray-300 leading-relaxed">
            {profile.bio || "No bio available"}
          </p>
        </div>

        {/* Social Links */}
        {Object.keys(profile.socialMedia).length > 0 && (
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(profile.socialMedia).map(([platform, url]) => {
                if (!url) return null;

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50"
                  >
                    {getSocialIcon(platform)}
                    <span className="text-sm font-medium">
                      {getSocialLabel(platform)}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GradientBox>
  );
};

export default InstructorCard;
