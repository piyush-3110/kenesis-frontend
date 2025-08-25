"use client";

import React from "react";

/**
 * SellerProfileSkeleton Component
 * Loading state for seller profile page
 */
const SellerProfileSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 mb-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar skeleton */}
            <div className="w-32 h-32 rounded-full bg-gray-600/50 animate-pulse"></div>

            <div className="flex-1">
              {/* Name skeleton */}
              <div className="h-8 bg-gray-600/50 rounded-lg w-64 mb-4 animate-pulse"></div>

              {/* Bio skeleton */}
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-600/50 rounded-lg w-full animate-pulse"></div>
                <div className="h-4 bg-gray-600/50 rounded-lg w-3/4 animate-pulse"></div>
              </div>

              {/* Social links skeleton */}
              <div className="flex gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gray-600/50 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>

              {/* Level and badges skeleton */}
              <div className="flex flex-wrap gap-4">
                <div className="h-8 bg-gray-600/50 rounded-full w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-600/50 rounded-full w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="h-6 bg-gray-600/50 rounded-lg w-3/4 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-600/50 rounded-lg w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Trust Score Skeleton */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 mb-8 backdrop-blur-sm">
          <div className="h-8 bg-gray-600/50 rounded-lg w-48 mb-6 animate-pulse"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-48 h-48 rounded-full bg-gray-600/50 animate-pulse"></div>
            <div className="flex-1 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 bg-gray-600/50 rounded-lg w-32 animate-pulse"></div>
                  <div className="flex-1 h-4 bg-gray-600/50 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Skeleton */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 mb-8 backdrop-blur-sm">
          <div className="h-8 bg-gray-600/50 rounded-lg w-36 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-6">
                <div className="h-32 bg-gray-600/50 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-600/50 rounded-lg w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-600/50 rounded-lg w-full mb-4 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-600/50 rounded-lg w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-600/50 rounded-lg w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Skeleton */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 mb-8 backdrop-blur-sm">
          <div className="h-8 bg-gray-600/50 rounded-lg w-32 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-gray-600/50 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600/50 rounded-lg w-32 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-600/50 rounded-lg w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600/50 rounded-lg w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-600/50 rounded-lg w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Skeleton */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 backdrop-blur-sm">
          <div className="h-8 bg-gray-600/50 rounded-lg w-40 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-6">
                <div className="h-6 bg-gray-600/50 rounded-lg w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-600/50 rounded-lg w-full mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-600/50 rounded-lg w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfileSkeleton;
