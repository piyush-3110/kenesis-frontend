import React from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "warning" | "success" | "info";
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: "primary" | "danger" | "success";
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonVariant = "primary",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "info":
        return <AlertTriangle className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "info":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-yellow-500/10 border-yellow-500/20";
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses =
      "flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    switch (confirmButtonVariant) {
      case "danger":
        return `${baseClasses} bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-500/25`;
      case "success":
        return `${baseClasses} bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:shadow-green-500/25`;
      default:
        return `${baseClasses} bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white hover:shadow-lg hover:shadow-blue-500/25`;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getIcon()}
            <h2 className="text-lg font-semibold text-white break-words">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            // disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`p-4 rounded-lg border ${getIconBgColor()} mb-6`}>
            <p className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={getConfirmButtonClasses()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
