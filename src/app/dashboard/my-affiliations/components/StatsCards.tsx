'use client';

import React from 'react';
import { TrendingUp, DollarSign, MousePointer, Target, Package, CheckCircle } from 'lucide-react';
import { AffiliationStats } from '../types';

interface StatsCardsProps {
  stats: AffiliationStats | null;
  loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const statsData = [
    {
      title: 'Total Affiliations',
      value: stats?.totalAffiliations || 0,
      icon: Package,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Products',
      value: stats?.activeAffiliations || 0,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: DollarSign,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Clicks',
      value: (stats?.totalClicks || 0).toLocaleString(),
      icon: MousePointer,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Conversions',
      value: stats?.totalConversions || 0,
      icon: Target,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(stats?.conversionRate || 0),
      icon: TrendingUp,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border border-gray-700/50 p-6">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <p className="text-white text-2xl font-bold">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
