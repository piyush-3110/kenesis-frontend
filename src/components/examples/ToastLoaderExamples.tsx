/**
 * Example implementation demonstrating proper toast & loader UX patterns
 * This component showcases all the critical user interactions with proper feedback
 */

'use client';

import React, { useState } from 'react';
import { 
  Loader2, 
  Upload, 
  Save, 
  Trash2, 
  Copy, 
  Download, 
  CreditCard,
  Mail,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { useLoading, useAsyncOperation, useFileUpload, useFormSubmission, LOADING_CONFIGS } from '@/hooks/useLoading';
import { useNetworkStatus, useClipboard } from '@/hooks/useNetworkStatus';
import { useUIStore } from '@/store/useUIStore';

const ToastLoaderExamples: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [file, setFile] = useState<File | null>(null);
  
  const { addToast } = useUIStore();
  const { isOnline, speed, isReconnecting } = useNetworkStatus();
  const { copyToClipboard } = useClipboard();

  // Authentication examples
  const loginOperation = useAsyncOperation(
    async (email: string, password: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (Math.random() > 0.7) throw new Error('Invalid credentials');
      return { user: { email }, token: 'jwt-token' };
    },
    LOADING_CONFIGS.LOGIN
  );

  const logoutOperation = useAsyncOperation(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return true;
    },
    LOADING_CONFIGS.LOGOUT
  );

  // Data mutation examples
  const profileForm = useFormSubmission(
    async (data: typeof formData) => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!data.name.trim()) throw new Error('Name is required');
      return { success: true };
    },
    {
      ...LOADING_CONFIGS.SAVE_PROFILE,
      validationFn: (data) => {
        if (!data.name.trim()) return 'Name is required';
        if (!data.email.includes('@')) return 'Valid email is required';
        return null;
      }
    }
  );

  const deleteOperation = useAsyncOperation(
    async (itemId: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (Math.random() > 0.8) throw new Error('Item is being used and cannot be deleted');
      return true;
    },
    LOADING_CONFIGS.DELETE_ITEM
  );

  // File upload example
  const fileUploadHook = useFileUpload();

  const handleFileUpload = async (selectedFile: File) => {
    await fileUploadHook.upload(selectedFile, async (file, onProgress) => {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        onProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      return { url: 'https://example.com/uploaded-file' };
    });
  };

  // Payment example
  const paymentOperation = useAsyncOperation(
    async (amount: number) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      if (Math.random() > 0.9) throw new Error('Payment failed. Please check your card details.');
      return { transactionId: 'tx_123456', amount };
    },
    LOADING_CONFIGS.PROCESS_PAYMENT
  );

  // Network-dependent operations
  const networkDependentOperation = useAsyncOperation(
    async () => {
      if (!isOnline) throw new Error('No internet connection');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { data: 'Network operation successful' };
    },
    {
      successMessage: 'Data synchronized successfully!',
      errorMessage: 'Failed to sync. Please check your connection.',
    }
  );

  // System events examples
  const handleCopyData = () => {
    const data = JSON.stringify({ user: 'john@example.com', id: 12345 }, null, 2);
    copyToClipboard(data, 'User data copied to clipboard!');
  };

  const handleComingSoonFeature = () => {
    addToast({
      type: 'info',
      message: 'Advanced analytics coming soon! Stay tuned.',
      duration: 4000,
    });
  };

  const handlePermissionDenied = () => {
    addToast({
      type: 'error',
      message: 'Access denied. Please contact admin for permissions.',
      duration: 6000,
    });
  };

  const handleBulkExport = async () => {
    const exportLoading = useLoading({
      successMessage: 'Export complete! Download will start automatically.',
      errorMessage: 'Export failed. Please try again.',
      showGlobalLoader: true,
    });

    try {
      exportLoading.startLoading('Preparing export...');
      
      // Simulate different stages
      await new Promise(resolve => setTimeout(resolve, 1000));
      exportLoading.updateStatus('Processing data...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      exportLoading.updateStatus('Generating file...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      exportLoading.stopLoading(true);
      
      // Trigger download
      const blob = new Blob(['export data'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.txt';
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      exportLoading.setError('Export failed. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Toast & Loader UX Examples
        </h1>
        <p className="text-gray-400">
          Comprehensive examples of proper loading states and user feedback
        </p>
        
        {/* Network Status Indicator */}
        <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm ${
          isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? (
            isReconnecting ? 'Reconnecting...' : `Online ${speed ? `(${speed})` : ''}`
          ) : (
            'Offline'
          )}
        </div>
      </div>

      {/* Authentication Section */}
      <section className="bg-gray-800/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Authentication</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => loginOperation.execute('user@example.com', 'password')}
            disabled={loginOperation.loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loginOperation.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <button
            onClick={() => logoutOperation.execute()}
            disabled={logoutOperation.loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {logoutOperation.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Logging out...
              </>
            ) : (
              'Logout'
            )}
          </button>
        </div>
      </section>

      {/* Form Submission Section */}
      <section className="bg-gray-800/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Form Submission</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={() => profileForm.submit(formData)}
            disabled={profileForm.loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {profileForm.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </section>

      {/* File Upload Section */}
      <section className="bg-gray-800/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">File Upload</h2>
        <div className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          
          {fileUploadHook.loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{fileUploadHook.status}</span>
                <span>{fileUploadHook.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fileUploadHook.progress || 0}%` }}
                />
              </div>
            </div>
          )}
          
          <button
            onClick={() => file && handleFileUpload(file)}
            disabled={!file || fileUploadHook.loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {fileUploadHook.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload File
              </>
            )}
          </button>
        </div>
      </section>

      {/* Data Operations Section */}
      <section className="bg-gray-800/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Data Operations</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => deleteOperation.execute('item-123')}
            disabled={deleteOperation.loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {deleteOperation.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Item
              </>
            )}
          </button>

          <button
            onClick={() => paymentOperation.execute(29.99)}
            disabled={paymentOperation.loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {paymentOperation.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Process Payment ($29.99)
              </>
            )}
          </button>

          <button
            onClick={() => networkDependentOperation.execute()}
            disabled={networkDependentOperation.loading || !isOnline}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {networkDependentOperation.loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Data'
            )}
          </button>

          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </section>

      {/* System Events Section */}
      <section className="bg-gray-800/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">System Events</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCopyData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Copy size={16} />
            Copy Data
          </button>

          <button
            onClick={handleComingSoonFeature}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <AlertCircle size={16} />
            Coming Soon Feature
          </button>

          <button
            onClick={handlePermissionDenied}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <AlertCircle size={16} />
            Permission Denied
          </button>
        </div>
      </section>

      {/* Toast Patterns Reference */}
      <section className="bg-gray-800/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Manual Toast Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => addToast({ type: 'success', message: 'Operation completed successfully!' })}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Success Toast
          </button>
          
          <button
            onClick={() => addToast({ type: 'error', message: 'Something went wrong. Please try again.' })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Error Toast
          </button>
          
          <button
            onClick={() => addToast({ type: 'warning', message: 'Session will expire in 5 minutes.' })}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Warning Toast
          </button>
          
          <button
            onClick={() => addToast({ type: 'info', message: 'New features are available in the dashboard.' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Info Toast
          </button>
        </div>
      </section>
    </div>
  );
};

export default ToastLoaderExamples;
