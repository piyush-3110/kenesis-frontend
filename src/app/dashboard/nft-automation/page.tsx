"use client";

import React from "react";
import ComingSoon from "../components/ComingSoon";
import { Mail } from "lucide-react";

/**
 * NFT Automation - Email Page
 * Temporary Coming Soon page for the NFT Automation Email feature
 */
const NFTAutomationPage = () => {
  return (
    <ComingSoon
      title="NFT Automation - Email Coming Soon"
      subtitle="Our innovative NFT-powered email automation system is being developed. Soon you'll be able to create token-gated email campaigns, automate communications based on NFT ownership, and integrate blockchain verification in your email marketing."
      estimatedRelease="Q1 2026"
      icon={<Mail className="w-10 h-10 text-white" />}
    />
  );
};

export default NFTAutomationPage;
