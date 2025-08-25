'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import GradientBox from './GradientBox';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  className?: string;
}

/**
 * CourseCard Component
 * Displays course information with gradient border and proper styling
 */
const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className
}) => {
  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={cn("group", className)}>
      <GradientBox className="h-full transition-transform duration-200 group-hover:scale-[1.02]">
        <div className="p-0 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-48 rounded-t-lg overflow-hidden">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
            
            {/* Status overlay */}
            <div className="absolute top-3 right-3">
              {course.isPublished ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                  <Eye size={12} />
                  <span>Published</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 text-xs font-medium border border-gray-500/30">
                  <EyeOff size={12} />
                  <span>Draft</span>
                </div>
              )}
            </div>

            {/* Discount badge */}
            {course.originalPrice && course.originalPrice > course.price && (
              <div className="absolute top-3 left-3">
                <div className="px-2 py-1 rounded-md bg-red-500 text-white text-xs font-bold">
                  -{Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category and Level */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-xs font-medium uppercase tracking-wide">
                {course.category}
              </span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium border",
                getLevelColor(course.level)
              )}>
                {course.level}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
              {course.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 rounded bg-gray-700/50 text-gray-300 text-xs"
                >
                  {tag}
                </span>
              ))}
              {course.tags.length > 3 && (
                <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 text-xs">
                  +{course.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <Star size={12} className="text-yellow-400" />
                <span>{course.rating}</span>
                <span>({formatNumber(course.reviewCount)})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Users size={12} />
                <span>{formatNumber(course.studentCount)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={12} />
                <span>{course.duration}</span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-white text-lg font-bold">
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-gray-500 text-sm line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>
              
              <Link 
                href={`/dashboard/profile/course/${course.id}`}
                className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </GradientBox>
    </div>
  );
};

export default CourseCard;
