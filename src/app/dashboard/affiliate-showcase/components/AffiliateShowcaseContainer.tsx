'use client';

import React, { useEffect } from 'react';
import { useAffiliateShowcaseStore } from '../store/useAffiliateShowcaseStore';
import FilterTabs from './FilterTabs';
import SearchBar from './SearchBar';
import ProductGrid from './ProductGrid';
import LoadingState from './LoadingState';
import ToastContainer from './ToastContainer';
import { useToastStore } from '../store/useToastStore';
import { AFFILIATE_COLORS } from '../constants';

/**
 * AffiliateShowcaseContainer Component
 * Main container for the affiliate showcase section
 */
const AffiliateShowcaseContainer: React.FC = () => {
  const { isLoading, loadProducts } = useAffiliateShowcaseStore();
  const { toasts } = useToastStore();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6">
      {/* Main Content Container */}
      <div 
        className="w-full rounded-xl p-6 relative overflow-hidden"
        style={{
          background: AFFILIATE_COLORS.PRIMARY_BG,
        }}
      >
        {/* Border with gradient - using a wrapper to avoid border spreading */}
        <div 
          className="absolute inset-0 rounded-xl p-[1px]"
          style={{
            background: AFFILIATE_COLORS.PRIMARY_BORDER,
          }}
        >
          <div 
            className="w-full h-full rounded-xl"
            style={{
              background: AFFILIATE_COLORS.PRIMARY_BG,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <FilterTabs />
            <SearchBar />
          </div>

          {/* Product Grid */}
          <ProductGrid />
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default AffiliateShowcaseContainer;
