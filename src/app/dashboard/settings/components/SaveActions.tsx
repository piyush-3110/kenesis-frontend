'use client';

import React from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * SaveActions Component
 * Handles save/cancel actions for settings with loading states
 */
const SaveActions: React.FC = () => {
  const { 
    hasUnsavedChanges, 
    isSaving, 
    saveSettings, 
    resetChanges 
  } = useSettingsStore();

  const handleSave = async () => {
    try {
      await saveSettings();
      // Show success feedback (you could add a toast notification here)
    } catch (error) {
      // Error is handled by the store
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (confirmed) {
        resetChanges();
      }
    }
  };

  // Don't show actions if no changes have been made
  if (!hasUnsavedChanges && !isSaving) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-3 py-4">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSaving}
        className="
          px-6 py-2 border border-gray-600 rounded-lg text-gray-300 
          hover:text-white hover:border-gray-500 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
        style={{
          fontFamily: 'Inter',
          fontSize: '14.03px',
          fontWeight: 500,
        }}
      >
        <div className="flex items-center gap-2">
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </div>
      </button>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="
          px-6 py-2 rounded-lg text-white font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          hover:shadow-lg hover:shadow-blue-500/25
        "
        style={{
          background: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
          fontFamily: 'Inter',
          fontSize: '14.03px',
          fontWeight: 500,
        }}
      >
        <div className="flex items-center gap-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default SaveActions;
