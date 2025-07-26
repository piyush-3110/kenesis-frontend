'use client';

import React, { useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  MessageCircle, 
  TrendingUp,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useProfileStore } from './store/useProfileStore';
import GradientBox from './components/GradientBox';
import StatCard from './components/StatCard';
import InstructorCard from './components/InstructorCard';
import CourseCard from './components/CourseCard';

/**
 * ProfilePage Component
 * Main Profile page within the dashboard
 * Shows instructor info, stats, courses, and about section
 */
const ProfilePage: React.FC = () => {
  const {
    profile,
    stats,
    courses,
    loading,
    error,
    loadProfile,
    loadStats,
    loadCourses,
    resetError
  } = useProfileStore();

  // Load initial data
  useEffect(() => {
    loadProfile();
    loadStats();
    loadCourses();
  }, [loadProfile, loadStats, loadCourses]);

  // Reset error when component unmounts
  useEffect(() => {
    return () => resetError();
  }, [resetError]);

  if (loading && !profile) {
    return (
      <DashboardLayout
        title="Profile"
        subtitle="Manage your profile and track your teaching performance"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg">Loading profile...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Profile"
        subtitle="Manage your profile and track your teaching performance"
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your profile and track your teaching performance"
    >
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {/* Page Title with Gradient Underline */}
        {/* <div className="relative">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
            Profile
          </h1>
         
          <div 
            className="absolute bottom-0 left-0 h-[2px] w-full"
            style={{
              background: 'linear-gradient(90deg, #0680FF 0%, #010519 88.45%)'
            }}
          />
        </div> */}

        {/* Instructor Card */}
        {profile && (
          <section>
            <InstructorCard profile={profile} />
          </section>
        )}

        {/* Stats Section */}
        {stats && (
          <section>
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-2">
                Performance Overview
              </h2>
              <p className="text-gray-400 text-sm">
                Track your teaching metrics and student engagement
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                subtitle="Students enrolled across all courses"
                icon={<Users size={24} />}
                trend={{
                  direction: 'up',
                  value: '+12.5%'
                }}
              />
              
              <StatCard
                title="Total Courses"
                value={stats.totalCourses}
                subtitle="Published and draft courses"
                icon={<BookOpen size={24} />}
                trend={{
                  direction: 'up',
                  value: '+2 courses'
                }}
              />
              
              <StatCard
                title="Total Earnings"
                value={`$${stats.totalEarnings.toLocaleString()}`}
                subtitle="Revenue from course sales"
                icon={<DollarSign size={24} />}
                trend={{
                  direction: 'up',
                  value: '+18.2%'
                }}
              />
              
              <StatCard
                title="Average Rating"
                value={stats.averageRating.toFixed(1)}
                subtitle={`Based on ${stats.totalReviews.toLocaleString()} reviews`}
                icon={<Star size={24} />}
                trend={{
                  direction: 'up',
                  value: '+0.2 points'
                }}
              />
              
              <StatCard
                title="Student Reviews"
                value={stats.totalReviews}
                subtitle="Total feedback received"
                icon={<MessageCircle size={24} />}
                trend={{
                  direction: 'up',
                  value: '+45 reviews'
                }}
              />
              
              <StatCard
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                subtitle="Students who complete courses"
                icon={<TrendingUp size={24} />}
                trend={{
                  direction: 'up',
                  value: '+3.1%'
                }}
              />
            </div>
          </section>
        )}

        {/* Courses Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-2">
                My Courses
              </h2>
              <p className="text-gray-400 text-sm">
                Manage your published and draft courses
              </p>
            </div>
            
            {/* Course Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              
              {/* Filter */}
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors">
                <Filter size={16} />
                <span className="text-sm">Filter</span>
              </button>
              
              {/* Add Course */}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                <Plus size={16} />
                <span>New Course</span>
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                />
              ))}
            </div>
          ) : (
            <GradientBox>
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400 text-lg mb-2">No courses yet</p>
                <p className="text-gray-500 text-sm mb-6">
                  Create your first course to start teaching
                </p>
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
                  Create Your First Course
                </button>
              </div>
            </GradientBox>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
