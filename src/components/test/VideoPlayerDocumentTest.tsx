'use client';

import { useState } from 'react';
import CustomVideoPlayer from '../video/CustomVideoPlayer';
import { DocumentAttachment } from '../video/CustomVideoPlayer';

// Real online document URLs for testing
const SAMPLE_DOCUMENTS: DocumentAttachment[] = [
  {
    id: 'doc-1',
    title: 'React Documentation - Getting Started',
    url: 'https://react.dev/learn',
    type: 'doc',
    size: 'Web Page'
  },
  {
    id: 'doc-2',
    title: 'Sample PDF - Lorem Ipsum',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    size: '13 KB'
  },
  {
    id: 'doc-3',
    title: 'MDN Web Docs - JavaScript Guide',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    type: 'doc',
    size: 'Web Page'
  },
  {
    id: 'doc-4',
    title: 'HTML5 Specification (W3C)',
    url: 'https://www.w3.org/TR/html52/',
    type: 'doc',
    size: 'Web Page'
  },
  {
    id: 'doc-5',
    title: 'Sample Text File',
    url: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
    type: 'txt',
    size: '2 KB'
  }
];

const SAMPLE_VIDEOS_WITH_DOCS = [
  {
    id: 'video-1',
    title: 'React Fundamentals with Documentation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    documents: SAMPLE_DOCUMENTS.slice(0, 3), // First 3 documents
  },
  {
    id: 'video-2',
    title: 'Advanced JavaScript Concepts',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    documents: SAMPLE_DOCUMENTS.slice(1, 4), // Middle 3 documents
  },
  {
    id: 'video-3',
    title: 'Web Development Best Practices',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    documents: SAMPLE_DOCUMENTS, // All documents
  },
  {
    id: 'video-4',
    title: 'Video Without Documents',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    documents: [], // No documents to test empty state
  }
];

// Document-only content for testing
const DOCUMENT_ONLY_CONTENT = [
  {
    id: 'doc-content-1',
    title: 'Complete React Study Guide',
    type: 'document' as const,
    documents: [
      {
        id: 'guide-1',
        title: 'React Official Documentation',
        url: 'https://react.dev/learn',
        type: 'doc' as const,
        size: 'Web Page'
      },
      {
        id: 'guide-2',
        title: 'React Hooks API Reference',
        url: 'https://react.dev/reference/react',
        type: 'doc' as const,
        size: 'Web Page'
      },
      {
        id: 'guide-3',
        title: 'Sample PDF - Component Patterns',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'pdf' as const,
        size: '13 KB'
      }
    ]
  },
  {
    id: 'doc-content-2',
    title: 'JavaScript ES6+ Features',
    type: 'document' as const,
    documents: [
      {
        id: 'js-1',
        title: 'ES6 Features Overview',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        type: 'doc' as const,
        size: 'Web Page'
      },
      {
        id: 'js-2',
        title: 'Async/Await Tutorial',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
        type: 'doc' as const,
        size: 'Web Page'
      }
    ]
  },
  {
    id: 'doc-content-3',
    title: 'TypeScript Handbook',
    type: 'document' as const,
    documents: [
      {
        id: 'ts-1',
        title: 'TypeScript Documentation',
        url: 'https://www.typescriptlang.org/docs/',
        type: 'doc' as const,
        size: 'Web Page'
      },
      {
        id: 'ts-2',
        title: 'TypeScript Playground',
        url: 'https://www.typescriptlang.org/play',
        type: 'doc' as const,
        size: 'Interactive'
      }
    ]
  }
];

const VideoPlayerDocumentTest: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_VIDEOS_WITH_DOCS[0]);
  const [selectedDocContent, setSelectedDocContent] = useState(DOCUMENT_ONLY_CONTENT[0]);
  const [activeTab, setActiveTab] = useState<'video' | 'documents'>('video');

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

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
        return '📃';
      default:
        return '📁';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Video Player Document Integration Test
        </h1>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('video')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'video'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Videos with Documents
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Document-Only Content
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Selection Panel */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Video to Test
              </h2>
              <div className="space-y-3">
                {SAMPLE_VIDEOS_WITH_DOCS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedVideo.id === video.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-2">
                      {video.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      📹 Video + {video.documents.length} document{video.documents.length === 1 ? '' : 's'}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {video.documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {getDocumentIcon(doc.type)} {doc.type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player Panel */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Video Player with Documents
              </h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedVideo.title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    📁 {selectedVideo.documents.length} document{selectedVideo.documents.length === 1 ? '' : 's'} attached
                    {selectedVideo.documents.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        (Click the 📄 button in video controls to view)
                      </span>
                    )}
                  </div>
                </div>

                <CustomVideoPlayer
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  documents={selectedVideo.documents}
                  className="w-full aspect-video rounded-lg overflow-hidden"
                />

                {/* Document List for Reference */}
                {selectedVideo.documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Attached Documents:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedVideo.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => openDocument(doc.url)}
                        >
                          <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {doc.title}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {doc.type.toUpperCase()} • {doc.size}
                            </div>
                          </div>
                          <span className="text-gray-400">🔗</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Content Selection */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Document-Only Content
              </h2>
              <div className="space-y-3">
                {DOCUMENT_ONLY_CONTENT.map((content) => (
                  <button
                    key={content.id}
                    onClick={() => setSelectedDocContent(content)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedDocContent.id === content.id
                        ? 'bg-green-50 border-green-300 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-2">
                      {content.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      📚 {content.documents.length} document{content.documents.length === 1 ? '' : 's'}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {content.documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {getDocumentIcon(doc.type)} {doc.type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Viewer */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Document Collection Viewer
              </h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedDocContent.title}
                  </h3>
                  <div className="text-sm text-gray-600">
                    📁 Collection of {selectedDocContent.documents.length} document{selectedDocContent.documents.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedDocContent.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => openDocument(doc.url)}
                    >
                      <div className="text-3xl">{getDocumentIcon(doc.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-lg mb-1">
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium">{doc.type.toUpperCase()}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-sm font-medium">Open</span>
                        <span>🔗</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Testing Instructions:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click any document to open in a new tab</li>
                    <li>• Test with different document types (PDF, DOC, TXT)</li>
                    <li>• Verify all links open correctly</li>
                    <li>• Check responsive behavior on mobile devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-3">
            🧪 Testing Instructions
          </h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <div><strong>Video with Documents:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Play any video and look for the 📄 button in video controls</li>
              <li>Click the document button to see attached documents panel</li>
              <li>Click any document to open in new tab</li>
              <li>Test with videos that have different numbers of documents</li>
            </ul>
            
            <div className="mt-4"><strong>Document-Only Content:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Use the "Document-Only Content" tab for courses without video</li>
              <li>Click documents to open and verify they load correctly</li>
              <li>Test with different document types and sizes</li>
            </ul>

            <div className="mt-4"><strong>Real URLs Used:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>PDF: W3C sample PDF files</li>
              <li>DOC: React Documentation, MDN Web Docs</li>
              <li>TXT: Sample text files from textfiles.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerDocumentTest;
