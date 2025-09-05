"use client";

import React from "react";
import { motion } from "motion/react";
import { Award } from "lucide-react";
// import { cn } from "@/lib/utils";

interface CertificateButtonsProps {
  courseTitle: string;
  isCompleted: boolean;
  completionPercentage: number;
  onViewCertificate: () => void;
  onDownloadCertificate: () => void;
  className?: string;
}

/**
 * Certificate Buttons Component
 * Displays View and Download certificate buttons on learn page
 * Shows progress modal when course is not completed
 */
export const CertificateButtons: React.FC<CertificateButtonsProps> = ({
  courseTitle,
  isCompleted,
  completionPercentage,
  // onViewCertificate,
  // onDownloadCertificate,
  className,
}) => {
  const [showProgressModal, setShowProgressModal] = React.useState(false);

  // const handleButtonClick = (action: 'view' | 'download') => {
  //   if (isCompleted) {
  //     if (action === 'view') {
  //       onViewCertificate();
  //     } else {
  //       onDownloadCertificate();
  //     }
  //   } else {
  //     setShowProgressModal(true);
  //   }
  // };

  const closeModal = () => {
    setShowProgressModal(false);
  };

  return (
    <>
      {/* Certificate Buttons */}
      {/* <div className={cn("flex flex-col sm:flex-row gap-3", className)}> */}
        {/* <motion.button
          onClick={() => handleButtonClick('view')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300",
            isCompleted
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg hover:shadow-blue-500/25"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
          )}
        >
          <Award className="w-5 h-5" />
          View Certificate
        </motion.button> */}

        {/* <motion.button
          onClick={() => handleButtonClick('download')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300",
            isCompleted
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-lg hover:shadow-emerald-500/25"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
          )}
        >
          <Download className="w-5 h-5" />
          Download Certificate
        </motion.button> */}
      {/* </div> */}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-500/60 to-purple-500/60">
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)',
                }}
              >
                {/* Certificate Image */}
                <div className="relative mb-6">
                  <img
                    src="/images/landing/Certificate.png"
                    alt="Course Certificate"
                    className="w-full h-48 object-cover rounded-lg opacity-50 filter blur-sm"
                  />
                  <div className="absolute inset-0 bg-blue-600/20 rounded-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Award className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-white font-semibold text-lg">Certificate Locked</p>
                    </div>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Course Not Completed Yet
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Complete the entire course to unlock your certificate for "{courseTitle}"
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Course Progress</span>
                      <span>{Math.round(completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    {100 - Math.round(completionPercentage)}% remaining to unlock certificate
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700 hover:border-gray-600"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default CertificateButtons;
