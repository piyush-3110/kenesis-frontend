import React from "react";

const ProductPageLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A071A]">
      <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-700 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-700 rounded w-1/4"></div>
              <div className="h-12 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageLoading;
