"use client";

import React from "react";
import { LoaderFive } from "@/components/ui/loader";
import { AFFILIATE_COLORS } from "../constants";

/**
 * LoadingState Component
 * Displays loading animation while data is being fetched
 */
const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6">
        <LoaderFive text="Loading Affiliate Products" />
      </div>

      <p
        className="text-center max-w-md"
        style={{
          color: AFFILIATE_COLORS.TEXT_SECONDARY,
          fontFamily: "CircularXX, Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 450,
        }}
      >
        Discovering high-converting products for you...
      </p>
    </div>
  );
};

export default LoadingState;
