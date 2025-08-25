'use client';

import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { DASHBOARD_COLORS } from '../../../constants';

interface DeleteChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chapter: {
    id: string;
    title: string;
    moduleCount?: number;
    modules?: any[];
  };
  loading?: boolean;
}

/**
 * Delete Chapter Confirmation Modal
 * Shows warning about modules and requirements
 */
const DeleteChapterModal: React.FC<DeleteChapterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chapter,
  loading = false
}) => {
  if (!isOpen) return null;

  const moduleCount = chapter.moduleCount || chapter.modules?.length || 0;
  const hasModules = moduleCount > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: DASHBOARD_COLORS.CARD_BG,
          border: `1px solid ${DASHBOARD_COLORS.PRIMARY_BORDER.replace('linear-gradient(90deg, ', '').replace(' 0%, ', '').replace(' 100%)', '').split(' ')[0]}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white break-words">Delete Chapter</h2>
              <p className="text-sm text-gray-400 break-words">Confirm chapter deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700 disabled:opacity-50 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-white font-medium mb-2 break-words">
              Are you sure you want to delete this chapter?
            </h3>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-300 font-medium break-words">{chapter.title}</p>
            </div>
          </div>

          {hasModules ? (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-red-400 font-medium mb-1 break-words">Warning: Chapter Contains Modules</h4>
                  <p className="text-red-300 text-sm mb-2 break-words">
                    This chapter contains <strong>{moduleCount} module(s)</strong>. 
                  </p>
                  <p className="text-red-300 text-sm break-words">
                   All the modules inside will be deleted too.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-yellow-400 font-medium mb-1 break-words">Warning</h4>
                  <p className="text-yellow-300 text-sm break-words">
                    This action cannot be undone. The chapter will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-400 text-sm break-words">
            {hasModules 
              ? 'All the module inside will be deleted too. Please ensure you have backed up any important data before proceeding.'
              : 'Please confirm that you want to proceed with this deletion.'
            }
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
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              hasModules 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
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
                {hasModules ? 'Try Delete Anyway' : 'Delete Chapter'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChapterModal;
