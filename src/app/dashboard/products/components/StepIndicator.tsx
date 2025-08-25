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
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Steps */}
      <div className="flex items-center justify-between relative overflow-x-auto pb-4">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-700 hidden sm:block">
          <div 
            className="h-full bg-gradient-to-r from-[#0680FF] to-[#022ED2] transition-all duration-500"
            style={{ 
              width: `${(getCurrentStepIndex() / (CREATION_STEPS.length - 1)) * 100}%` 
            }}
          />
        </div>

        {CREATION_STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative z-10 min-w-0 flex-1 px-2">
            {/* Step Circle */}
            <div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0",
                isStepCompleted(index) && "bg-gradient-to-r from-[#0680FF] to-[#022ED2] border-[#0680FF]",
                isStepActive(index) && "border-[#0680FF] bg-[#010519]",
                !isStepCompleted(index) && !isStepActive(index) && "border-gray-600 bg-[#010519]"
              )}
            >
              {isStepCompleted(index) ? (
                <Check className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              ) : (
                <span
                  className={cn(
                    "text-sm sm:text-lg font-semibold",
                    isStepActive(index) ? "text-[#0680FF]" : "text-gray-400"
                  )}
                >
                  {index + 1}
                </span>
              )}
            </div>

            {/* Step Label */}
            <div className="mt-2 sm:mt-3 text-center max-w-[80px] sm:max-w-[100px]">
              <div
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors truncate",
                  isStepActive(index) || isStepCompleted(index) 
                    ? "text-white" 
                    : "text-gray-400"
                )}
                title={step.label}
              >
                {step.label}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2 break-words hidden sm:block">
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
