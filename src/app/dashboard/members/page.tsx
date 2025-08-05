'use client';

import React from 'react';
import ComingSoon from '../components/ComingSoon';
import { Users } from 'lucide-react';

/**
 * Members Area Page
 * Temporary Coming Soon page for the Members Area feature
 */
const MembersAreaPage = () => {
  return (
    <ComingSoon
      title="Members Area Coming Soon"
      subtitle="Our exclusive members area is being built. Soon you'll be able to create subscription-based content, manage your community, and offer premium benefits to your loyal customers."
      estimatedRelease="Q4 2023"
      icon={<Users className="w-10 h-10 text-white" />}
    />
  );
};

export default MembersAreaPage;
