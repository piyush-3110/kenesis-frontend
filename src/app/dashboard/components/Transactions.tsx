"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Filter } from "lucide-react";
import GradientBorder from "./GradientBorder";
import { useDashboardStore } from "../store/useDashboardStore";

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  type: "deposit" | "withdrawal" | "transfer";
  userWallet: string;
}

interface TransactionsProps {
  className?: string;
}

/**
 * TransactionItem Component
 * Individual transaction row with Kenesis logo, wallet info, and amount
 */
const TransactionItem: React.FC<{ transaction: Transaction }> = ({
  transaction,
}) => {
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - timestamp.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 transition-colors duration-200">
      {/* Left section: Logo + User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Kenesis Logo */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm sm:text-base">K</span>
        </div>

        {/* User wallet and time */}
        <div className="min-w-0 flex-1">
          <p
            className="text-[#4285F4] truncate"
            style={{
              fontFamily: "Rubik",
              fontWeight: 400,
              fontSize: "16.84px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            {formatAddress(transaction.userWallet)}
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {getTimeAgo(transaction.timestamp)}
          </p>
        </div>
      </div>

      {/* Center section: From/To */}
      <div className="mx-3 sm:mx-4 text-center min-w-0 hidden sm:block">
        <div className="text-gray-300 text-xs mb-1">From</div>
        <p
          className="text-[#4285F4] text-xs truncate max-w-[80px]"
          style={{
            fontFamily: "Rubik",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "100%",
          }}
        >
          {formatAddress(transaction.from)}
        </p>
        <div className="text-gray-300 text-xs mt-2 mb-1">To</div>
        <p
          className="text-[#4285F4] text-xs truncate max-w-[80px]"
          style={{
            fontFamily: "Rubik",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "100%",
          }}
        >
          {formatAddress(transaction.to)}
        </p>
      </div>

      {/* Right section: Amount */}
      <div className="flex-shrink-0">
        <div className="px-3 py-1.5 bg-white rounded-md">
          <span className="text-black font-bold text-sm sm:text-base">
            {transaction.amount} {transaction.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Transactions Component
 * Latest transactions card with sorting and filtering
 */
const Transactions: React.FC<TransactionsProps> = ({ className }) => {
  const [sortBy, setSortBy] = useState<
    "Latest First" | "Oldest First" | "Highest Amount" | "Lowest Amount"
  >("Latest First");

  const { transactions: storeTransactions } = useDashboardStore();

  const mockTransactions: Transaction[] = storeTransactions; // now real data from store

  // Sort transactions based on selected option
  const sortedTransactions = useMemo(
    () =>
      [...mockTransactions].sort((a, b) => {
        switch (sortBy) {
          case "Latest First":
            return b.timestamp.getTime() - a.timestamp.getTime();
          case "Oldest First":
            return a.timestamp.getTime() - b.timestamp.getTime();
          case "Highest Amount":
            return b.amount - a.amount;
          case "Lowest Amount":
            return a.amount - b.amount;
          default:
            return 0;
        }
      }),
    [mockTransactions, sortBy]
  );

  return (
    <GradientBorder
      className={cn(
        "transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5",
        className
      )}
    >
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3">
          <h3
            className="text-white truncate"
            style={{
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "clamp(14px, 2.5vw, 18px)",
              fontWeight: 450,
              lineHeight: "140%",
            }}
          >
            Latest Transactions
          </h3>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {/* Filter By */}
            <div className="relative flex-shrink-0">
              <button
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-900/50 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 border border-gray-700/50 whitespace-nowrap"
                onClick={() => {}}
              >
                <Filter className="w-3 h-3 lg:w-4 lg:h-4" />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                  }}
                >
                  Filter by
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Sort By */}
            <div className="relative flex-shrink-0">
              <button
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-900/50 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 border border-gray-700/50 whitespace-nowrap"
                onClick={() => {}}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                  }}
                >
                  Sort by: {sortBy}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* Dropdown menu - you can implement this later */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="Latest First">Latest First</option>
                <option value="Oldest First">Oldest First</option>
                <option value="Highest Amount">Highest Amount</option>
                <option value="Lowest Amount">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List - Scrollable */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {sortedTransactions.map((transaction, index) => (
            <TransactionItem
              key={`${transaction.id}-${index}`}
              transaction={transaction}
            />
          ))}
        </div>
      </div>
    </GradientBorder>
  );
};

export default Transactions;
