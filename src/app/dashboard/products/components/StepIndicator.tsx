'use client';

import React from 'react';
import { useProductCreationStore } from '../store/useProductCreationStore';
import { CREATION_STEPS } from '../constants';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StepIndicator Component
 * Shows progress through the course creation steps with blue gradient design
 */
const StepIndicator: React.FC = () => {
  const { currentStep } = useProductCreationStore();

  const getCurrentStepIndex = () => {
    return CREATION_STEPS.findIndex(step => step.id === currentStep);
  };

  const isStepCompleted = (stepIndex: number) => {
    return stepIndex < getCurrentStepIndex();
  };

  const isStepActive = (stepIndex: number) => {
    return stepIndex === getCurrentStepIndex();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-[#0680FF] to-[#022ED2] transition-all duration-500"
            style={{ 
              width: `${(getCurrentStepIndex() / (CREATION_STEPS.length - 1)) * 100}%` 
            }}
          />
        </div>

        {CREATION_STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative z-10">
            {/* Step Circle */}
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                isStepCompleted(index) && "bg-gradient-to-r from-[#0680FF] to-[#022ED2] border-[#0680FF]",
                isStepActive(index) && "border-[#0680FF] bg-[#010519]",
                !isStepCompleted(index) && !isStepActive(index) && "border-gray-600 bg-[#010519]"
              )}
            >
              {isStepCompleted(index) ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <span
                  className={cn(
                    "text-lg font-semibold",
                    isStepActive(index) ? "text-[#0680FF]" : "text-gray-400"
                  )}
                >
                  {index + 1}
                </span>
              )}
            </div>

            {/* Step Label */}
            <div className="mt-3 text-center">
              <div
                className={cn(
                  "text-sm font-medium transition-colors",
                  isStepActive(index) || isStepCompleted(index) 
                    ? "text-white" 
                    : "text-gray-400"
                )}
              >
                {step.label}
              </div>
              <div className="text-xs text-gray-500 mt-1 max-w-24">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
