"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Mail,
  Linkedin,
  Twitter,
  Globe,
  Instagram,
  Facebook,
} from "lucide-react";
import { Seller } from "@/types/seller";
import { truncateWalletAddress } from "../../utils/walletUtils";

interface SellerProfileHeaderProps {
  seller: Seller;
}

/**
 * SellerProfileHeader Component
 * Header section with seller basic info, avatar, bio, social links, and verification status
 */
const SellerProfileHeader: React.FC<SellerProfileHeaderProps> = ({
  seller,
}) => {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "from-green-500 to-green-600";
      case "Intermediate":
        return "from-blue-500 to-blue-600";
      case "Expert":
        return "from-purple-500 to-purple-600";
      case "Master":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayName =
    seller.username ||
    (seller.walletAddress
      ? truncateWalletAddress(seller.walletAddress)
      : "Anonymous Seller");

  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 mb-8 backdrop-blur-sm border border-gray-600/20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {seller.avatar ? (
                  <Image
                    src={seller.avatar}
                    alt={displayName}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Badge */}
            {seller.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-gray-800">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Main Info Section */}
        <div className="flex-1 min-w-0">
          {/* Name and Level */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-white truncate">
              {displayName}
            </h1>

            {/* Level Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getLevelColor(
                seller.level.current
              )} text-white font-medium`}
            >
              <span className="text-lg">{seller.level.badge}</span>
              <span>{seller.level.current}</span>
            </div>
          </div>

          {/* Bio */}
          {seller.bio && (
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {seller.bio}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 mb-6 text-gray-400">
            {seller.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{seller.email}</span>
              </div>
            )}

            {seller.walletAddress && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <span className="text-sm font-mono">
                  {truncateWalletAddress(seller.walletAddress)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Joined {formatJoinDate(seller.joinedDate)}
              </span>
            </div>
          </div>

          {/* Social Media Links */}
          {seller.socialMedia && Object.keys(seller.socialMedia).length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(seller.socialMedia).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                    aria-label={`${platform} profile`}
                  >
                    {getSocialIcon(platform)}
                  </a>
                ) : null
              )}
            </div>
          )}

          {/* Level Progress */}
          {seller.level.nextLevel && seller.level.progress !== undefined && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">
                  Progress to {seller.level.nextLevel}
                </span>
                <span className="text-sm text-gray-300">
                  {seller.level.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(
                    seller.level.nextLevel
                  )} transition-all duration-500`}
                  style={{ width: `${seller.level.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfileHeader;
