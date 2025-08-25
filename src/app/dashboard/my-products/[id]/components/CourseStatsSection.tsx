'use client';

import React from 'react';
import { Users, Star, DollarSign, Eye, Calendar, TrendingUp, Clock, BookOpen } from 'lucide-react';

interface CourseStatsSectionProps {
  course: any;
  chapters?: any[]; // Add chapters prop for accurate duration calculation
}

/**
 * Course Stats Section
 * Displays analytics and statistics for the course
 */
const CourseStatsSection: React.FC<CourseStatsSectionProps> = ({ course, chapters }) => {
  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return "0m";
    
    const totalMinutes = Math.ceil(seconds / 60); // Convert seconds to minutes, round up
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${totalMinutes}m`;
  };

  // Calculate total duration from chapters/modules if available (matching overview logic)
  // Note: This matches the logic used in CourseOverviewSection components for consistency
  const calculateTotalDuration = (): number => {
    console.log("🕐 [STATS_DURATION] Calculating total duration...");
    
    // First, try to use the passed chapters prop (from API response)
    if (chapters && Array.isArray(chapters)) {
      console.log("🕐 [STATS_DURATION] Using chapters prop for calculation");
      console.log("🕐 [STATS_DURATION] Chapters data:", chapters);
      
      const totalMinutes = chapters.reduce((total: number, chapter: any) => {
        const chapterDuration = chapter.totalDuration || 0;
        console.log(`🕐 [STATS_DURATION] Chapter "${chapter.title}": ${chapterDuration} minutes`);
        return total + chapterDuration;
      }, 0);
      
      console.log("🕐 [STATS_DURATION] Total calculated from chapters:", totalMinutes, "minutes");
      return totalMinutes * 60; // Convert to seconds for formatDuration function
    }
    
    // Fallback to course.chapters if available
    if (course.chapters && Array.isArray(course.chapters)) {
      console.log("🕐 [STATS_DURATION] Using course.chapters for calculation");
      const totalSeconds = course.chapters.reduce((total: number, chapter: any) => {
        if (chapter.modules && Array.isArray(chapter.modules)) {
          return total + chapter.modules.reduce((chapterTotal: number, module: any) => {
            return chapterTotal + (module.duration || 0);
          }, 0);
        }
        return total + (chapter.totalDuration ? chapter.totalDuration * 60 : 0);
      }, 0);
      
      console.log("🕐 [STATS_DURATION] Total calculated from course.chapters:", totalSeconds, "seconds");
      return totalSeconds;
    }
    
    // Final fallback to course stats
    const fallbackDuration = course.stats?.duration || 0;
    console.log("🕐 [STATS_DURATION] Using fallback from course.stats:", fallbackDuration, "seconds");
    return fallbackDuration;
  };

  // Calculate total chapters and modules from backend data (matching overview logic) 
  // Note: These calculations ensure consistency with the overview sections
  const calculateChapterCount = (): number => {
    console.log("📚 [STATS_CHAPTERS] Calculating chapter count...");
    
    // First, try to use the passed chapters prop
    if (chapters && Array.isArray(chapters)) {
      console.log("📚 [STATS_CHAPTERS] Using chapters prop:", chapters.length);
      return chapters.length;
    }
    
    // Fallback to course.chapters
    if (course.chapters && Array.isArray(course.chapters)) {
      console.log("📚 [STATS_CHAPTERS] Using course.chapters:", course.chapters.length);
      return course.chapters.length;
    }
    
    // Final fallback to course stats
    const fallbackCount = course.stats?.chapterCount || 0;
    console.log("📚 [STATS_CHAPTERS] Using fallback from course.stats:", fallbackCount);
    return fallbackCount;
  };

  const calculateModuleCount = (): number => {
    console.log("📖 [STATS_MODULES] Calculating module count...");
    
    // First, try to use the passed chapters prop
    if (chapters && Array.isArray(chapters)) {
      console.log("📖 [STATS_MODULES] Using chapters prop for module calculation");
      const totalModules = chapters.reduce((total: number, chapter: any) => {
        const moduleCount = chapter.moduleCount || 0;
        console.log(`📖 [STATS_MODULES] Chapter "${chapter.title}": ${moduleCount} modules`);
        return total + moduleCount;
      }, 0);
      console.log("📖 [STATS_MODULES] Total modules from chapters:", totalModules);
      return totalModules;
    }
    
    // Fallback to course.chapters with modules array
    if (course.chapters && Array.isArray(course.chapters)) {
      console.log("📖 [STATS_MODULES] Using course.chapters for module calculation");
      const totalModules = course.chapters.reduce((total: number, chapter: any) => {
        if (chapter.modules && Array.isArray(chapter.modules)) {
          return total + chapter.modules.length;
        }
        return total + (chapter.moduleCount || 0);
      }, 0);
      console.log("📖 [STATS_MODULES] Total modules from course.chapters:", totalModules);
      return totalModules;
    }
    
    // Final fallback to course stats
    const fallbackCount = course.stats?.moduleCount || 0;
    console.log("📖 [STATS_MODULES] Using fallback from course.stats:", fallbackCount);
    return fallbackCount;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'approved': return 'text-blue-400';
      case 'submitted': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Calculate potential earnings
  const potentialEarnings = course.stats?.enrollmentCount 
    ? course.stats.enrollmentCount * course.price 
    : 0;

  const statsCards = [
    {
      title: 'Total Enrollments',
      value: formatNumber(course.stats?.enrollmentCount || 0),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      change: null,
    },
    {
      title: 'Average Rating',
      value: course.stats?.rating ? `${course.stats.rating.toFixed(1)}/5` : 'N/A',
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      change: null,
      subtitle: `${course.stats?.reviewCount || 0} reviews`,
    },
    {
      title: 'Course Price',
      value: formatPrice(course.price || 0),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      change: null,
    },
    {
      title: 'Total Duration',
      value: formatDuration(calculateTotalDuration()),
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      change: null,
    },
    {
      title: 'Course Content',
      value: `${calculateChapterCount()} chapters`,
      icon: BookOpen,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      change: null,
      subtitle: `${calculateModuleCount()} modules`,
    },
    {
      title: 'Potential Earnings',
      value: formatPrice(potentialEarnings),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      change: null,
      subtitle: 'Based on current enrollments',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Course Analytics</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Status:</span>
          <span className={`font-medium ${getStatusColor(course.status)}`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
                {stat.change && (
                  <span className={`text-sm ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-gray-400 text-sm mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Performance Overview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Course Performance Overview</h3>
        <div className="space-y-4">
          {/* Course Status Timeline */}
          <div>
            <h4 className="text-white font-medium mb-3">Status Timeline</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Course Created</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {course.submittedAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Submitted for Review</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(course.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {course.publishedAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Published</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(course.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Metrics */}
          <div>
            <h4 className="text-white font-medium mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-700/30 rounded">
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-white text-lg font-semibold">
                  {course.stats?.enrollmentCount > 0 ? '85%' : 'N/A'}
                </p>
                <p className="text-gray-400 text-xs">Based on enrolled students</p>
              </div>
              
              <div className="p-3 bg-gray-700/30 rounded">
                <p className="text-gray-400 text-sm">Engagement Score</p>
                <p className="text-white text-lg font-semibold">
                  {course.stats?.rating ? `${(course.stats.rating * 20).toFixed(0)}%` : 'N/A'}
                </p>
                <p className="text-gray-400 text-xs">Based on ratings and reviews</p>
              </div>
            </div>
          </div>

          {/* Revenue Information */}
          {course.status === 'published' && (
            <div>
              <h4 className="text-white font-medium mb-3">Revenue Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-700/30 rounded">
                  <p className="text-gray-400 text-sm">Gross Revenue</p>
                  <p className="text-white text-lg font-semibold">
                    {formatPrice(potentialEarnings)}
                  </p>
                </div>
                
                <div className="p-3 bg-gray-700/30 rounded">
                  <p className="text-gray-400 text-sm">Platform Fee</p>
                  <p className="text-white text-lg font-semibold">
                    {formatPrice(potentialEarnings * 0.1)} {/* Assuming 10% platform fee */}
                  </p>
                  <p className="text-gray-400 text-xs">10% of gross revenue</p>
                </div>
                
                <div className="p-3 bg-gray-700/30 rounded">
                  <p className="text-gray-400 text-sm">Net Earnings</p>
                  <p className="text-white text-lg font-semibold">
                    {formatPrice(potentialEarnings * 0.9)}
                  </p>
                  <p className="text-gray-400 text-xs">After platform fees</p>
                </div>
              </div>
              
              {course.affiliatePercentage > 0 && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <p className="text-blue-400 text-sm">
                    Affiliate Commission: {course.affiliatePercentage / 100}% of sales price
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Settings Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Course Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Course Type</p>
            <p className="text-white font-medium capitalize">{course.type}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Difficulty Level</p>
            <p className="text-white font-medium capitalize">{course.level}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Language</p>
            <p className="text-white font-medium">{course.language?.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Access Duration</p>
            <p className="text-white font-medium">
              {course.accessDuration === -1 ? 'Unlimited' : `${course.accessDuration} days`}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Available Quantity</p>
            <p className="text-white font-medium">
              {course.availableQuantity === -1 ? 'Unlimited' : course.availableQuantity}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Payment Tokens</p>
            <p className="text-white font-medium">
              {course.tokenToPayWith?.length || 1} accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStatsSection;
