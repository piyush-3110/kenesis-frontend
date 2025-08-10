"use client";

import React from "react";
import { 
  Filter, 
  Search, 
  Calendar, 
  SortAsc, 
  SortDesc, 
  FileText, 
  Play,
  RotateCcw
} from "lucide-react";
import type { PendingReviewsFilters } from "../api/approvalsApi";

interface CourseFiltersProps {
  filters: PendingReviewsFilters;
  onFiltersChange: (filters: PendingReviewsFilters) => void;
}

/**
 * Course Filters Component
 * Provides filtering and sorting options for the pending reviews list
 */
const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (updates: Partial<PendingReviewsFilters>) => {
    onFiltersChange({
      ...filters,
      ...updates,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleReset = () => {
    onFiltersChange({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      order: 'desc',
    });
  };

  const hasActiveFilters = filters.type || filters.sortBy !== 'createdAt' || filters.order !== 'desc';

  return (
    <div 
      className="p-6 rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-sm relative overflow-hidden"
      style={{
        borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
      }}
    >
      {/* Background Gradient Effect */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #0680FF 0%, #022ED2 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Filter & Sort
            </h3>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Separator */}
        <div 
          className="h-[1px] w-full mb-6"
          style={{
            background: "linear-gradient(90deg, #0680FF 0%, #010519 88.45%)",
          }}
        />

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Course Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Type
            </label>
            <div className="relative">
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({ 
                  type: e.target.value as 'video' | 'document' | undefined 
                })}
                className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="video">Video Courses</option>
                <option value="document">Document Courses</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {filters.type === 'video' ? (
                  <Play className="w-4 h-4 text-blue-400" />
                ) : filters.type === 'document' ? (
                  <FileText className="w-4 h-4 text-green-400" />
                ) : (
                  <Filter className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort By
            </label>
            <div className="relative">
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange({ 
                  sortBy: e.target.value as 'createdAt' | 'updatedAt' | 'title' 
                })}
                className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
                <option value="title">Course Title</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order
            </label>
            <div className="relative">
              <select
                value={filters.order || 'desc'}
                onChange={(e) => handleFilterChange({ 
                  order: e.target.value as 'asc' | 'desc' 
                })}
                className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {filters.order === 'desc' ? (
                  <SortDesc className="w-4 h-4 text-gray-400" />
                ) : (
                  <SortAsc className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Items Per Page */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Per Page
            </label>
            <select
              value={filters.limit || 10}
              onChange={(e) => handleFilterChange({ 
                limit: parseInt(e.target.value) 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value={5}>5 courses</option>
              <option value={10}>10 courses</option>
              <option value={20}>20 courses</option>
              <option value={50}>50 courses</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-sm text-blue-300 mb-2 font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.type && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  Type: {filters.type}
                </span>
              )}
              {filters.sortBy && filters.sortBy !== 'createdAt' && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  Sort: {filters.sortBy === 'updatedAt' ? 'Last Updated' : 'Course Title'}
                </span>
              )}
              {filters.order && filters.order !== 'desc' && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  Order: {filters.order === 'asc' ? 'Oldest first' : 'Newest first'}
                </span>
              )}
              {filters.limit && filters.limit !== 10 && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  Show: {filters.limit} per page
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-300 mb-3">Quick Filters:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange({ 
                type: 'video',
                sortBy: 'createdAt',
                order: 'desc'
              })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.type === 'video'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Play className="w-3 h-3" />
              Video Courses
            </button>

            <button
              onClick={() => handleFilterChange({ 
                type: 'document',
                sortBy: 'createdAt',
                order: 'desc'
              })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.type === 'document'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <FileText className="w-3 h-3" />
              Document Courses
            </button>

            <button
              onClick={() => handleFilterChange({ 
                sortBy: 'createdAt',
                order: 'desc'
              })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.sortBy === 'createdAt' && filters.order === 'desc'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Newest First
            </button>

            <button
              onClick={() => handleFilterChange({ 
                sortBy: 'createdAt',
                order: 'asc'
              })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.sortBy === 'createdAt' && filters.order === 'asc'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Oldest First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
