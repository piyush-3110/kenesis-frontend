'use client';

import React from 'react';
import ComingSoon from '../components/ComingSoon';
import { TrendingUp } from 'lucide-react';

/**
 * Sales Page
 * Temporary Coming Soon page for the Sales feature
 */
const SalesPage = () => {
  return (
    <ComingSoon
      title="Sales Dashboard Coming Soon"
      subtitle="Our comprehensive sales analytics platform is in development. Track your revenue, analyze sales trends, and get detailed reports on your products' performance."
      estimatedRelease="Q3 2023"
      icon={<TrendingUp className="w-10 h-10 text-white" />}
    />
  );
};

export default SalesPage;
