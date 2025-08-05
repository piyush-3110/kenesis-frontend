'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  subtitle?: string;
  estimatedRelease?: string;
  icon?: React.ReactNode;
}

/**
 * Coming Soon Page Component
 * Displays a stylish "Coming Soon" message for features that are under development
 */
const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  subtitle = 'This feature is currently under development',
  estimatedRelease,
  icon,
}) => {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative gradient elements */}
      <div className="absolute top-40 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl opacity-20 -z-10" />
      
      <div className="w-full max-w-2xl rounded-2xl p-1 bg-gradient-to-r from-blue-500 to-blue-600">
        <div 
          className="w-full h-full rounded-xl p-8 md:p-12 bg-gradient-to-b from-black to-gray-900/95 backdrop-blur-lg flex flex-col items-center text-center"
          style={{
            boxShadow: '0 0 30px rgba(6, 128, 255, 0.2)',
          }}
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-6">
            {icon || (
              <span className="text-white text-3xl font-bold">K</span>
            )}
          </div>
          
          {/* Title with gradient */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 max-w-lg">
            {subtitle}
          </p>
          
          {/* Timeline */}
          {estimatedRelease && (
            <div className="mb-8 bg-gray-800/50 px-6 py-3 rounded-full">
              <p className="text-gray-300">
                <span className="text-blue-400 font-medium">Estimated Release:</span> {estimatedRelease}
              </p>
            </div>
          )}

          {/* Decorative line */}
          <div className="w-40 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full my-6 opacity-70" />
          
          {/* Go back button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full transition-all duration-300 mt-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
      
      {/* Footer text */}
      <p className="text-gray-500 mt-8 text-sm">
        We're working hard to bring you the best experience. Stay tuned!
      </p>
    </div>
  );
};

export default ComingSoon;
