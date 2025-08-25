import React from "react";
import { Play, FileText, Star, Users } from "lucide-react";

interface CourseStatsProps {
  type: "video" | "document";
  rating: number;
  totalRatings: number;
  studentsCount: number;
  className?: string;
}

const CourseStats: React.FC<CourseStatsProps> = ({
  type,
  rating,
  totalRatings,
  studentsCount,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
        <div className="flex items-center justify-center mb-2">
          {type === "video" ? (
            <Play size={24} className="text-blue-400" />
          ) : (
            <FileText size={24} className="text-orange-400" />
          )}
        </div>
        <div className="text-white font-semibold">
          {type === "video" ? "Video Course" : "Document Course"}
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
        <Star size={24} className="text-yellow-400 mx-auto mb-2" />
        <div className="text-white font-semibold">{rating}/5</div>
        <div className="text-gray-400 text-sm">{totalRatings} reviews</div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
        <Users size={24} className="text-green-400 mx-auto mb-2" />
        <div className="text-white font-semibold">{studentsCount}</div>
        <div className="text-gray-400 text-sm">Students</div>
      </div>
    </div>
  );
};

export default CourseStats;
