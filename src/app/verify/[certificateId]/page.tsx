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

    return null;
  };

  return null;
};

export default CertificateVerificationPage;
