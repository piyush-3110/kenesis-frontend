'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  File, 
  Download, 
  ExternalLink, 
  Eye,
  X} from 'lucide-react';

interface DocumentAttachment {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'txt' | 'xlsx' | 'other';
  size?: string;
  description?: string;
}

interface DocumentViewerProps {
  document: DocumentAttachment;
  onClose: () => void;
  className?: string;
}

interface DocumentListProps {
  documents: DocumentAttachment[];
  onDocumentSelect: (document: DocumentAttachment) => void;
  className?: string;
}

const getDocumentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'ppt':
    case 'pptx':
      return '📊';
    case 'txt':
      return '📋';
    case 'xlsx':
    case 'xls':
      return '📈';
    default:
      return '📄';
  }
};

const getDocumentColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'doc':
    case 'docx':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ppt':
    case 'pptx':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'txt':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'xlsx':
    case 'xls':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Document viewer modal component
const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPDF = document.type.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(document.type.toLowerCase());
  const isText = document.type.toLowerCase() === 'txt';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load document');
  };

  const openInNewTab = () => {
    window.open(document.url, '_blank');
  };

  return (
    <div className={`fixed inset-0 pt-24 z-[9999] bg-black/80 backdrop-blur-sm ${className}`}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getDocumentIcon(document.type)}</span>
            <div>
              <h2 className="text-lg font-semibold">{document.title}</h2>
              <p className="text-sm text-gray-300">
                {document.type.toUpperCase()} {document.size && `• ${document.size}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={openInNewTab}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Open in New Tab
            </button>
            
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-700 p-2 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading document...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <File size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium mb-2">Unable to display document</p>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={openInNewTab}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {isPDF && (
            <iframe
              src={`${document.url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={document.title}
            />
          )}

          {/* Text Viewer */}
          {isText && (
            <iframe
              src={document.url}
              className="w-full h-full border-0 bg-white"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={document.title}
            />
          )}

          {/* Generic Document Viewer */}
          {!isPDF && !isText && !isImage && (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center max-w-md mx-auto p-8">
                <span className="text-6xl mb-4 block">{getDocumentIcon(document.type)}</span>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{document.title}</h3>
                <p className="text-gray-600 mb-6">
                  This document type ({document.type.toUpperCase()}) requires an external application to view.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={openInNewTab}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={20} />
                    Open in New Tab
                  </button>
                  <a
                    href={document.url}
                    download
                    className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download File
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Document list component for course content
const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentSelect,
  className = ''
}) => {
  if (documents.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">No documents available</p>
        <p className="text-gray-500">Documents will appear here when added to the course.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Course Documents</h2>
      
      <div className="grid gap-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl ${getDocumentColor(document.type)}`}>
                {getDocumentIcon(document.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {document.title}
                </h3>
                {document.description && (
                  <p className="text-gray-600 text-sm mb-2">
                    {document.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium">{document.type.toUpperCase()}</span>
                  {document.size && <span>{document.size}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDocumentSelect(document)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  View
                </button>
                
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Open
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main document course viewer component
const DocumentCourseViewer: React.FC<{
  documents: DocumentAttachment[];
  className?: string;
}> = ({ documents, className = '' }) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentAttachment | null>(null);

  return (
    <div className={className}>
      <DocumentList
        documents={documents}
        onDocumentSelect={setSelectedDocument}
      />
      
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export { DocumentViewer, DocumentList, DocumentCourseViewer };
export type { DocumentAttachment };
