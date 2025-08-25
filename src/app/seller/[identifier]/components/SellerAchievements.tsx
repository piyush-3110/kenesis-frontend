"use client";

import React from "react";
import { Award, Trophy, Calendar, Info } from "lucide-react";
import { SellerAchievement, AchievementSummary } from "@/types/seller";
import Tooltip from "@/components/ui/Tooltip";

interface SellerAchievementsProps {
  achievements: SellerAchievement[];
  achievementSummary?: AchievementSummary; // From backend if available
}

/**
 * SellerAchievements Component
 * Display seller achievements with badges and descriptions
 */
const SellerAchievements: React.FC<SellerAchievementsProps> = ({
  achievements,
  achievementSummary,
}) => {
  // Achievement Tooltips Configuration
  const achievementTooltips = {
    milestone: {
      title: "Milestone Achievements",
      description:
        "Rewards for reaching notable career or course-creation milestones (first courses, teaching tenure, student reach).",
      examples: [
        "First Course",
        "1000+ Students",
        "Teaching for 1+ Years",
        "5+ Published Courses",
      ],
      howToEarn:
        "Publish courses, grow your student base, and remain active over time to unlock these milestones.",
    },
    quality: {
      title: "Quality Achievements",
      description:
        "Given for consistently high-quality teaching and course production (high per-course ratings, well-structured courses).",
      examples: [
        "Highly Rated Instructor",
        "Excellence Award",
        "Triple Threat (rating+students+courses)",
      ],
      howToEarn:
        "Focus on content depth, student outcomes, and course polish; aim for strong per-course ratings and completeness.",
    },
    sales: {
      title: "Sales Achievements",
      description:
        "Recognizes commercial success measured by revenue or sale-count thresholds.",
      examples: [
        "First Sale",
        "Top Seller",
        "$10,000+ Revenue",
        "$50,000+ Revenue",
      ],
      howToEarn:
        "Promote courses, optimize pricing and landing pages, and keep courses updated to increase conversions and revenue.",
    },
    rating: {
      title: "Rating Achievements",
      description:
        "Awards based on aggregated student feedback and review counts (high average rating and review volume).",
      examples: ["4.5+ Star Rating", "50+ Reviews", "Student Favorite"],
      howToEarn:
        "Deliver excellent student support, iterate on content from feedback, and politely request reviews after students complete modules.",
    },
  };

  const getAchievementTooltip = (type: string) => {
    const tooltip =
      achievementTooltips[type as keyof typeof achievementTooltips];
    if (!tooltip)
      return "Achievement earned through various teaching activities.";

    return (
      <div className="text-left max-w-xs">
        <div className="font-semibold text-white mb-2">{tooltip.title}</div>
        <div className="text-gray-300 mb-2 text-sm">{tooltip.description}</div>
        <div className="text-blue-400 text-xs">
          <strong>Examples:</strong>
          <ul className="mt-1 list-disc list-inside">
            {tooltip.examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "milestone":
        return <Trophy className="w-6 h-6" />;
      case "quality":
        return <Award className="w-6 h-6" />;
      case "sales":
        return <Trophy className="w-6 h-6" />;
      case "rating":
        return <Award className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "milestone":
        return {
          bg: "from-yellow-500/20 to-yellow-600/20",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          icon: "text-yellow-400",
        };
      case "quality":
        return {
          bg: "from-purple-500/20 to-purple-600/20",
          border: "border-purple-500/30",
          text: "text-purple-400",
          icon: "text-purple-400",
        };
      case "sales":
        return {
          bg: "from-green-500/20 to-green-600/20",
          border: "border-green-500/30",
          text: "text-green-400",
          icon: "text-green-400",
        };
      case "rating":
        return {
          bg: "from-blue-500/20 to-blue-600/20",
          border: "border-blue-500/30",
          text: "text-blue-400",
          icon: "text-blue-400",
        };
      default:
        return {
          bg: "from-gray-500/20 to-gray-600/20",
          border: "border-gray-500/30",
          text: "text-gray-400",
          icon: "text-gray-400",
        };
    }
  };

  const sortedAchievements = [...achievements].sort(
    (a, b) =>
      new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime()
  );

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 backdrop-blur-sm border border-gray-600/20">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Achievements</h2>
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm font-medium">
            {achievements.length}
          </span>
        </div>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAchievements.map((achievement, index) => {
              const colors = getAchievementColor(achievement.type);

              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${colors.bg} rounded-xl p-6 border ${colors.border} hover:scale-105 transition-all duration-200`}
                >
                  {/* Achievement Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${colors.icon} flex-shrink-0`}>
                      {getAchievementIcon(achievement.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg mb-1">
                        {achievement.name}
                      </h3>

                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full bg-black/20 text-xs font-medium ${colors.text}`}
                      >
                        {achievement.type}
                      </div>
                    </div>
                  </div>

                  {/* Achievement Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {achievement.description}
                  </p>

                  {/* Achievement Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>Earned {formatDate(achievement.earnedDate)}</span>
                    </div>

                    <div className="flex items-start gap-2 text-gray-400 text-xs">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {achievement.criteria}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Achievements Yet
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              This seller hasn&apos;t earned any achievements yet. Achievements
              are earned through milestones like reaching student counts,
              maintaining high ratings, and quality metrics.
            </p>
          </div>
        )}

        {/* Achievement Categories Summary */}
        {achievements.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-600/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Achievement Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["milestone", "quality", "sales", "rating"].map((type) => {
                // Use backend summary if available, otherwise calculate from achievements
                const count = achievementSummary
                  ? achievementSummary[type] || 0
                  : achievements.filter((a) => a.type.toLowerCase() === type)
                      .length;
                const colors = getAchievementColor(type);

                return (
                  <Tooltip
                    key={type}
                    content={getAchievementTooltip(type)}
                    position="top"
                  >
                    <div
                      className={`bg-gradient-to-br ${colors.bg} rounded-lg p-4 border ${colors.border} text-center cursor-help hover:scale-105 transition-transform duration-200`}
                    >
                      <div
                        className={`${colors.icon} mb-2 flex justify-center`}
                      >
                        {getAchievementIcon(type)}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {count}
                      </div>
                      <div
                        className={`text-sm ${colors.text} capitalize flex items-center justify-center gap-1`}
                      >
                        {type}
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAchievements;
