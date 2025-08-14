"use client";
import { BarChart3 } from "lucide-react";
import { ReviewStars } from "./ReviewStars";
import React from "react";

interface Props { summary: any; }
export const ReviewSummaryCard: React.FC<Props> = ({ summary }) => {
  if(!summary) return null;
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-xl bg-black/30 border border-gray-700/30 text-center">
        <div className="text-4xl font-bold text-white mb-2">{summary.averageRating.toFixed(1)}</div>
        <ReviewStars rating={Math.round(summary.averageRating)} size="lg" />
        <p className="text-gray-400 text-sm mt-2">Based on {summary.totalReviews} review{summary.totalReviews!==1?'s':''}</p>
      </div>
      <div className="lg:col-span-2 p-6 rounded-xl bg-black/30 border border-gray-700/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400"/>Rating Distribution
        </h3>
        <div className="space-y-2">
          {[5,4,3,2,1].map(r=> { const count = summary.ratingDistribution[r]; const pct = summary.totalReviews>0? (count/summary.totalReviews)*100:0; return (
            <div key={r} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-6">{r}</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: pct+'%' }} />
              </div>
              <span className="text-xs text-gray-400 w-8">{count}</span>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
};
