'use client';

import React from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';

// Test data with real online document URLs
const testDocuments = [
  {
    id: '1',
    title: 'JavaScript Fundamentals Guide',
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    type: 'pdf' as const,
    size: '2.1 MB'
  },
  {
    id: '2',
    title: 'React Documentation',
    url: 'https://reactjs.org/docs/getting-started.html',
    type: 'other' as const,
    size: 'Online'
  },
  {
    id: '3',
    title: 'Web Development Basics',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/intro',
    type: 'other' as const,
    size: 'Web Page'
  },
  {
    id: '4',
    title: 'Sample PDF Document',
    url: 'https://www.w3.org/WAI/WCAG21/Understanding/intro.pdf',
    type: 'pdf' as const,
    size: '1.5 MB'
  },
  {
    id: '5',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/',
    type: 'other' as const,
    size: 'Online'
  }
];

const VideoPlayerTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Custom Video Player with Document Support
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Features Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-2">Video Controls:</h3>
              <ul className="space-y-1">
                <li>• Play/Pause (Space)</li>
                <li>• Skip forward/backward (Arrow keys)</li>
                <li>• Volume control (Up/Down arrows)</li>
                <li>• Mute/Unmute (M key)</li>
                <li>• Fullscreen (F key)</li>
                <li>• Playback speed control</li>
                <li>• Download video</li>
                <li>• Restart video</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Document Support:</h3>
              <ul className="space-y-1">
                <li>• View attached documents</li>
                <li>• Multiple document types (PDF, DOC, etc.)</li>
                <li>• Open documents in new tab</li>
                <li>• Document type indicators</li>
                <li>• File size display</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="aspect-video">
          <CustomVideoPlayer
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            title="Big Buck Bunny - Sample Video"
            poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
            documents={testDocuments}
            className="w-full h-full"
            onProgress={(progress) => {
              console.log('Video progress:', progress);
            }}
            onEnded={() => {
              console.log('Video ended');
            }}
          />
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Attached Documents ({testDocuments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {doc.type === 'pdf' ? '📄' : '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {doc.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {doc.type.toUpperCase()} • {doc.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(doc.url, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
                >
                  Open Document
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
            <div>
              <div className="flex justify-between py-1">
                <span>Play/Pause:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">Space</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Skip Backward:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">←</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Skip Forward:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">→</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-1">
                <span>Volume Up:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">↑</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Volume Down:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">↓</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Mute/Unmute:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">M</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Fullscreen:</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">F</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerTest;
