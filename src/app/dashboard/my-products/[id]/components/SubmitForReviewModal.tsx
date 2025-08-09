'use client';

import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle } from 'lucide-react';

interface SubmitForReviewModalProps {
  onClose: () => void;
  onSubmit: (message?: string) => Promise<void>;
}

/**
 * Submit For Review Modal
 * Allows instructors to submit their course for admin review
 */
const SubmitForReviewModal: React.FC<SubmitForReviewModalProps> = ({ onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acknowledged) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirements = [
    'Course has at least one chapter with modules',
    'All modules have proper content (video or document files)',
    'Course metadata is complete (title, description, learning outcomes)',
    'Thumbnail and preview video are uploaded',
    'Course content follows platform guidelines',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Submit Course for Review</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-yellow-400 font-medium mb-2">Important Notice</h3>
                <p className="text-yellow-300 text-sm">
                  Once submitted, your course will be reviewed by our team. During the review process, 
                  you will not be able to make changes to the course content. Please ensure everything 
                  is complete before submitting.
                </p>
              </div>
            </div>
          </div>

          {/* Requirements Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pre-submission Checklist</h3>
            <div className="space-y-3">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-gray-300 text-sm">{requirement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Process Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Review Process</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Content Review</p>
                  <p className="text-gray-400">Our team will review your course content for quality and compliance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Technical Check</p>
                  <p className="text-gray-400">We'll verify all files are accessible and properly formatted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Final Decision</p>
                  <p className="text-gray-400">Your course will be approved, published, or sent back with feedback</p>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Message */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add any additional notes for the review team..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-400">
                {message.length}/500 characters
              </p>
            </div>

            {/* Acknowledgment */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acknowledge"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="acknowledge" className="text-sm text-gray-300">
                I acknowledge that I have reviewed all course content and confirm it meets the platform guidelines. 
                I understand that the course will be locked during the review process.
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!acknowledged || isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitForReviewModal;
