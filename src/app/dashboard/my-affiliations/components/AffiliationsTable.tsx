"use client";

import React from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { MyAffiliateCourse } from "../types";
import { useUIStore } from "@/store/useUIStore";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { useMyAffiliationsStore } from "../store/useMyAffiliationsStore";
import { Copy, LogOut } from "lucide-react";

interface AffiliationsTableProps {
  affiliations: MyAffiliateCourse[];
}

const AffiliationsTable: React.FC<AffiliationsTableProps> = ({
  affiliations,
}) => {
  const { addToast } = useUIStore.getState();
  const { data: user } = useCurrentUser();
  const { leaveProgram } = useMyAffiliationsStore.getState();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getStatusBadge = (status: "active" | "paused") => {
    if (status === "paused") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
          Paused
        </span>
      );
    }
    return null;
  };

  const buildReferralLink = (courseSlug: string, affiliateCode?: string) => {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "https://kenesis.com");
    const code = affiliateCode || user?.walletAddress || "";
    const origin = base.replace(/\/$/, "");
    // New backend format: /products/{slug}?ref={affiliateCode}
    return code
      ? `${origin}/product/${courseSlug}?ref=${encodeURIComponent(code)}`
      : `${origin}/product/${courseSlug}`;
  };

  const onCopyReferral = async (courseSlug: string, affiliateCode?: string) => {
    try {
      const link = buildReferralLink(courseSlug, affiliateCode);
      await navigator.clipboard.writeText(link);
      addToast({
        type: "success",
        message:
          affiliateCode || user?.walletAddress
            ? "Referral link copied to clipboard"
            : "Referral code missing, copied product link",
      });
    } catch {
      addToast({ type: "error", message: "Failed to copy referral link" });
    }
  };

  const onLeave = async (courseId: string) => {
    const ok = await leaveProgram(courseId);
    addToast({
      type: ok ? "success" : "error",
      message: ok ? "Left program" : "Failed to leave program",
    });
  };

  if (affiliations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No affiliations found</p>
        <p className="text-gray-500 text-sm mt-2">
          Start promoting products to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Outer container with gradient border */}
      <div
        className="rounded-lg p-[1.06px]"
        style={{
          background: "linear-gradient(180deg, #0680FF 0%, #010519 88.45%)",
        }}
      >
        {/* Inner container with gradient background */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background:
              "linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {affiliations.map((affiliation) => (
              <div
                key={affiliation.programId}
                className="p-4 border-b border-gray-700/30 last:border-b-0"
              >
                <Link
                  href={`/dashboard/my-affiliations/product/${affiliation.courseId}`}
                  className="block space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-white">
                        {affiliation.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          (#{affiliation.courseId})
                        </span>
                        {getStatusBadge(affiliation.status)}
                      </div>
                    </div>
                    <button
                      className="p-1 text-white hover:text-blue-400 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 block text-xs mb-1">
                        Sales
                      </span>
                      <span className="text-white">
                        {affiliation.sales ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs mb-1">
                        Earnings
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-white text-black font-semibold text-sm">
                        {formatCurrency(affiliation.earnings ?? 0)}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-400 text-xs">Commission: </span>
                    <span className="text-white">
                      {affiliation.commissionPercent}% commission
                    </span>
                  </div>
                </Link>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() =>
                      onCopyReferral(
                        affiliation.courseSlug,
                        affiliation.affiliateCode
                      )
                    }
                    className="text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-400 inline-flex items-center gap-1"
                  >
                    <Copy size={14} /> Copy link
                  </button>
                  <button
                    onClick={() => onLeave(affiliation.courseId)}
                    className="text-xs px-2 py-1 rounded border border-red-600 text-red-300 hover:text-red-200 hover:border-red-400 inline-flex items-center gap-1"
                  >
                    <LogOut size={14} /> Leave
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "21.77px",
                      lineHeight: "140%",
                      letterSpacing: "0%",
                    }}
                  >
                    Products
                  </th>
                  <th
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "21.77px",
                      lineHeight: "140%",
                      letterSpacing: "0%",
                    }}
                  >
                    Sales
                  </th>
                  <th
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "21.77px",
                      lineHeight: "140%",
                      letterSpacing: "0%",
                    }}
                  >
                    Earnings
                  </th>
                  <th
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "21.77px",
                      lineHeight: "140%",
                      letterSpacing: "0%",
                    }}
                  >
                    Commission
                  </th>
                  <th
                    className="text-center px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "21.77px",
                      lineHeight: "140%",
                      letterSpacing: "0%",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-700/30">
                {affiliations.map((affiliation) => (
                  <tr
                    key={affiliation.programId}
                    className="hover:bg-gray-800/20 transition-colors group"
                  >
                    {/* Products Column */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/my-affiliations/product/${affiliation.courseId}`}
                        className="block"
                      >
                        <div className="space-y-1">
                          <h3 className="text-base font-medium text-white group-hover:text-blue-300 transition-colors">
                            {affiliation.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              (#{affiliation.courseId})
                            </span>
                            {getStatusBadge(affiliation.status)}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Sales Column */}
                    <td className="px-6 py-4">
                      <span className="text-base text-white">
                        {affiliation.sales ?? 0}
                      </span>
                    </td>

                    {/* Earnings Column */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-white text-black font-semibold text-sm">
                        {formatCurrency(affiliation.earnings ?? 0)}
                      </span>
                    </td>

                    {/* Commission Column */}
                    <td className="px-6 py-4">
                      <span className="text-base text-white">
                        {affiliation.commissionPercent}% commission
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="p-1 text-white hover:text-blue-400 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCopyReferral(
                              affiliation.courseSlug,
                              affiliation.affiliateCode
                            );
                          }}
                          title="Copy referral link"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="p-1 text-red-300 hover:text-red-200 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onLeave(affiliation.courseId);
                          }}
                          title="Leave program"
                        >
                          <LogOut size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliationsTable;
