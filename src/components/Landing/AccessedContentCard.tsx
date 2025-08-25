'use client';

import React from 'react';

interface AccessedContentCardProps {
  title: string;
}

const AccessedContentCard: React.FC<AccessedContentCardProps> = ({ title }) => {
  return (
    // Outer border layer
    <div
      className="p-[1px] rounded-md w-full max-w-sm"
      style={{
        backgroundImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
      }}
    >
      {/* Inner content layer with solid bg */}
      <div 
        className="bg-[#000526] rounded-md px-10 py-4 text-center transition-all duration-300 ease-in-out cursor-pointer"
        style={{
          background: '#000526',
          transition: 'all 0.3s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(0deg, #0C0A27 0.06%, #0036F6 100.06%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#000526';
        }}
      >
        <h3 className="font-poppins font-medium text-white text-xl mb-3">{title}</h3>

        <div
          className="h-[2px] w-full"
          style={{
            background: 'linear-gradient(90deg, #071347 0%, #73B8FF 50%, #070E33 100%)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default AccessedContentCard;
