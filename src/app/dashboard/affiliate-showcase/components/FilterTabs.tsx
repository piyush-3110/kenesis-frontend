"use client";

import React from "react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { FilterType } from "../types";
import { cn } from "@/lib/utils";
import { AFFILIATE_COLORS } from "../constants";

/**
 * FilterTabs Component
 * Tab navigation for filtering products by type
 */
const FilterTabs: React.FC = () => {
  const { filters, setType } = useAffiliateShowcaseStore();

  const tabs: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "video", label: "Video" },
    { id: "document", label: "Document" },
  ];

  const handleTabClick = (tabId: FilterType) => {
    const typeValue = tabId === "all" ? "" : tabId;
    setType(typeValue as "video" | "document" | "");
  };

  const getActiveTab = (): FilterType => {
    if (filters.type === "") return "all";
    return filters.type as FilterType;
  };

  return (
    <div className="flex space-x-1">
      {tabs.map((tab) => {
        const isActive = getActiveTab() === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 relative",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
              isActive ? "text-white" : "text-gray-300 hover:text-white"
            )}
            style={{
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "16.4px",
              fontWeight: 500,
            }}
          >
            {/* Active state background and border */}
            {isActive && (
              <>
                {/* Gradient border effect */}
                <div
                  className="absolute inset-0 rounded-lg p-[2px]"
                  style={{
                    background: AFFILIATE_COLORS.PRIMARY_BORDER,
                  }}
                >
                  <div
                    className="w-full h-full rounded-lg"
                    style={{
                      background: AFFILIATE_COLORS.PRIMARY_BG,
                    }}
                  />
                </div>

                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-lg opacity-20 blur-sm"
                  style={{
                    background: AFFILIATE_COLORS.PRIMARY_BORDER,
                  }}
                />
              </>
            )}

            {/* Text */}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
