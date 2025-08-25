"use client";

import React from "react";
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  ShoppingCart,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { SellerStats } from "@/types/seller";

interface SellerProfileStatsProps {
  stats: SellerStats;
}

/**
 * SellerProfileStats Component
 * Stats grid showing seller performance metrics
 */
const SellerProfileStats: React.FC<SellerProfileStatsProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const statsData = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: "Total Courses",
      value: stats.totalCourses,
      displayValue: formatNumber(stats.totalCourses),
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/20 to-blue-600/20",
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: "Published",
      value: stats.publishedCourses,
      displayValue: formatNumber(stats.publishedCourses),
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/20 to-green-600/20",
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Total Students",
      value: stats.totalStudents,
      displayValue: formatNumber(stats.totalStudents),
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/20 to-purple-600/20",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: "Total Earnings",
      value: stats.totalEarnings,
      displayValue: stats.summary.formattedEarnings,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-500/20 to-yellow-600/20",
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: "Average Rating",
      value: stats.averageRating,
      displayValue: formatRating(stats.averageRating),
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/20 to-orange-600/20",
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      label: "Total Sales",
      value: stats.totalSales,
      displayValue: formatNumber(stats.totalSales),
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-500/20 to-indigo-600/20",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Avg Order Value",
      value: stats.averageOrderValue,
      displayValue: formatCurrency(stats.averageOrderValue),
      color: "from-teal-500 to-teal-600",
      bgColor: "from-teal-500/20 to-teal-600/20",
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: "Total Reviews",
      value: stats.totalReviews,
      displayValue: formatNumber(stats.totalReviews),
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-500/20 to-pink-600/20",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Performance Stats</h2>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-6 backdrop-blur-sm border border-gray-600/20 hover:border-gray-500/30 transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-lg bg-gradient-to-r ${stat.bgColor}`}
              >
                <div
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-white text-2xl font-bold">
                {stat.displayValue}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-6 backdrop-blur-sm border border-gray-600/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {stats.summary.coursesPerMonth.toFixed(1)}
            </p>
            <p className="text-gray-400 text-sm">Courses per Month</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {formatNumber(stats.summary.studentsPerCourse)}
            </p>
            <p className="text-gray-400 text-sm">Students per Course</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {formatCurrency(stats.summary.averageEarningsPerStudent)}
            </p>
            <p className="text-gray-400 text-sm">Earnings per Student</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfileStats;
