"use client";

import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onNotificationClick?: () => void;
  className?: string;
}

/**
 * TopBar Component
 * Top navigation bar for dashboard pages
 */
const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onNotificationClick,
  className,
}) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const handleNotificationClick = () => {
    setShowNotificationModal(true);
    onNotificationClick?.();
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="flex items-center justify-between p-4 lg:p-6">
          {/* Left side - Title */}
          <div className="flex-1">
            <h1
              className="text-white text-xl lg:text-2xl xl:text-3xl font-medium mb-1"
              style={{
                fontFamily: "CircularXX, Inter, sans-serif",
                fontWeight: 500,
                lineHeight: "100%",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-gray-400 text-sm lg:text-base"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  lineHeight: "140%",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Notification Button */}
            <button
              onClick={handleNotificationClick}
              className={cn(
                "relative p-2 lg:p-3 rounded-lg transition-all duration-200",
                "hover:bg-gray-800/50 hover:scale-105",
                "border border-gray-700/50 hover:border-blue-500/50"
              )}
            >
              <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 hover:text-blue-400 transition-colors duration-200" />

              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900">
                <div className="w-full h-full bg-red-500 rounded-full animate-pulse" />
              </div>
            </button>

            {/* Wallet Connect Button (enhanced) */}
            <SiweAuthButton variant="dashboard" />
          </div>
        </div>

        {/* Gradient bottom border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, #0680FF 0%, #010519 100%)",
          }}
        />
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNotificationModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md">
            {/* Decorative gradient elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl opacity-20" />
            
            <div className="w-full rounded-2xl p-1 bg-gradient-to-r from-blue-500 to-blue-600">
              <div 
                className="w-full h-full rounded-xl p-6 bg-gradient-to-b from-black to-gray-900/95 backdrop-blur-lg flex flex-col items-center text-center relative"
                style={{
                  boxShadow: '0 0 30px rgba(6, 128, 255, 0.2)',
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X size={20} />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                
                {/* Title with gradient */}
                <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Notifications
                </h2>
                
                {/* Description */}
                <p className="text-gray-300 text-base mb-6 max-w-sm">
                  The notification system is currently under development
                </p>
                
                {/* Timeline */}
                <div className="mb-6 bg-gray-800/50 px-4 py-2 rounded-full">
                  <p className="text-gray-300 text-sm">
                    <span className="text-blue-400 font-medium">Coming Soon</span>
                  </p>
                </div>

                {/* Decorative line */}
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full my-4 opacity-70" />
                
                {/* Close button */}
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
