'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Filter } from 'lucide-react';
import GradientBorder from './GradientBorder';

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  type: 'deposit' | 'withdrawal' | 'transfer';
  userWallet: string;
}

interface TransactionsProps {
  className?: string;
}

/**
 * TransactionItem Component
 * Individual transaction row with Kenesis logo, wallet info, and amount
 */
const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
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
              fontFamily: 'Rubik',
              fontWeight: 400,
              fontSize: '16.84px',
              lineHeight: '100%',
              letterSpacing: '0%',
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
            fontFamily: 'Rubik',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '100%',
          }}
        >
          {formatAddress(transaction.from)}
        </p>
        <div className="text-gray-300 text-xs mt-2 mb-1">To</div>
        <p
          className="text-[#4285F4] text-xs truncate max-w-[80px]"
          style={{
            fontFamily: 'Rubik',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '100%',
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
  const [sortBy, setSortBy] = useState<'Latest First' | 'Oldest First' | 'Highest Amount' | 'Lowest Amount'>('Latest First');

  // Mock transactions data - replace with actual data from props/store
  const mockTransactions: Transaction[] = [
    {
      id: '0xd4fe0f6f649371',
      userWallet: '0x742d35cc6628c532',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0x8ba1f109551bd432',
      amount: 1032,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 30), // 30 secs ago
      status: 'completed',
      type: 'transfer',
    },
    {
      id: '0xa5b2c8d9e1f2a3b4',
      userWallet: '0x123abc456def789',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0x987fed654cba321',
      amount: 562,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
      status: 'completed',
      type: 'deposit',
    },
    {
      id: '0xc7d8e9f0a1b2c3d4',
      userWallet: '0x456def789abc123',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0x321cba654fed987',
      amount: 1093,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      status: 'pending',
      type: 'withdrawal',
    },
    {
      id: '0xe9f0a1b2c3d4e5f6',
      userWallet: '0x789abc123def456',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0x654fed987cba321',
      amount: 111,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 mins ago
      status: 'completed',
      type: 'transfer',
    },
    {
      id: '0xf1a2b3c4d5e6f7a8',
      userWallet: '0xabc123def456789',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0x987cba321fed654',
      amount: 1805,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 mins ago
      status: 'completed',
      type: 'deposit',
    },
    {
      id: '0xb2c3d4e5f6a7b8c9',
      userWallet: '0xdef456789abc123',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0xcba321fed654987',
      amount: 2340,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
      status: 'completed',
      type: 'transfer',
    },
    {
      id: '0xd4e5f6a7b8c9d0e1',
      userWallet: '0x369abc147def258',
      from: '0xe22d537fdb83fcfcd87623454634542540788045',
      to: '0xfed654987cba321',
      amount: 890,
      currency: 'USDT',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 mins ago
      status: 'completed',
      type: 'withdrawal',
    },
  ];

  // Sort transactions based on selected option
  const sortedTransactions = [...mockTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'Latest First':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'Oldest First':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'Highest Amount':
        return b.amount - a.amount;
      case 'Lowest Amount':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  return (
    <GradientBorder
      className={cn(
        'transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5',
        className
      )}
    >
      <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3">
        <h3
          className="text-white truncate"
          style={{
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: 'clamp(14px, 2.5vw, 18px)',
            fontWeight: 450,
            lineHeight: '140%',
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
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(10px, 1.5vw, 12px)',
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
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(10px, 1.5vw, 12px)',
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
          <TransactionItem key={`${transaction.id}-${index}`} transaction={transaction} />
        ))}
      </div>
      </div>
    </GradientBorder>
  );
};

export default Transactions;
