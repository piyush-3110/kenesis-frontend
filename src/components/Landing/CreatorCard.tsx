'use client';

import Image from 'next/image';
import React from 'react';

type Creator = {
  name: string;
  totalSales: number;
  avatar: string;
  rank: number;
};

const CreatorCard: React.FC<Creator> = ({ name, totalSales, avatar, rank }) => {
  return (
    <div
      className="p-[1px] rounded-xl w-full h-full max-w-xs relative"
      style={{
        backgroundImage: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
      }}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#022ED2] flex items-center justify-center text-white text-xs sm:text-sm font-bold">
        {rank}
      </div>

      {/* Inner Content with pure black bg */}
      <div className="flex flex-col items-center text-center p-6 bg-black rounded-xl">
        {/* Avatar */}
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden">
          <Image
            src={avatar}
            alt={name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <h3 className="font-inter text-[22px] font-semibold leading-[140%] capitalize text-white">
          {name}
        </h3>

        {/* Sales */}
        <p className="font-inter text-[16px] font-normal leading-[140%] text-center">
          <span className="text-gray-400">Total Sales:</span>{' '}
          <span className="text-white">{totalSales} ETH</span>
        </p>
      </div>
    </div>
  );
};

export default CreatorCard;
