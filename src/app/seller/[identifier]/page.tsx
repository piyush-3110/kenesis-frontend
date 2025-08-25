"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  useSellerProfile,
  useSellerProfileByWallet,
} from "@/hooks/useSellerProfile";
import {
  SellerProfileHeader,
  SellerProfileStats,
  SellerTrustScore,
  SellerCourses,
  SellerReviews,
  SellerAchievements,
  SellerProfileSkeleton,
  SellerProfileError,
} from "./components";
import { isEthereumAddress } from "../utils/walletUtils";

/**
 * SellerProfile Main Component
 * Displays comprehensive seller profile with all sections
 */
const SellerProfile: React.FC = () => {
  const params = useParams();
  const identifier = params.identifier as string;

  // Determine if identifier is a wallet address or username/email
  const isWalletAddress = isEthereumAddress(identifier);

  // Use both hooks and conditionally select the result
  const profileQuery = useSellerProfile(isWalletAddress ? "" : identifier);
  const walletProfileQuery = useSellerProfileByWallet(
    isWalletAddress ? identifier : ""
  );

  // Select the appropriate query result based on identifier type
  const {
    data: profileData,
    isLoading,
    error,
    isError,
  } = isWalletAddress ? walletProfileQuery : profileQuery;

  // Loading state
  if (isLoading) {
    return <SellerProfileSkeleton />;
  }

  // Error state
  if (isError || !profileData?.success) {
    return (
      <SellerProfileError
        error={error}
        identifier={identifier}
        isWalletAddress={isWalletAddress}
      />
    );
  }

  const { seller, stats, courses, reviews, achievements, achievementSummary } =
    profileData.data!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <SellerProfileHeader seller={seller} />

          {/* Stats Section */}
          <SellerProfileStats stats={stats} />

          {/* Trust Score Section */}
          <SellerTrustScore trustScore={seller.trustScore} />

          {/* Courses Section */}
          <SellerCourses courses={courses} />

          {/* Reviews Section */}
          <SellerReviews reviews={reviews} />

          {/* Achievements Section */}
          <SellerAchievements
            achievements={achievements}
            achievementSummary={achievementSummary}
          />
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
