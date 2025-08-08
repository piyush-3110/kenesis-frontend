'use client';

import React from 'react';
import { Clock, Users, Star, Globe, BookOpen, Calendar, DollarSign } from 'lucide-react';

interface CourseOverviewSectionProps {
  course: any;
  canEdit: boolean;
}

/**
 * Course Overview Section
 * Displays comprehensive course information including metadata, stats, and content details
 */
const CourseOverviewSection: React.FC<CourseOverviewSectionProps> = ({ course, canEdit }) => {
  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thumbnail */}
          <div className="lg:col-span-1">
            <img
              src={course.thumbnail || '/images/landing/product.png'}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          {/* Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
              <p className="text-gray-300 leading-relaxed">{course.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(course.level)}`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {course.language.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {formatPrice(course.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Enrollments</p>
              <p className="text-white text-lg font-semibold">{course.stats?.enrollmentCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Star className="text-yellow-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rating</p>
              <p className="text-white text-lg font-semibold">
                {course.stats?.rating?.toFixed(1) || 'N/A'} ({course.stats?.reviewCount || 0})
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-white text-lg font-semibold">
                {course.stats?.duration ? formatDuration(course.stats.duration) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Content</p>
              <p className="text-white text-lg font-semibold">
                {course.stats?.chapterCount || 0} chapters, {course.stats?.moduleCount || 0} modules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metadata */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Course Information</h3>
          <div className="space-y-4">
            {course.metadata?.requirements && course.metadata.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {course.metadata.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.metadata?.learningOutcomes && course.metadata.learningOutcomes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Learning Outcomes</h4>
                <ul className="space-y-1">
                  {course.metadata.learningOutcomes.map((outcome: string, index: number) => (
                    <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.metadata?.targetAudience && course.metadata.targetAudience.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Target Audience</h4>
                <ul className="space-y-1">
                  {course.metadata.targetAudience.map((audience: string, index: number) => (
                    <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Timeline & Pricing */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Course Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-400" size={16} />
              <div>
                <p className="text-gray-300 text-sm">Created</p>
                <p className="text-white">{formatDate(course.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-green-400" size={16} />
              <div>
                <p className="text-gray-300 text-sm">Last Updated</p>
                <p className="text-white">{formatDate(course.updatedAt)}</p>
              </div>
            </div>

            {course.publishedAt && (
              <div className="flex items-center gap-3">
                <Globe className="text-purple-400" size={16} />
                <div>
                  <p className="text-gray-300 text-sm">Published</p>
                  <p className="text-white">{formatDate(course.publishedAt)}</p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-yellow-400" size={16} />
                <div>
                  <p className="text-gray-300 text-sm">Pricing</p>
                  <p className="text-white text-lg font-semibold">{formatPrice(course.price)}</p>
                </div>
              </div>
              
              {course.tokenToPayWith && course.tokenToPayWith.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-xs">Accepted tokens:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {course.tokenToPayWith.map((token: string) => (
                      <span key={token} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-400">Access Duration</p>
                  <p className="text-white">
                    {course.accessDuration === -1 ? 'Unlimited' : `${course.accessDuration} days`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Available Quantity</p>
                  <p className="text-white">
                    {course.availableQuantity === -1 ? 'Unlimited' : course.availableQuantity}
                  </p>
                </div>
              </div>

              {course.affiliatePercentage > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-sm">
                    Affiliate Commission: <span className="text-white">{course.affiliatePercentage / 100}%</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      {course.status !== 'draft' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Status Information</h3>
          <div className="space-y-3">
            {course.submittedAt && (
              <div className="text-sm">
                <span className="text-gray-400">Submitted for review: </span>
                <span className="text-white">{formatDate(course.submittedAt)}</span>
              </div>
            )}
            
            {course.status === 'rejected' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  This course was rejected. You can edit and resubmit it for review.
                </p>
              </div>
            )}
            
            {course.status === 'submitted' && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  This course is under review. You'll be notified once the review is complete.
                </p>
              </div>
            )}
            
            {course.status === 'approved' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">
                  This course has been approved and will be published soon.
                </p>
              </div>
            )}
            
            {course.status === 'published' && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">
                  This course is live and available for purchase.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOverviewSection;
