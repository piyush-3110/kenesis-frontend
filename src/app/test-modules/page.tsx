'use client';

import React from 'react';
import ModuleManagementSection from '../dashboard/my-products/[id]/components/ModuleManagementSectionNew';

// Test page to validate module management functionality
export default function TestModulesPage() {
  // Test course ID - you can replace this with an actual course ID for testing
  const testCourseId = "test-course-123";

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Module Management Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-300 mb-6">
            This page is for testing the module management integration. 
            Replace the testCourseId with an actual course ID to test with real data.
          </p>
          
          <ModuleManagementSection 
            courseId={testCourseId} 
            chapters={[
              { id: 'chapter-1', title: 'Test Chapter 1', moduleCount: 3, order: 1 },
              { id: 'chapter-2', title: 'Test Chapter 2', moduleCount: 5, order: 2 }
            ]}
            canEdit={true}
          />
        </div>
      </div>
    </div>
  );
}
