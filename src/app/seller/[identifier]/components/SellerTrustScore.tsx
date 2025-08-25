"use client";

import React from "react";
import {
  Shield,
  CheckCircle,
  Mail,
  Wallet,
  BookOpen,
  Heart,
  TrendingUp,
  Eye,
  Info,
} from "lucide-react";
import { TrustScore } from "@/types/seller";
import Tooltip from "@/components/ui/Tooltip";

interface SellerTrustScoreProps {
  trustScore: TrustScore;
}

/**
 * SellerTrustScore Component
 * Trust score visualization with circular progress and breakdown
 */
const SellerTrustScore: React.FC<SellerTrustScoreProps> = ({ trustScore }) => {
  // Trust Score Tooltips Configuration
  const trustScoreTooltips = {
    walletVerified: {
      title: "Wallet Verification",
      description:
        "Confirms the seller's blockchain wallet is connected and verified — used to build trust for web3 payments and identity.",
      maxPoints: 20,
      howToImprove:
        "Connect and verify your crypto wallet in account settings; keep on-chain identity consistent with your profile.",
    },
    courseQuality: {
      title: "Course Quality",
      description:
        "Measures actual course quality using content depth (duration/pages), course completeness (metadata, thumbnails), and per-course ratings.",
      maxPoints: 20,
      howToImprove:
        "Create comprehensive courses (clear syllabus, 1+ hour or substantial content), add thumbnails/descriptions, and improve per-course ratings by iterating on feedback.",
    },
    studentSatisfaction: {
      title: "Student Satisfaction",
      description:
        "Reflects overall student experience across the instructor's courses, primarily driven by average ratings and review sentiment.",
      maxPoints: 20,
      howToImprove:
        "Improve course clarity and support, respond to feedback, update material regularly, and encourage honest reviews from satisfied students (aim for 4.5+).",
    },
    consistency: {
      title: "Publishing Consistency",
      description:
        "Scores how regularly the instructor publishes and maintains courses — combines frequency (courses/month), recent activity, and pace/progression over time.",
      maxPoints: 20,
      howToImprove:
        "Publish on a predictable schedule (small frequent updates help), release new courses or substantial updates regularly, and show recent activity (publish within last 3 months).",
    },
    transparency: {
      title: "Profile Transparency",
      description:
        "Measures how much the instructor discloses about themselves and their teaching (profile picture, bio, contact/social links, and overall profile completeness).",
      maxPoints: 20,
      howToImprove:
        "Complete your profile: add a photo, a helpful bio, public social links or contact info, and ensure courses have clear metadata so students understand who you are.",
    },
  };
  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-blue-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrustScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-400 to-green-500";
    if (score >= 75) return "from-blue-400 to-blue-500";
    if (score >= 60) return "from-yellow-400 to-yellow-500";
    return "from-red-400 to-red-500";
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case "emailVerified":
        return <Mail className="w-5 h-5" />;
      case "walletVerified":
        return <Wallet className="w-5 h-5" />;
      case "courseQuality":
        return <BookOpen className="w-5 h-5" />;
      case "studentSatisfaction":
        return <Heart className="w-5 h-5" />;
      case "consistency":
        return <TrendingUp className="w-5 h-5" />;
      case "transparency":
        return <Eye className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getFactorLabel = (factor: string) => {
    switch (factor) {
      case "emailVerified":
        return "Email Verified";
      case "walletVerified":
        return "Wallet Verified";
      case "courseQuality":
        return "Course Quality";
      case "studentSatisfaction":
        return "Student Satisfaction";
      case "consistency":
        return "Publishing Consistency";
      case "transparency":
        return "Profile Transparency";
      default:
        return factor;
    }
  };

  const getFactorColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 90) return "from-green-400 to-green-500";
    if (percentage >= 75) return "from-blue-400 to-blue-500";
    if (percentage >= 60) return "from-yellow-400 to-yellow-500";
    return "from-red-400 to-red-500";
  };

  const getTrustScoreDescription = (score: number) => {
    if (score >= 95) return "Exceptional seller with outstanding track record";
    if (score >= 90) return "Excellent seller with proven reliability";
    if (score >= 80) return "Very good seller with strong reputation";
    if (score >= 70) return "Good seller with solid performance";
    if (score >= 60) return "Decent seller, room for improvement";
    return "New or developing seller, exercise caution";
  };

  // // Calculate circle properties for SVG
  // const radius = 80;
  // const circumference = 2 * Math.PI * radius;
  // const strokeDasharray = circumference;
  // const strokeDashoffset =
  //   circumference - (trustScore.score / 100) * circumference;

  // const factorEntries = Object.entries(trustScore.factors);

  // Fix trust score scaling based on actual data format
  const getFactorMaxValue = (factor: string, value: number) => {
    switch (factor) {
      case "walletVerified":
      case "courseQuality":
      case "studentSatisfaction":
      case "consistency":
      case "transparency":
        return 20; // Percentage factors (0-100)
      default:
        return Math.max(100, value); // Use the value itself as max if unclear
    }
  };

  const getFactorTooltip = (factor: string) => {
    const tooltip =
      trustScoreTooltips[factor as keyof typeof trustScoreTooltips];
    if (!tooltip)
      return "Trust factor contributing to overall seller reliability score.";

    return (
      <div className="text-left max-w-xs">
        <div className="font-semibold text-white mb-2">{tooltip.title}</div>
        <div className="text-gray-300 mb-2 text-sm">{tooltip.description}</div>
        <div className="text-yellow-400 text-xs mb-1">
          Max Points: {tooltip.maxPoints}
        </div>
        <div className="text-blue-400 text-xs">
          <strong>How to improve:</strong> {tooltip.howToImprove}
        </div>
      </div>
    );
  };

  // Normalize display values for better UX
  const getDisplayValue = (factor: string, value: number, maxValue: number) => {
    switch (factor) {
      case "walletVerified":
        return value ? "✓" : "✗";
      case "courseQuality":
      case "studentSatisfaction":
      case "consistency":
      case "transparency":
        return `${value}/${maxValue}`;
      default:
        return `${value}/${maxValue}`;
    }
  };

  // Calculate circle properties for SVG
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (trustScore.score / 100) * circumference;

  const factorEntries = Object.entries(trustScore.factors);

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 backdrop-blur-sm border border-gray-600/20">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Trust Score</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Circular Progress Chart */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 200 200"
              >
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-600/30"
                />

                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="url(#trustGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient
                    id="trustGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      className={`stop-color-${
                        getTrustScoreGradient(trustScore.score).split("-")[1]
                      }-400`}
                    />
                    <stop
                      offset="100%"
                      className={`stop-color-${
                        getTrustScoreGradient(trustScore.score).split("-")[1]
                      }-500`}
                    />
                  </linearGradient>
                </defs>
              </svg>

              {/* Score Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-4xl font-bold ${getTrustScoreColor(
                    trustScore.score
                  )}`}
                >
                  {trustScore.score}
                </span>
                <span className="text-gray-400 text-sm">Trust Score</span>
              </div>
            </div>

            {/* Trust Level */}
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-white">
                {trustScore.score >= 90 && "Excellent"}
                {trustScore.score >= 75 && trustScore.score < 90 && "Very Good"}
                {trustScore.score >= 60 && trustScore.score < 75 && "Good"}
                {trustScore.score < 60 && "Needs Improvement"}
              </p>
              <p className="text-gray-400 text-sm">Trust Level</p>
            </div>
          </div>

          {/* Trust Factors Breakdown */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-4">
              Trust Factors
            </h3>

            <div className="space-y-4">
              {factorEntries.map(([factor, value]) => {
                const maxValue = getFactorMaxValue(factor, value);
                const displayValue = getDisplayValue(factor, value, maxValue);

                return (
                  <div key={factor} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          {getFactorIcon(factor)}
                        </div>
                        <Tooltip
                          content={getFactorTooltip(factor)}
                          position="top"
                        >
                          <span className="text-gray-300 font-medium cursor-help flex items-center gap-1">
                            {getFactorLabel(factor)}
                            <Info className="w-3 h-3 text-gray-500" />
                          </span>
                        </Tooltip>
                      </div>
                      <span className="text-white font-semibold">
                        {displayValue}
                      </span>
                    </div>

                    <div className="w-full bg-gray-600/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getFactorColor(
                          value,
                          maxValue
                        )} transition-all duration-500`}
                        style={{
                          width: `${Math.min((value / maxValue) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust Score Description */}
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                {getTrustScoreDescription(trustScore.score)}
              </p>
              <p className="text-gray-400 text-xs">
                Trust score is calculated based on verification status, course
                quality, student feedback, publishing consistency, and profile
                completeness. Scores are scaled appropriately for each factor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerTrustScore;
