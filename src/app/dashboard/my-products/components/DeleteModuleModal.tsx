'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Shield } from 'lucide-react';
import { DASHBOARD_COLORS } from '../../constants';

interface DeleteModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (force: boolean) => void;
  module: {
    id: string;
    title: string;
    type?: string;
    duration?: number;
    isPreview?: boolean;
  };
  loading?: boolean;
  canForceDelete?: boolean; // Only show force option if user has permissions
}

/**
 * Delete Module Confirmation Modal
 * Shows options for soft/hard delete with proper warnings
 * Following the API documentation for delete module functionality
 */
const DeleteModuleModal: React.FC<DeleteModuleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  module,
  loading = false,
  canForceDelete = false
}) => {
  const [forceDelete, setForceDelete] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(forceDelete);
    setForceDelete(false); // Reset for next time
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{
          background: DASHBOARD_COLORS.CARD_BG,
          border: `1px solid ${DASHBOARD_COLORS.PRIMARY_BORDER.replace('linear-gradient(90deg, ', '').replace(' 0%, ', '').replace(' 100%)', '').split(' ')[0]}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${forceDelete ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <AlertTriangle className={forceDelete ? 'text-red-400' : 'text-yellow-400'} size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Delete Module</h2>
              <p className="text-sm text-gray-400">
                {forceDelete ? 'Permanent deletion' : 'Soft deletion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">
              Are you sure you want to delete this module?
            </h3>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-300 font-medium">{module.title}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="capitalize">{module.type || 'Unknown'}</span>
                {module.duration && <span>{formatDuration(module.duration)}</span>}
                {module.isPreview && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Preview
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delete Type Selection */}
          {canForceDelete && (
            <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Shield size={16} />
                Deletion Type
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    checked={!forceDelete}
                    onChange={() => setForceDelete(false)}
                    disabled={loading}
                    className="mt-1 text-blue-500"
                  />
                  <div>
                    <div className="text-white font-medium">Soft Delete (Recommended)</div>
                    <div className="text-gray-400 text-sm">
                      Module will be marked as deleted but can potentially be recovered
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    checked={forceDelete}
                    onChange={() => setForceDelete(true)}
                    disabled={loading}
                    className="mt-1 text-red-500"
                  />
                  <div>
                    <div className="text-white font-medium">Hard Delete (Permanent)</div>
                    <div className="text-red-300 text-sm">
                      Module will be permanently deleted and cannot be recovered
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className={`mb-6 p-4 border rounded-lg ${
            forceDelete 
              ? 'bg-red-500/10 border-red-500/20' 
              : 'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={forceDelete ? 'text-red-400' : 'text-yellow-400'} size={16} />
              <div>
                <h4 className={`font-medium mb-1 ${forceDelete ? 'text-red-400' : 'text-yellow-400'}`}>
                  {forceDelete ? 'Permanent Deletion Warning' : 'Deletion Warning'}
                </h4>
                <p className={`text-sm ${forceDelete ? 'text-red-300' : 'text-yellow-300'}`}>
                  {forceDelete 
                    ? 'This action cannot be undone. The module and all its content will be permanently removed from the system.'
                    : 'This action will remove the module from the course. This action cannot be undone through the interface.'
                  }
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            Please confirm that you want to proceed with this deletion.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              forceDelete 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                {forceDelete ? 'Delete Permanently' : 'Delete Module'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModuleModal;
