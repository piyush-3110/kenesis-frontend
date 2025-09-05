"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useVerifyCertificate } from "@/hooks/useVerifyCertificate";
import { VerificationLoading } from "@/features/learning/components/verification/VerificationLoading";
import { VerificationError } from "@/features/learning/components/verification/VerificationError";
import { VerificationSuccess } from "@/features/learning/components/verification/VerificationSuccess";
import { MainLayout } from "@/components/Landing/MainLayout";

const CertificateVerificationPage = () => {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const { data, isLoading, error } = useVerifyCertificate(certificateId);

  const renderContent = () => {
    if (isLoading) {
      return <VerificationLoading />;
    }

    if (error) {
      const errorMessage =
        (error as any).response?.data?.message ||
        error.message ||
        "Certificate not found or invalid.";
      return <VerificationError message={errorMessage} />;
    }

    if (data?.success && data.data) {
      return <VerificationSuccess certificate={data.data} />;
    }

    if (data?.success === false) {
      return <VerificationError message={data.message || "Certificate is not valid."} />;
    }

    return <VerificationError message="Certificate could not be verified." />;
  };

  return (
    <MainLayout>
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-50">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)'
            }}
          />
        </div>
      </section>
    </MainLayout>
  );
};

export default CertificateVerificationPage;
