"use client";

import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Award,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Timer,
    TrendingUp,
    XCircle,
    Zap,
} from "lucide-react";
import React from "react";
import type { ReviewStatsResponse } from "../api/approvalsApi";

interface ReviewStatsOverviewProps {
    stats: ReviewStatsResponse;
    isLoading: boolean;
}

/**
 * Review Statistics Overview Component
 * Displays comprehensive admin dashboard stats for course approvals
 * Integrates with Get Review Statistics API for real-time insights
 */
const ReviewStatsOverview: React.FC<ReviewStatsOverviewProps> = ({ stats, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Main Stats Loading */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="p-6 rounded-lg border animate-pulse"
                            style={{
                                background: "linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)",
                                borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                            }}
                        >
                            <div className="h-4 bg-gray-700 rounded mb-4"></div>
                            <div className="h-8 bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
                {/* Secondary Stats Loading */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div
                            key={`secondary-${i}`}
                            className="p-6 rounded-lg border animate-pulse"
                            style={{
                                background: "linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)",
                                borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                            }}
                        >
                            <div className="h-4 bg-gray-700 rounded mb-4"></div>
                            <div className="h-6 bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Calculate additional metrics
    const totalReviews = (stats?.overview?.totalApproved || 0) + (stats?.overview?.totalRejected || 0);
    const approvalRate = totalReviews > 0 ? ((stats?.overview?.totalApproved || 0) / totalReviews) * 100 : 0;
    const totalWorkload = (stats?.overview?.totalPending || 0) + (stats?.overview?.totalInReview || 0);
    const avgReviewTime = stats?.averageReviewTimeHours || 0;

    // Determine performance status based on average review time
    const getPerformanceStatus = (hours: number) => {
        if (hours <= 12) return { text: "Excellent", color: "text-green-400", bg: "bg-green-400/10" };
        if (hours <= 24) return { text: "Good", color: "text-blue-400", bg: "bg-blue-400/10" };
        if (hours <= 48) return { text: "Fair", color: "text-yellow-400", bg: "bg-yellow-400/10" };
        return { text: "Needs Attention", color: "text-red-400", bg: "bg-red-400/10" };
    };

    const performanceStatus = getPerformanceStatus(avgReviewTime);

    // Determine priority level based on pending breakdown
    const criticalPending = stats?.pendingBreakdown?.moreThanSevenDays || 0;
    const getPriorityLevel = (critical: number) => {
        if (critical === 0) return { text: "Low", color: "text-green-400", bg: "bg-green-400/10" };
        if (critical <= 3) return { text: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10" };
        return { text: "High", color: "text-red-400", bg: "bg-red-400/10" };
    };

    const priorityLevel = getPriorityLevel(criticalPending);

    const primaryStatCards = [
        {
            id: "pending",
            title: "Pending Reviews",
            value: stats?.overview?.totalPending || 0,
            icon: Clock,
            color: "text-yellow-400",
            bgColor: "bg-yellow-400/10",
            description: "Awaiting initial review",
            trend: totalWorkload > 50 ? "high" : totalWorkload > 20 ? "medium" : "low",
        },
        {
            id: "inReview",
            title: "In Review",
            value: stats?.overview?.totalInReview || 0,
            icon: Eye,
            color: "text-blue-400",
            bgColor: "bg-blue-400/10",
            description: "Currently being reviewed",
            trend: "active",
        },
        {
            id: "approved",
            title: "Total Approved",
            value: stats?.overview?.totalApproved || 0,
            icon: CheckCircle,
            color: "text-green-400",
            bgColor: "bg-green-400/10",
            description: "Successfully approved",
            trend: "success",
        },
        {
            id: "rejected",
            title: "Total Rejected",
            value: stats?.overview?.totalRejected || 0,
            icon: XCircle,
            color: "text-red-400",
            bgColor: "bg-red-400/10",
            description: "Rejected with feedback",
            trend: "caution",
        },
    ];

    const secondaryStatCards = [
        {
            id: "avgTime",
            title: "Avg Review Time",
            value: `${avgReviewTime.toFixed(1)}h`,
            subtitle: performanceStatus.text,
            icon: Timer,
            color: performanceStatus.color,
            bgColor: performanceStatus.bg,
            description: "Average processing time",
        },
        {
            id: "approvalRate",
            title: "Approval Rate",
            value: `${approvalRate.toFixed(1)}%`,
            subtitle: totalReviews > 0 ? `${totalReviews} total reviews` : "No reviews yet",
            icon: Award,
            color: approvalRate >= 80 ? "text-green-400" : approvalRate >= 60 ? "text-yellow-400" : "text-red-400",
            bgColor: approvalRate >= 80 ? "bg-green-400/10" : approvalRate >= 60 ? "bg-yellow-400/10" : "bg-red-400/10",
            description: "Overall approval percentage",
        },
        {
            id: "priority",
            title: "Priority Level",
            value: priorityLevel.text,
            subtitle: criticalPending > 0 ? `${criticalPending} critical pending` : "All pending recent",
            icon: AlertTriangle,
            color: priorityLevel.color,
            bgColor: priorityLevel.bg,
            description: "Based on pending age",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {primaryStatCards.map(stat => {
                    const IconComponent = stat.icon;
                    const getTrendIndicator = (trend: string) => {
                        switch (trend) {
                            case "high":
                                return <AlertTriangle className="w-3 h-3 text-red-400" />;
                            case "medium":
                                return <Activity className="w-3 h-3 text-yellow-400" />;
                            case "low":
                                return <TrendingUp className="w-3 h-3 text-green-400" />;
                            case "active":
                                return <Zap className="w-3 h-3 text-blue-400" />;
                            case "success":
                                return <Award className="w-3 h-3 text-green-400" />;
                            case "caution":
                                return <AlertCircle className="w-3 h-3 text-orange-400" />;
                            default:
                                return null;
                        }
                    };

                    return (
                        <div
                            key={stat.id}
                            className="p-6 rounded-xl border transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                            style={{
                                background:
                                    "linear-gradient(152.97deg, rgba(6,128,255,0.08) 18.75%, rgba(0,0,0,0.4) 100%)",
                                borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                            }}
                        >
                            {/* Background gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bgColor} transition-colors duration-200`}>
                                        <IconComponent className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    {getTrendIndicator(stat.trend)}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                                    <p className="text-white font-bold text-3xl" style={{ fontFamily: "Inter" }}>
                                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                                    </p>
                                    <p className="text-gray-500 text-xs">{stat.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {secondaryStatCards.map(stat => {
                    const IconComponent = stat.icon;
                    return (
                        <div
                            key={stat.id}
                            className="p-6 rounded-xl border transition-all duration-200 hover:shadow-lg"
                            style={{
                                background:
                                    "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.3) 100%)",
                                borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                            }}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <IconComponent className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                                    <p className="text-gray-500 text-xs">{stat.description}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className={`font-bold text-xl ${stat.color}`} style={{ fontFamily: "Inter" }}>
                                    {stat.value}
                                </p>
                                <p className="text-gray-400 text-xs">{stat.subtitle}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Workload Analysis - Pending Breakdown */}
            {stats?.pendingBreakdown && (
                <div
                    className="p-6 rounded-xl border"
                    style={{
                        background: "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.3) 100%)",
                        borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                Workload Analysis
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                                Pending reviews by age - prioritize oldest submissions
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{totalWorkload}</p>
                            <p className="text-gray-400 text-xs">Total Active</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                key: "lessThan24h",
                                label: "< 24 hours",
                                value: stats?.pendingBreakdown?.lessThan24h || 0,
                                color: "text-green-400",
                                bgColor: "bg-green-400/10",
                                priority: "Low",
                            },
                            {
                                key: "oneToThreeDays",
                                label: "1-3 days",
                                value: stats?.pendingBreakdown?.oneToThreeDays || 0,
                                color: "text-yellow-400",
                                bgColor: "bg-yellow-400/10",
                                priority: "Medium",
                            },
                            {
                                key: "threeTosevenDays",
                                label: "3-7 days",
                                value: stats?.pendingBreakdown?.threeTosevenDays || 0,
                                color: "text-orange-400",
                                bgColor: "bg-orange-400/10",
                                priority: "High",
                            },
                            {
                                key: "moreThanSevenDays",
                                label: "> 7 days",
                                value: stats?.pendingBreakdown?.moreThanSevenDays || 0,
                                color: "text-red-400",
                                bgColor: "bg-red-400/10",
                                priority: "Critical",
                            },
                        ].map(item => (
                            <div
                                key={item.key}
                                className={`text-center p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${item.bgColor}`}
                                style={{
                                    borderColor: item.value > 0 ? "rgba(255,255,255,0.1)" : "transparent",
                                }}
                            >
                                <div className={`text-2xl font-bold mb-2 ${item.color}`}>{item.value}</div>
                                <div className="text-gray-400 text-sm mb-1">{item.label}</div>
                                <div
                                    className={`text-xs px-2 py-1 rounded-full inline-block ${item.bgColor} ${item.color}`}
                                >
                                    {item.priority}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Age Distribution</span>
                            <span>{totalWorkload} total pending</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            {totalWorkload > 0 && (
                                <div className="h-full flex">
                                    <div
                                        className="bg-green-400"
                                        style={{
                                            width: `${
                                                ((stats?.pendingBreakdown?.lessThan24h || 0) / totalWorkload) * 100
                                            }%`,
                                        }}
                                    />
                                    <div
                                        className="bg-yellow-400"
                                        style={{
                                            width: `${
                                                ((stats?.pendingBreakdown?.oneToThreeDays || 0) / totalWorkload) * 100
                                            }%`,
                                        }}
                                    />
                                    <div
                                        className="bg-orange-400"
                                        style={{
                                            width: `${
                                                ((stats?.pendingBreakdown?.threeTosevenDays || 0) / totalWorkload) * 100
                                            }%`,
                                        }}
                                    />
                                    <div
                                        className="bg-red-400"
                                        style={{
                                            width: `${
                                                ((stats?.pendingBreakdown?.moreThanSevenDays || 0) / totalWorkload) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity Feed */}
            {stats?.recentActivity && stats.recentActivity.length > 0 && (
                <div
                    className="p-6 rounded-xl border"
                    style={{
                        background: "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.3) 100%)",
                        borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Recent Activity
                        </h3>
                        <div className="text-gray-400 text-sm">Last {stats.recentActivity.length} actions</div>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats.recentActivity.slice(0, 10).map((activity, index) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/30"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`p-2 rounded-lg ${
                                            activity.action === "approved" ? "bg-green-400/10" : "bg-red-400/10"
                                        }`}
                                    >
                                        {activity.action === "approved" ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium line-clamp-1">
                                            {activity.courseTitle}
                                        </p>
                                        <p className="text-gray-400 text-xs flex items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs ${
                                                    activity.action === "approved"
                                                        ? "bg-green-400/20 text-green-400"
                                                        : "bg-red-400/20 text-red-400"
                                                }`}
                                            >
                                                {activity.action.toUpperCase()}
                                            </span>
                                            {/* <span>by {activity.adminEmail.split('@')[0]}</span> */}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400 text-xs flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {activity.daysAgo === 0 ? "Today" : `${activity.daysAgo}d ago`}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {new Date(activity.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alert Banners for Critical Conditions */}
            {criticalPending > 5 && (
                <div className="p-4 rounded-lg bg-red-900/20 border border-red-700/30">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <div>
                            <h4 className="text-red-400 font-medium">Critical Backlog Alert</h4>
                            <p className="text-red-300 text-sm">
                                {criticalPending} courses have been pending for more than 7 days. Immediate attention
                                required.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {avgReviewTime > 48 && (
                <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
                    <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-yellow-400" />
                        <div>
                            <h4 className="text-yellow-400 font-medium">Performance Warning</h4>
                            <p className="text-yellow-300 text-sm">
                                Average review time is {avgReviewTime.toFixed(1)} hours. Consider optimizing the review
                                process.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewStatsOverview;
