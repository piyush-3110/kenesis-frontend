"use client";

import React from "react";
import { motion } from "motion/react";
import { Award, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCompletionStatusProps {
  courseTitle: string;
  isCompleted: boolean;
  completionPercentage: number;
  completionDate?: string;
  className?: string;
}

/**
 * Course Completion Status Component
 * Shows completion status with certificate preview
 * Displays progress when not completed, celebration when completed
 */
export const CourseCompletionStatus: React.FC<CourseCompletionStatusProps> = ({
  courseTitle,
  isCompleted,
  completionPercentage,
  completionDate,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("mb-6", className)}
    >
      <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-500/60 to-purple-500/60">
        <div
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)',
          }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Certificate Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src="/images/landing/Certificate.png"
                  alt="Course Certificate"
                  className={cn(
                    "w-48 h-32 object-cover rounded-lg transition-all duration-300",
                    !isCompleted && "opacity-50 filter blur-sm"
                  )}
                />
                {!isCompleted && (
                  <div className="absolute inset-0 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Award className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-medium text-sm">Locked</p>
                    </div>
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Content */}
            <div className="flex-1 text-center lg:text-left">
              {isCompleted ? (
                // Completed State
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    🎉 Course Completed!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 mb-3"
                  >
                    Congratulations! You've successfully completed "{courseTitle}"
                  </motion.p>
                  {completionDate && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2 text-sm text-gray-400 justify-center lg:justify-start"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Completed on {new Date(completionDate).toLocaleDateString()}</span>
                    </motion.div>
                  )}
                </div>
              ) : (
                // In Progress State
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-white mb-2"
                  >
                    Course In Progress
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 mb-4"
                  >
                    Complete the course to unlock your certificate for "{courseTitle}"
                  </motion.p>
                  
                  {/* Progress Bar */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3"
                  >
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Progress
                      </span>
                      <span className="font-medium">{Math.round(completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-gray-400"
                  >
                    {100 - Math.round(completionPercentage)}% remaining to unlock certificate
                  </motion.p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCompletionStatus;
