"use client";

import React from "react";
import { motion } from "motion/react";
import { Award, Download, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CongratulatoryBannerProps {
  courseTitle: string;
  completionDate: string;
  onViewCertificate: () => void;
  onDownloadCertificate: () => void;
  className?: string;
}

/**
 * Congratulatory Banner Component
 * Displays when course is completed - Udemy-style but following website design
 * 
 * @param courseTitle - Name of the completed course
 * @param completionDate - ISO date string of completion
 * @param onViewCertificate - Handler for viewing certificate
 * @param onDownloadCertificate - Handler for downloading certificate
 * @param className - Additional CSS classes
 */
export const CongratulatoryBanner: React.FC<CongratulatoryBannerProps> = ({
  courseTitle,
  completionDate,
  onViewCertificate,
  onDownloadCertificate,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("mb-8", className)}
    >
      {/* Gradient Border Container */}
      <div className="rounded-xl p-[1px] bg-gradient-to-r from-green-500 via-blue-500 to-purple-500">
        <div
          className="rounded-xl p-6 lg:p-8"
          style={{
            background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)',
          }}
        >
          {/* Celebration Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                <Award className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl lg:text-3xl font-bold text-white mb-2"
              >
                🎉 Congratulations!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-lg"
              >
                You've successfully completed the course
              </motion.p>
            </div>
          </div>

          {/* Course Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 p-4 rounded-lg bg-black/30 border border-gray-700/50"
          >
            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
              {courseTitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Completed on {new Date(completionDate).toLocaleDateString()}</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={onViewCertificate}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]"
            >
              <Award className="w-5 h-5" />
              View Certificate
            </button>
            <button
              onClick={onDownloadCertificate}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700 hover:border-gray-600"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CongratulatoryBanner;
