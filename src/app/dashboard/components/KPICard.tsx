"use client";

import React from "react";
import { cn } from "@/lib/utils";
import GradientBorder from "./GradientBorder";

interface KPICardProps {
  title: string;
  value: string | number;
  // change?: {
  //   percentage: number;
  //   direction: "up" | "down";
  //   period: string;
  // };
  // trend?: number[];
  className?: string;
}

/**
 * MiniChart Component
 * Small line chart for KPI cards
 */
// const MiniChart: React.FC<{ data: number[]; isPositive: boolean }> = ({
//   data,
//   isPositive,
// }) => {
//   if (!data || data.length === 0) return null;

//   const max = Math.max(...data);
//   const min = Math.min(...data);
//   const range = max - min || 1;

//   const points = data
//     .map((value, index) => {
//       const x = (index / (data.length - 1)) * 100;
//       const y = 100 - ((value - min) / range) * 100;
//       return `${x},${y}`;
//     })
//     .join(" ");

//   return (
//     <div className="w-16 h-8 lg:w-20 lg:h-10">
//       <svg
//         width="100%"
//         height="100%"
//         viewBox="0 0 100 100"
//         className="overflow-visible"
//       >
//         <defs>
//           <linearGradient
//             id={`gradient-${isPositive ? "positive" : "negative"}`}
//             x1="0%"
//             y1="0%"
//             x2="100%"
//             y2="0%"
//           >
//             <stop
//               offset="0%"
//               stopColor={isPositive ? "#10B981" : "#EF4444"}
//               stopOpacity="0.8"
//             />
//             <stop
//               offset="100%"
//               stopColor={isPositive ? "#34D399" : "#F87171"}
//               stopOpacity="0.4"
//             />
//           </linearGradient>
//         </defs>

//         <polyline
//           fill="none"
//           stroke={`url(#gradient-${isPositive ? "positive" : "negative"})`}
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           points={points}
//           style={{
//             filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))",
//           }}
//         />

//         {/* Glow effect */}
//         <polyline
//           fill="none"
//           stroke={isPositive ? "#10B981" : "#EF4444"}
//           strokeWidth="1"
//           strokeOpacity="0.6"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           points={points}
//         />
//       </svg>
//     </div>
//   );
// };

/**
 * KPICard Component
 * Individual KPI metric card with trend chart
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  // change,
  // trend = [],
  className,
}) => {
  // const isPositive = change?.direction === "up";

  return (
    <GradientBorder
      className={cn(
        "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10",
        className
      )}
    >
      <div className="p-4 lg:p-6">
        <div className="flex flex-col space-y-3 lg:space-y-4">
          {/* Header */}
          <h3
            className="text-gray-300 text-xs sm:text-sm lg:text-base truncate"
            style={{
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "clamp(12px, 2vw, 16px)",
              fontWeight: 450,
              lineHeight: "140%",
            }}
          >
            {title}
          </h3>

          {/* Main content */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Value */}
              <div
                className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-2 truncate"
                style={{
                  fontFamily: "CircularXX, Inter, sans-serif",
                  fontSize: "clamp(16px, 3vw, 24px)",
                  lineHeight: "120%",
                }}
              >
                {value}
              </div>

              {/* Change indicator */}
              {/* {change && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span
                    className={cn(
                      "text-xs lg:text-sm font-medium flex items-center gap-1 whitespace-nowrap",
                      isPositive ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {isPositive ? "↗" : "↘"} {Math.abs(change.percentage)}%
                  </span>
                  <span
                    className="text-gray-400 text-xs truncate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "clamp(10px, 1.5vw, 12px)",
                    }}
                  >
                    {change.period}
                  </span>
                </div>
              )} */}
            </div>

            {/* Mini chart */}
            {/* {trend.length > 0 && (
              <div className="ml-4">
                <MiniChart data={trend} isPositive={isPositive || false} />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </GradientBorder>
  );
};

export default KPICard;
