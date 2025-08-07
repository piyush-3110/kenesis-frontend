import React from "react";
import {
  Clock,
  Users,
  Target,
  CheckCircle,
  BookOpen,
  User,
} from "lucide-react";

interface CourseMetadata {
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  level: string;
  tags: string[];
}

interface CourseDetailsProps {
  availableQuantity?: number;
  accessDuration?: number;
  metadata?: CourseMetadata;
  soldCount?: number;
  className?: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({
  availableQuantity = -1,
  accessDuration = -1,
  metadata,
  soldCount = 0,
  className = "",
}) => {
  const formatDuration = (duration: number) => {
    if (duration === -1) return "Lifetime Access";
    if (duration < 30) return `${duration} days`;
    if (duration < 365) return `${Math.floor(duration / 30)} months`;
    return `${Math.floor(duration / 365)} years`;
  };

  const formatQuantity = (quantity: number) => {
    if (quantity === -1) return "Unlimited";
    return `${quantity} slots`;
  };

  const remainingSlots =
    availableQuantity === -1 ? -1 : availableQuantity - soldCount;

  // If no metadata is provided, render only basic details
  if (!metadata) {
    return (
      <div className={`space-y-8 ${className}`}>
        {/* Course Availability & Access */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Course Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Access Duration:</span>
                <span className="text-white font-medium">
                  {formatDuration(accessDuration)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Capacity:</span>
                <span className="text-white font-medium">
                  {formatQuantity(availableQuantity)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Students Enrolled:</span>
                <span className="text-white font-medium">{soldCount}</span>
              </div>

              {availableQuantity !== -1 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Remaining Slots:</span>
                  <span
                    className={`font-medium ${
                      remainingSlots > 10
                        ? "text-green-400"
                        : remainingSlots > 5
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {remainingSlots > 0 ? remainingSlots : "Sold Out"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Course Availability & Access */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          Course Details
        </h3>

        <div className="grid grid-cols-1 s gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Access Duration:</span>
              <span className="text-white font-medium">
                {formatDuration(accessDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Total Capacity:</span>
              <span className="text-white font-medium">
                {formatQuantity(availableQuantity)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Students Enrolled:</span>
              <span className="text-white font-medium">{soldCount}</span>
            </div>

            {availableQuantity !== -1 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Remaining Slots:</span>
                <span
                  className={`font-medium ${
                    remainingSlots > 10
                      ? "text-green-400"
                      : remainingSlots > 5
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {remainingSlots > 0 ? remainingSlots : "Sold Out"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      {metadata.learningOutcomes && metadata.learningOutcomes.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-green-400" />
            What You'll Learn
          </h3>
          <div className="space-y-3">
            {metadata.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle
                  size={16}
                  className="text-green-400 mt-1 flex-shrink-0"
                />
                <span className="text-gray-300">{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {metadata.requirements && metadata.requirements.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-orange-400" />
            Prerequisites
          </h3>
          <div className="space-y-3">
            {metadata.requirements.map((requirement, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                <span className="text-gray-300">{requirement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Audience */}
      {metadata.targetAudience && metadata.targetAudience.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={20} className="text-purple-400" />
            Who This Course Is For
          </h3>
          <div className="space-y-3">
            {metadata.targetAudience.map((audience, index) => (
              <div key={index} className="flex items-start gap-3">
                <Users
                  size={16}
                  className="text-purple-400 mt-1 flex-shrink-0"
                />
                <span className="text-gray-300">{audience}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Level & Tags */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Level:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                metadata.level === "beginner"
                  ? "bg-green-600/20 text-green-400"
                  : metadata.level === "intermediate"
                  ? "bg-yellow-600/20 text-yellow-400"
                  : metadata.level === "advanced"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-gray-600/20 text-gray-400"
              }`}
            >
              {metadata.level.charAt(0).toUpperCase() + metadata.level.slice(1)}
            </span>
          </div>

          {metadata.tags && metadata.tags.length > 0 && (
            <div>
              <span className="text-gray-400 mb-2 block">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
