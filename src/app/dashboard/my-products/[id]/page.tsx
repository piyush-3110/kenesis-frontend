'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Video, FileText, Users, Star, Clock, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import CourseOverviewSection from './components/CourseOverviewSection';
import CourseEditModal from './components/CourseEditModal';
import ChapterManagementSection from './components/ChapterManagementSection';
import ModuleManagementSection from './components/ModuleManagementSection';
import CourseStatsSection from './components/CourseStatsSection';
import SubmitForReviewModal from './components/SubmitForReviewModal';
import { DASHBOARD_COLORS } from '../../constants';

/**
 * Course Management Page
 * Displays detailed course information with edit capabilities
 * Follows the updateable fields specification and backend API documentation
 */
const CourseManagementPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'modules' | 'stats'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Load course data
  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load course details
      const courseResponse = await CourseAPI.getCourse(courseId);
      if (!courseResponse.success) {
        // Handle rate limiting specifically
        if (courseResponse.retryAfter) {
          throw new Error(`Rate limited. Please wait ${courseResponse.retryAfter} seconds and try again.`);
        }
        throw new Error(courseResponse.message);
      }

      console.log('Course API Response:', courseResponse);
      console.log('Course Data:', courseResponse.data);
      
      // Ensure we have the course data and add safety defaults
      const courseData = courseResponse.data?.course || courseResponse.data;
      if (!courseData) {
        throw new Error('No course data received from API');
      }

      // Add default values for critical fields to prevent runtime errors
      const safeCourse = {
        ...courseData,
        status: courseData.status || 'draft',
        type: courseData.type || 'video',
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        level: courseData.level || 'beginner',
        language: courseData.language || 'en',
        price: courseData.price || 0,
        stats: courseData.stats || {
          enrollmentCount: 0,
          rating: 0,
          reviewCount: 0,
          duration: 0,
          chapterCount: 0,
          moduleCount: 0
        }
      };

      console.log('Safe Course Data:', safeCourse);
      setCourse(safeCourse);

      // Load chapters with modules
      const chaptersResponse = await CourseAPI.getChapters(courseId, true);
      if (chaptersResponse.success) {
        setChapters(chaptersResponse.data.chapters || []);
      }

    } catch (err: any) {
      console.error('Failed to load course data:', err);
      setError(err.message || 'Failed to load course data');
      console.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseUpdate = async (updatedData: any) => {
    try {
      const response = await CourseAPI.updateCourse(courseId, updatedData);
      if (response.success) {
        // Ensure we get the updated course data properly
        const updatedCourse = response.data?.course || response.data;
        if (updatedCourse) {
          // Apply same safety defaults as in loadCourseData
          const safeCourse = {
            ...updatedCourse,
            status: updatedCourse.status || 'draft',
            type: updatedCourse.type || 'video',
            title: updatedCourse.title || 'Untitled Course',
            description: updatedCourse.description || '',
            level: updatedCourse.level || 'beginner',
            language: updatedCourse.language || 'en',
            price: updatedCourse.price || 0,
            stats: updatedCourse.stats || course.stats || {
              enrollmentCount: 0,
              rating: 0,
              reviewCount: 0,
              duration: 0,
              chapterCount: 0,
              moduleCount: 0
            }
          };
          setCourse(safeCourse);
          console.log('Course updated successfully');
          setIsEditModalOpen(false);
        } else {
          // If no updated data, just reload
          loadCourseData();
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error('Failed to update course:', err);
      alert(err.message || 'Failed to update course');
    }
  };

  const handleSubmitForReview = async (message?: string) => {
    try {
      const response = await CourseAPI.submitForReview(courseId, message);
      if (response.success) {
        console.log('Course submitted for review successfully');
        loadCourseData(); // Reload to get updated status
        setIsSubmitModalOpen(false);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error('Failed to submit course:', err);
      alert(err.message || 'Failed to submit course');
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await CourseAPI.deleteCourse(courseId);
      if (response.success) {
        console.log('Course deleted successfully');
        router.push('/dashboard/my-products');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      alert(err.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Course Management"
        subtitle="Loading course details..."
      >
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700/50 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-800/50 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700/50 rounded w-1/2"></div>
              <div className="h-6 bg-gray-700/50 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout 
        title="Course Management"
        subtitle="Course not found"
      >
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-4">
              {error || 'Course not found'}
            </div>
            <button
              onClick={() => router.push('/dashboard/my-products')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              Back to My Products
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'chapters', label: 'Chapters', icon: FileText },
    { id: 'modules', label: 'Modules', icon: Video },
    { id: 'stats', label: 'Analytics', icon: Star },
  ];

  const canEdit = (course.status || 'draft') === 'draft' || (course.status || 'draft') === 'rejected';
  const canSubmit = (course.status || 'draft') === 'draft' && chapters.length > 0;

  return (
    <DashboardLayout 
      title={course.title || 'Course Management'}
      subtitle="Manage your course content, chapters, and modules"
    >
      <div className="p-6 space-y-6">
        {/* Course Header Card */}
        <div 
          className="rounded-2xl p-[1px]"
          style={{
            background: DASHBOARD_COLORS.PRIMARY_BORDER,
          }}
        >
          <div 
            className="rounded-2xl p-6"
            style={{
              background: DASHBOARD_COLORS.CARD_BG,
            }}
          >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push('/dashboard/my-products')}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50 flex-shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-2 truncate">
                  {course.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (course.status || 'draft') === 'published' ? 'bg-green-500/20 text-green-400' :
                    (course.status || 'draft') === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                    (course.status || 'draft') === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                    (course.status || 'draft') === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {(course.status || 'draft').charAt(0).toUpperCase() + (course.status || 'draft').slice(1)}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    {(course.type || 'video') === 'video' ? <Video size={16} /> : <FileText size={16} />}
                    <span className="truncate">{(course.type || 'video').charAt(0).toUpperCase() + (course.type || 'video').slice(1)} Course</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              {canEdit && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                >
                  <Edit2 size={16} />
                  <span className="hidden sm:inline">Edit Course</span>
                </button>
              )}
              
              {canSubmit && (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
                >
                  <Save size={16} />
                  <span className="hidden sm:inline">Submit</span>
                </button>
              )}

              {(course.status || 'draft') === 'draft' && (
                <button
                  onClick={handleDeleteCourse}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Gradient Separator */}
        <div 
          className="h-px w-full my-8"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #0680FF 50%, transparent 100%)',
          }}
        />

        {/* Navigation Tabs */}
        <div 
          className="rounded-2xl p-[1px]"
          style={{
            background: DASHBOARD_COLORS.PRIMARY_BORDER,
          }}
        >
          <div 
            className="rounded-2xl p-1"
            style={{
              background: DASHBOARD_COLORS.CARD_BG,
            }}
          >
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium flex-1 justify-center min-w-0 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div>

        {/* Gradient Separator */}
        <div 
          className="h-px w-full my-6"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(6, 128, 255, 0.3) 50%, transparent 100%)',
          }}
        />

        {/* Content Area */}
        <div 
          className="rounded-2xl p-[1px]"
          style={{
            background: DASHBOARD_COLORS.PRIMARY_BORDER,
          }}
        >
          <div 
            className="rounded-2xl p-6 min-h-96"
            style={{
              background: DASHBOARD_COLORS.CARD_BG,
            }}
          >
          {activeTab === 'overview' && (
            <CourseOverviewSection course={course} canEdit={canEdit} />
          )}
          
          {activeTab === 'chapters' && (
            <ChapterManagementSection 
              courseId={courseId}
              chapters={chapters}
              onChaptersChange={setChapters}
              canEdit={canEdit}
            />
          )}
          
          {activeTab === 'modules' && (
            <ModuleManagementSection 
              courseId={courseId}
              chapters={chapters}
              canEdit={canEdit}
            />
          )}
          
          {activeTab === 'stats' && (
            <CourseStatsSection course={course} />
          )}
        </div>
        </div>

        {/* Modals */}
        {isEditModalOpen && (
          <CourseEditModal
            isOpen={isEditModalOpen}
            course={course}
            courseId={courseId}
            onClose={() => setIsEditModalOpen(false)}
            onCourseUpdated={loadCourseData}
          />
        )}

        {isSubmitModalOpen && (
          <SubmitForReviewModal
            onClose={() => setIsSubmitModalOpen(false)}
            onSubmit={handleSubmitForReview}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseManagementPage;
