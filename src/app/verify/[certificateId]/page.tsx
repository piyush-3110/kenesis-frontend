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

        {/* Glowing Blue Blob */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/6 w-screen h-[600px] pointer-events-none">
          <div 
            className="w-full h-full rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(6,128,255,0.8) 0%, rgba(2,46,210,0.5) 30%, rgba(6,128,255,0.2) 60%, transparent 80%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mt-24">
            <h1 className="font-poppins text-white mb-6">
              <div className="text-[32px] md:text-[48px] lg:text-[56px] font-semibold leading-tight mb-2">
                Certificate{" "}
                <span 
                  className="bg-gradient-to-b from-white to-[#0680FF] bg-clip-text text-transparent font-bold"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Verification
                </span>
              </div>
            </h1>
            <div className="font-poppins text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Verifying authenticity for:{" "}
              <div className="mt-2 font-mono text-[#0680FF] text-base md:text-lg break-all">
                {certificateId}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CertificateVerificationPage;
