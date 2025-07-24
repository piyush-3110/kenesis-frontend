'use client';

import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import { DASHBOARD_COLORS } from './constants';

/**
 * Dashboard Page
 * Main dashboard overview page
 */
const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-white mb-2"
            style={{
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '28.69px',
              fontWeight: 500,
              lineHeight: '100%',
            }}
          >
            Dashboard Overview
          </h1>
          <p
            className="text-gray-400"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '140%',
            }}
          >
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Revenue */}
          <div
            className="p-6 rounded-lg border"
            style={{
              background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
              borderImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1',
            }}
          >
            <h3
              className="text-white mb-2"
              style={{
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '20.5px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              Today's Revenue
            </h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">$15,000,000</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">↗ 12.5%</span>
                  <span className="text-gray-400 text-sm">from yesterday</span>
                </div>
              </div>
              <div className="w-16 h-8 bg-gradient-to-r from-blue-500/20 to-transparent rounded">
                {/* Mini chart placeholder */}
              </div>
            </div>
          </div>

          {/* Today's Orders */}
          <div
            className="p-6 rounded-lg border"
            style={{
              background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
              borderImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1',
            }}
          >
            <h3
              className="text-white mb-2"
              style={{
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '20.5px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              Today's Orders
            </h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">1,234</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">↗ 8.2%</span>
                  <span className="text-gray-400 text-sm">from yesterday</span>
                </div>
              </div>
              <div className="w-16 h-8 bg-gradient-to-r from-green-500/20 to-transparent rounded">
                {/* Mini chart placeholder */}
              </div>
            </div>
          </div>

          {/* Today's Visitors */}
          <div
            className="p-6 rounded-lg border"
            style={{
              background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
              borderImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1',
            }}
          >
            <h3
              className="text-white mb-2"
              style={{
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '20.5px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              Today's Visitors
            </h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">45,678</div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm">↘ 3.1%</span>
                  <span className="text-gray-400 text-sm">from yesterday</span>
                </div>
              </div>
              <div className="w-16 h-8 bg-gradient-to-r from-red-500/20 to-transparent rounded">
                {/* Mini chart placeholder */}
              </div>
            </div>
          </div>
        </div>

        {/* Sales Analytics and Latest Transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sales Analytics */}
          <div
            className="xl:col-span-2 p-6 rounded-lg border"
            style={{
              background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
              borderImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-white"
                style={{
                  fontFamily: 'CircularXX, Inter, sans-serif',
                  fontSize: '20.5px',
                  fontWeight: 450,
                  lineHeight: '140%',
                }}
              >
                Sales Analytics
              </h3>
              <div className="flex gap-2">
                {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((tab, index) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      index === 2 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-400">
              {/* Chart component would go here */}
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p>Sales chart visualization</p>
              </div>
            </div>
          </div>

          {/* Latest Transactions */}
          <div
            className="p-6 rounded-lg border"
            style={{
              background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
              borderImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1',
            }}
          >
            <h3
              className="text-white mb-6"
              style={{
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '20.5px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              Latest Transactions
            </h3>
            
            <div className="space-y-4">
              {/* Transaction 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">K</span>
                  </div>
                  <div>
                    <p
                      className="text-white text-sm"
                      style={{
                        fontFamily: 'Rubik, monospace',
                        fontSize: '14px',
                      }}
                    >
                      0x742d...c532
                    </p>
                    <p className="text-gray-400 text-xs">From: 0x8ba1...d432</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full">
                  <span className="text-black font-bold text-sm">2.5 ETH</span>
                </div>
              </div>

              {/* Transaction 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">K</span>
                  </div>
                  <div>
                    <p
                      className="text-white text-sm"
                      style={{
                        fontFamily: 'Rubik, monospace',
                        fontSize: '14px',
                      }}
                    >
                      0x123a...f789
                    </p>
                    <p className="text-gray-400 text-xs">From: 0x987f...a321</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full">
                  <span className="text-black font-bold text-sm">1000 USDC</span>
                </div>
              </div>

              {/* Transaction 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">K</span>
                  </div>
                  <div>
                    <p
                      className="text-white text-sm"
                      style={{
                        fontFamily: 'Rubik, monospace',
                        fontSize: '14px',
                      }}
                    >
                      0x456d...c123
                    </p>
                    <p className="text-gray-400 text-xs">From: 0x321c...d987</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full">
                  <span className="text-black font-bold text-sm">0.8 ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
