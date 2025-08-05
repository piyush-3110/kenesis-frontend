'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProductCreationWizard from './components/ProductCreationWizard';

/**
 * Products Page
 * Main page for product/course creation and management
 */
const ProductsPage: React.FC = () => {
  return (
    <DashboardLayout
      title="Create New Course"
      subtitle="Build and publish your educational content"
    >
      <div className="p-4 sm:p-6">
        <ProductCreationWizard />
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
