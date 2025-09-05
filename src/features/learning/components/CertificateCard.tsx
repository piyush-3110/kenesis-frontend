"use client";

import React from "react";
import { motion } from "motion/react";
import { Download, Share, Award, ExternalLink, CheckCircle, ShieldCheck } from "lucide-react";
import type { Certificate } from "./CertificateSection";

interface CertificateCardProps {
  certificate: Certificate;
  index: number;
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
}

/**
 * Certificate Card Component
 * Individual certificate display with hover effects and actions
 * 
 * @param certificate - Certificate object with details
 * @param index - Index for staggered animations
 * @param onDownload - Handler for certificate download
 * @param onShare - Handler for certificate sharing
 */
const CertificateCard: React.FC<CertificateCardProps> = ({ 
  certificate, 
  index, 
  onDownload, 
  onShare 
}) => {
  const handleDownload = () => {
    onDownload?.(certificate);
    // Fallback: trigger browser download
    const link = document.createElement('a');
    link.href = certificate.downloadUrl;
    link.download = `${certificate.title}-certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    onShare?.(certificate);
    // Share the verification link instead of LinkedIn
    if (certificate.shareUrl) {
      window.open(certificate.shareUrl, '_blank');
    }
  };

  const handleVerify = () => {
    // Open verification page
    if (certificate.shareUrl) {
      window.open(certificate.shareUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut" 
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      {/* Gradient Border Container */}
      <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-500/60 to-transparent transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-600/50">
        <div
          className="rounded-xl overflow-hidden h-full"
          style={{
            background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)',
          }}
        >
          {/* Certificate Thumbnail */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={certificate.imageUrl}
              alt={`${certificate.title} Certificate`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>

            {/* Certificate Badge */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Award className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {certificate.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Completed on {new Date(certificate.date).toLocaleDateString()}</span>
            </div>

            {/* Completion Rate (if available) */}
            {certificate.completionRate && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Course Completion</span>
                  <span>{certificate.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${certificate.completionRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              
              <button
                onClick={handleVerify}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;
