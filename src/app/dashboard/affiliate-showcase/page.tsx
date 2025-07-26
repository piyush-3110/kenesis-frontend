'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AffiliateShowcaseContainer from './components/AffiliateShowcaseContainer';

/**
 * Affiliate Showcase Page
 * Main page for browsing and promoting affiliate products
 */
const AffiliateShowcasePage: React.FC = () => {
  return (
    <DashboardLayout
      title="Affiliate Showcase"
      subtitle="Discover and promote high-converting products"
    >
      <AffiliateShowcaseContainer />
    </DashboardLayout>
  );
};

export default AffiliateShowcasePage;
