'use client';

import React from 'react';
import { DocumentCourseViewer } from '@/components/document/DocumentViewer';
import type { DocumentAttachment } from '@/components/document/DocumentViewer';

// Test data with real online document URLs
const testDocuments: DocumentAttachment[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals Guide',
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    type: 'pdf',
    size: '2.1 MB',
    description: 'Complete guide to JavaScript fundamentals and advanced concepts'
  },
  {
    id: '2',
    title: 'Web Development Best Practices',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    size: '87 KB',
    description: 'Industry best practices for modern web development'
  },
  {
    id: '3',
    title: 'Sample Excel Spreadsheet',
    url: 'https://file-examples.com/storage/fe6ad6e2b6e4a06b54b58b3/2017/10/file_example_XLSX_10.xlsx',
    type: 'xlsx',
    size: '13 KB',
    description: 'Example data analysis spreadsheet with sample data'
  },
  {
    id: '4',
    title: 'Project Planning Document',
    url: 'https://calibre-ebook.com/downloads/demos/demo.docx',
    type: 'docx',
    size: '156 KB',
    description: 'Template for project planning and management'
  },
  {
    id: '5',
    title: 'Presentation Template',
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kaleidoscope.ppt',
    type: 'ppt',
    size: '2.8 MB',
    description: 'Professional presentation template with examples'
  },
  {
    id: '6',
    title: 'Configuration File',
    url: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
    type: 'txt',
    size: '4 KB',
    description: 'Sample configuration file with documentation'
  },
  {
    id: '7',
    title: 'React Documentation',
    url: 'https://react.dev/learn',
    type: 'other',
    size: 'Online',
    description: 'Official React.js documentation and learning resources'
  },
  {
    id: '8',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/',
    type: 'other',
    size: 'Online',
    description: 'Complete TypeScript documentation and examples'
  }
];

const DocumentCourseTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Document Course Viewer Test
          </h1>
          <p className="mt-2 text-gray-600">
            Testing document viewer functionality with various file types and online resources
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Document Viewer Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">Supported Formats:</h3>
              <ul className="space-y-1">
                <li>• PDF - In-browser viewing with PDF.js</li>
                <li>• DOCX - Microsoft Word documents</li>
                <li>• XLSX - Excel spreadsheets</li>
                <li>• PPT - PowerPoint presentations</li>
                <li>• TXT - Plain text files</li>
                <li>• Web Pages - Online documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Viewer Actions:</h3>
              <ul className="space-y-1">
                <li>• View - Open in modal viewer</li>
                <li>• Open - Open in new browser tab</li>
                <li>• Download - Download file (when supported)</li>
                <li>• Full-screen viewing</li>
                <li>• Print support (for PDFs)</li>
                <li>• Zoom controls (for supported formats)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DocumentCourseViewer documents={testDocuments} />
        </div>

        {/* Testing Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-3">
            Testing Notes
          </h2>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>PDF Files:</strong> Should display directly in the browser using native PDF viewer or PDF.js
            </p>
            <p>
              <strong>Office Documents:</strong> May require download or external viewer depending on browser capabilities
            </p>
            <p>
              <strong>Text Files:</strong> Should display directly in an iframe
            </p>
            <p>
              <strong>Web Pages:</strong> Open in new tab for best experience
            </p>
            <p>
              <strong>Unsupported Types:</strong> Will show download option and external link
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCourseTest;
