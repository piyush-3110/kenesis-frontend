'use client';

import React from 'react';
import { useAffiliateShowcaseStore } from '../store/useAffiliateShowcaseStore';
import ProductCard from './ProductCard';
import ErrorState from './ErrorState';
import { AFFILIATE_COLORS } from '../constants';

/**
 * ProductGrid Component
 * Grid layout for displaying affiliate products with error handling
 */
const ProductGrid: React.FC = () => {
  const { 
    filteredProducts, 
    searchQuery, 
    activeFilter, 
    error, 
    loadProducts,
    clearError 
  } = useAffiliateShowcaseStore();

  const handleRetry = () => {
    clearError();
    loadProducts();
  };

  // Show error state if there's an error
  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={handleRetry}
      />
    );
  }

  // Show message when no products match filters
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8v8m0 0V4m0 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </div>
          <h3
            className="mb-2"
            style={{
              color: AFFILIATE_COLORS.TEXT_PRIMARY,
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            No products found
          </h3>
          <p
            style={{
              color: AFFILIATE_COLORS.TEXT_SECONDARY,
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 450,
            }}
          >
            {searchQuery
              ? `No products match &quot;${searchQuery}&quot; in the ${activeFilter === 'all' ? 'all categories' : activeFilter} section.`
              : `No ${activeFilter === 'all' ? '' : activeFilter + ' '}products available at the moment.`}
          </p>
          <p
            className="mt-2"
            style={{
              color: AFFILIATE_COLORS.TEXT_SECONDARY,
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 450,
            }}
          >
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p
          style={{
            color: AFFILIATE_COLORS.TEXT_SECONDARY,
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 450,
          }}
        >
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span className="ml-1">
              for &quot;{searchQuery}&quot;
            </span>
          )}
          {activeFilter !== 'all' && (
            <span className="ml-1">
              in {activeFilter} category
            </span>
          )}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
