'use client';

import React from 'react';
import { useProductCreationStore } from '../store/useProductCreationStore';
import StepIndicator from './StepIndicator';
import CourseCreationForm from './CourseCreationForm';
import ChapterCreationForm from './ChapterCreationForm';
import ModuleCreationForm from './ModuleCreationForm';
import CourseReview from './CourseReview';

/**
 * ProductCreationWizard Component
 * Multi-step wizard for creating courses with chapters and modules
 */
const ProductCreationWizard: React.FC = () => {
  const { currentStep } = useProductCreationStore();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'course':
        return <CourseCreationForm />;
      case 'chapters':
        return <ChapterCreationForm />;
      case 'modules':
        return <ModuleCreationForm />;
      case 'review':
        return <CourseReview />;
      default:
        return <CourseCreationForm />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Step Indicator */}
      <StepIndicator />
      
      {/* Current Step Content */}
      <div className="min-h-[600px]">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default ProductCreationWizard;
