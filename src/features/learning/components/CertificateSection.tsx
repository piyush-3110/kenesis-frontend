"use client";

import React from "react";
import { motion } from "motion/react";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import CertificateCard from "./CertificateCard";

// TypeScript interfaces for props
export interface Certificate {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  downloadUrl: string;
  shareUrl: string;
  courseId?: string;
  completionRate?: number;
}

interface CertificateSectionProps {
  certificates: Certificate[];
  className?: string;
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
  loading?: boolean;
}

/**
 * Certificate Section Component
 * Displays certificates in a responsive grid with animations
 * 
 * @param certificates - Array of certificate objects
 * @param className - Additional CSS classes
 * @param onDownload - Handler for certificate download
 * @param onShare - Handler for certificate sharing
 */
export const CertificateSection: React.FC<CertificateSectionProps> = ({
  certificates,
  className,
  onDownload,
  onShare,
  loading,
}) => {
  if (loading) {
    return (
      <div className={cn("py-12 text-center", className)}>
        <p className="text-white">Processing certificate...</p>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className={cn("py-12", className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
            <Award className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Complete courses to earn certificates and showcase your achievements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-8", className)}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Your Certificates
          </h2>
        </div>
        <p className="text-gray-400 text-lg">
          Celebrate your learning achievements with these completion certificates.
        </p>
        
        {/* Gradient Underline */}
        <div
          className="mt-4 h-[3px] w-32"
          style={{
            background: 'linear-gradient(90deg, #0680FF 0%, #010519 88.45%)',
          }}
        />
      </motion.div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate, index) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            index={index}
            onDownload={onDownload}
            onShare={onShare}
          />
        ))}
      </div>

      {/* View All Button (if many certificates) */}
      {certificates.length > 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300 border border-gray-700 hover:border-gray-600">
            View All Certificates
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CertificateSection;
