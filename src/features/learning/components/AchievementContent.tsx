import React from "react";
import { useUserCertificates } from "@/hooks/useUserCertificates";
import { useGenerateCertificate } from "@/hooks/useGenerateCertificate";
import { CertificateSection } from "@/features/learning/components/CertificateSection";
import { CertificateLoading } from "@/features/learning/components/CertificateLoading";
import { CertificateError } from "@/features/learning/components/CertificateError";
import { transformCertificateData } from "@/lib/utils/certificateTransform";
import type { Certificate } from "@/features/learning/types/certificate";

interface AchievementContentProps {
  className?: string;
}

export const AchievementContent: React.FC<AchievementContentProps> = ({
  className,
}) => {
  const { data: certificateData, isLoading, error, refetch } = useUserCertificates();
  const { mutate: generateCertificate, isPending: isGenerating } = useGenerateCertificate();

  const handleDownload = (certificate: Certificate) => {
    if (certificate.courseId) {
      generateCertificate(certificate.courseId);
    }
  };

  const handleShare = (certificate: Certificate) => {
    if (certificate.shareUrl) {
      window.open(certificate.shareUrl, '_blank');
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return <CertificateLoading />;
  }

  if (error) {
    const errorMessage = (error as any).response?.data?.message || 
                        error.message || 
                        'Failed to load certificates. Please try again.';
    return <CertificateError error={errorMessage} onRetry={handleRetry} />;
  }

  // Handle API response structure
  const certificates = certificateData?.data?.certificates ? 
    transformCertificateData(certificateData.data.certificates) : [];

  return (
    <CertificateSection
      certificates={certificates}
      onDownload={handleDownload}
      onShare={handleShare}
      loading={isGenerating}
      className={className}
    />
  );
};
