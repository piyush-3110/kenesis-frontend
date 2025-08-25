"use client";

import React, { useState, ReactNode, useEffect } from "react";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Delay unmounting for animation when hiding tooltip
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isVisible) {
      setShouldRender(true);
    } else {
      timeoutId = setTimeout(() => setShouldRender(false), 200);
    }
    return () => clearTimeout(timeoutId);
  }, [isVisible]);

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent";
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0} // Make focusable for accessibility
    >
      {children}

      {shouldRender && (
        <div
          className={`absolute z-50 ${getPositionClasses()} pointer-events-none w-xs`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateY(0) scale(1)"
              : "translateY(10px) scale(0.95)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-600/20 backdrop-blur-sm">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
            style={{ pointerEvents: "none" }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
