'use client';

import React from 'react';
import ComingSoon from '../components/ComingSoon';
import { Flame } from 'lucide-react';

/**
 * Hot Leads Page
 * Temporary Coming Soon page for the Hot Leads feature
 */
const HotLeadsPage = () => {
  return (
    <ComingSoon
      title="Hot Leads Coming Soon"
      subtitle="Our advanced lead generation and tracking system is under development. Soon you'll be able to identify high-potential prospects, track conversions, and optimize your marketing strategies."
      estimatedRelease="Q4 2023"
      icon={<Flame className="w-10 h-10 text-white" />}
    />
  );
};

export default HotLeadsPage;
