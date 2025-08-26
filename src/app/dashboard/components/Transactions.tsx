"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  User,
  ExternalLink,
} from "lucide-react";
import GradientBorder from "./GradientBorder";
import { useDashboardStore } from "../store/useDashboardStore";
import { formatCurrency, formatCompactNumber } from "@/shared/utils/formatters";
import {
  formatTokenString,
  getTokenDisplayData,
} from "@/lib/utils/tokenDisplay";

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
 * Enhanced individual transaction row with better formatting and UX
 */
const TransactionItem: React.FC<{ transaction: Transaction }> = ({
  transaction,
}) => {
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - timestamp.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return timestamp.toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="w-4 h-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />;
    }
  };

  // Try to parse token if it's in the format "TOKEN-CHAINID"
  const formatTokenAmount = (amount: number, currency: string) => {
    try {
      if (currency.includes("-")) {
        const tokenDisplay = getTokenDisplayData(currency);
        if (tokenDisplay.valid) {
          return `${formatCompactNumber(amount)} ${tokenDisplay.symbol}`;
        }
      }

      // Check if it's a known currency
      if (["USD", "EUR", "GBP"].includes(currency.toUpperCase())) {
        return formatCurrency(amount, currency);
      }

      return `${formatCompactNumber(amount)} ${currency}`;
    } catch {
      return `${formatCompactNumber(amount)} ${currency}`;
    }
  };

  return (
    <div className="group flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 transition-all duration-200 border border-transparent hover:border-gray-700/50">
      {/* Left section: Icon + Transaction info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Transaction type icon */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          {getTypeIcon(transaction.type)}
        </div>

        {/* Transaction details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="text-white font-medium truncate"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                lineHeight: "100%",
              }}
            >
              {formatAddress(transaction.userWallet)}
            </p>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                getStatusColor(transaction.status)
              )}
            >
              {transaction.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-400 text-xs">
              {getTimeAgo(transaction.timestamp)}
            </p>
            <p className="text-gray-500 text-xs">
              {transaction.type.charAt(0).toUpperCase() +
                transaction.type.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Center section: From/To - hidden on mobile */}
      <div className="mx-3 sm:mx-4 text-center min-w-0 hidden md:block">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-1 text-xs">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">From:</span>
            <span className="text-blue-400 font-mono">
              {formatAddress(transaction.from)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">To:</span>
            <span className="text-blue-400 font-mono">
              {formatAddress(transaction.to)}
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Amount with enhanced formatting */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-white font-bold text-sm sm:text-base">
              {formatTokenAmount(transaction.amount, transaction.currency)}
            </div>
            {transaction.currency.includes("-") && (
              <div className="text-gray-400 text-xs">
                {formatTokenString(transaction.currency).split(" ")[1]}
              </div>
            )}
          </div>
          <a
            href="#"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-800/50 rounded"
          >
            <ExternalLink className="w-3 h-3 text-gray-400 hover:text-white" />
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * Transactions Component
 * Enhanced transactions list with better filtering, sorting, and UX
 */
const Transactions: React.FC<TransactionsProps> = ({ className }) => {
  const [sortBy, setSortBy] = useState<
    "Latest First" | "Oldest First" | "Highest Amount" | "Lowest Amount"
  >("Latest First");
  const [filterBy, setFilterBy] = useState<
    "All" | "completed" | "pending" | "failed"
  >("All");
  const [showFilters, setShowFilters] = useState(false);

  const { transactions: storeTransactions, isLoading } = useDashboardStore();

  // Close filter dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showFilters) setShowFilters(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showFilters]);

  // Filter transactions based on status
  const filteredTransactions = useMemo(() => {
    if (filterBy === "All") return storeTransactions;
    return storeTransactions.filter((tx) => tx.status === filterBy);
  }, [storeTransactions, filterBy]);

  // Sort transactions based on selected option
  const sortedTransactions = useMemo(
    () =>
      [...filteredTransactions].sort((a, b) => {
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
    [filteredTransactions, sortBy]
  );

  const filterOptions = [
    { value: "All", label: "All Status", count: storeTransactions.length },
    {
      value: "completed",
      label: "Completed",
      count: storeTransactions.filter((tx) => tx.status === "completed").length,
    },
    {
      value: "pending",
      label: "Pending",
      count: storeTransactions.filter((tx) => tx.status === "pending").length,
    },
    {
      value: "failed",
      label: "Failed",
      count: storeTransactions.filter((tx) => tx.status === "failed").length,
    },
  ];

  const sortOptions = [
    { value: "Latest First", label: "Latest First" },
    { value: "Oldest First", label: "Oldest First" },
    { value: "Highest Amount", label: "Highest Amount" },
    { value: "Lowest Amount", label: "Lowest Amount" },
  ];

  if (isLoading) {
    return (
      <GradientBorder
        className={cn(
          "transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5",
          className
        )}
      >
        <div className="p-4 lg:p-6 flex items-center justify-center h-80">
          <div className="text-gray-400">Loading transactions...</div>
        </div>
      </GradientBorder>
    );
  }

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
          <div className="flex flex-col">
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
            <div className="text-gray-400 text-xs mt-1">
              Showing {sortedTransactions.length} of {storeTransactions.length}{" "}
              transactions
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex gap-2 overflow-x-auto">
            {/* Filter Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-900/50 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 border border-gray-700/50 whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilters(!showFilters);
                }}
              >
                <Filter className="w-3 h-3 lg:w-4 lg:h-4" />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                  }}
                >
                  {filterBy === "All" ? "All Status" : filterBy}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* Filter dropdown */}
              {showFilters && (
                <div
                  className="absolute top-full mt-1 right-0 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg py-1 z-20 min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterBy(option.value as typeof filterBy);
                        setShowFilters(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-800/50 transition-colors",
                        filterBy === option.value
                          ? "text-blue-400"
                          : "text-gray-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-500">
                          ({option.count})
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-gray-900/50 border border-gray-700/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer text-xs sm:text-sm pr-8"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Transactions List - Enhanced scrollable area */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction, index) => (
              <TransactionItem
                key={`${transaction.id}-${index}`}
                transaction={transaction}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
                <Filter className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-gray-400 text-sm">
                No transactions found{" "}
                {filterBy !== "All" && `with status "${filterBy}"`}
              </div>
            </div>
          )}
        </div>

        {/* Summary footer */}
        {sortedTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>
                Total:{" "}
                {formatCurrency(
                  sortedTransactions.reduce((sum, tx) => sum + tx.amount, 0)
                )}
              </span>
              <span>
                {
                  sortedTransactions.filter((tx) => tx.status === "completed")
                    .length
                }{" "}
                completed
              </span>
            </div>
          </div>
        )}
      </div>
    </GradientBorder>
  );
};

export default Transactions;
