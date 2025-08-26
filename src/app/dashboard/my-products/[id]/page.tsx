'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Video, FileText, Users, Star, Clock, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { useToastMessages } from '@/hooks/useToastMessages';
import DashboardLayout from '../../components/DashboardLayout';
import CourseOverviewSection from './components/CourseOverviewSection';
import CourseEditModal from './components/CourseEditModal';
import ChapterManagementSection from './components/ChapterManagementSection';
import { ModuleManagementSection } from './components';
import CourseStatsSection from './components/CourseStatsSection';
import SubmitForReviewModal from './components/SubmitForReviewModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
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
  const { messages, showError } = useToastMessages();

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'modules' | 'stats'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load course data
  useEffect(() => {
    loadCourseData();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log("📚 [COURSE_MANAGEMENT] Loading chapters for course:", courseId);
      const chaptersResponse = await CourseAPI.getChapters(courseId, true);
      console.log("📚 [COURSE_MANAGEMENT] Chapters API response:", JSON.stringify(chaptersResponse, null, 2));
      
      if (chaptersResponse.success) {
        const chapters = chaptersResponse.data.chapters || [];
        console.log("📚 [COURSE_MANAGEMENT] Processed chapters:", chapters);
        console.log("📚 [COURSE_MANAGEMENT] Chapter count:", chapters.length);
        chapters.forEach((chapter: any, index: number) => {
          console.log(`📚 [CHAPTER_${index + 1}] ${chapter.title}: ${chapter.totalDuration || 0} minutes, ${chapter.moduleCount || 0} modules`);
        });
        setChapters(chapters);
      } else {
        console.error("❌ [COURSE_MANAGEMENT] Failed to fetch chapters:", chaptersResponse.message);
        setChapters([]);
      }

    } catch (err: any) {
      console.error('Failed to load course data:', err);
      setError(err.message || 'Network error occurred while loading course data');
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
          messages.courseUpdated();
        } else {
          // If no updated data, just reload
          loadCourseData();
        }
      } else {
        // Use the actual backend error message
        showError(response.message || 'Failed to update course');
      }
    } catch (err: any) {
      console.error('Failed to update course:', err);
      showError(err.message || 'Network error occurred while updating course');
    }
  };

  const handleSubmitForReview = async (message?: string) => {
    setIsSubmitting(true);
    try {
      const response = await CourseAPI.submitForReview(courseId, message);
      if (response.success) {
        console.log('Course submitted for review successfully');
        loadCourseData(); // Reload to get updated status
        setIsSubmitModalOpen(false);
        messages.courseSubmitted();
      } else {
        // Use the actual backend error message
        showError(response.message || 'Failed to submit course for review');
      }
    } catch (err: any) {
      console.error('Failed to submit course:', err);
      showError(err.message || 'Network error occurred while submitting course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const response = await CourseAPI.deleteCourse(courseId);
      if (response.success) {
        console.log('Course deleted successfully');
        messages.courseDeleted();
        router.push('/dashboard/my-products');
      } else {
        // Use the actual backend error message
        showError(response.message || 'Failed to delete course');
      }
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      showError(err.message || 'Network error occurred while deleting course');
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

  const canEdit = (course.status || 'draft') === 'draft';
  const canSubmit = ((course.status || 'draft') === 'draft' ) && chapters.length > 0;
  const canAddContent = canEdit || (course.status || 'draft') === 'published';
  const canDelete = (course.status || 'draft') === 'draft' || (course.status || 'draft') === 'rejected';

  return (
    <DashboardLayout 
      title={course.title || 'Course Management'}
      subtitle="Manage your course content, chapters, and modules"
    >
      <div className="p-6 space-y-6 flex flex-col min-h-[calc(100vh-200px)]">
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  <span className="hidden sm:inline">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
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
          className="rounded-2xl p-[1px] flex-1 min-h-0"
          style={{
            background: DASHBOARD_COLORS.PRIMARY_BORDER,
          }}
        >
          <div 
            className="rounded-2xl p-6 h-full"
            style={{
              background: DASHBOARD_COLORS.CARD_BG,
            }}
          >
          {activeTab === 'overview' && (
            <CourseOverviewSection 
              course={course} 
              canEdit={canEdit} 
              chapters={chapters}
            />
          )}
          
          {activeTab === 'chapters' && (
            <ChapterManagementSection 
              courseId={courseId}
              chapters={chapters}
              onChaptersChange={setChapters}
              canEdit={canEdit}
              canAddContent={canAddContent}
            />
          )}
          
          {activeTab === 'modules' && (
            <ModuleManagementSection 
              courseId={courseId}
              chapters={chapters}
              canEdit={canEdit}
              canAddContent={canAddContent}
            />
          )}
          
          {activeTab === 'stats' && (
            <CourseStatsSection course={course} chapters={chapters} />
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

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteCourse}
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          confirmText="Delete Course"
          type="warning"
          confirmButtonVariant="danger"
        />
      </div>
    </DashboardLayout>
  );
};

export default CourseManagementPage;
