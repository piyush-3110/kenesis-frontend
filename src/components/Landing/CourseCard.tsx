"use client";

import React from "react";
import Image from "next/image";

interface CourseCardProps {
  img: string;
  avatar: string;
  name: string;
  earnings: string;
  isActive: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  img,
  avatar,
  name,
  earnings,
  isActive,
}) => {
  return (
    <div className="px-2 focus:outline-none transition-transform duration-300">
      <div
        className={`rounded-md overflow-hidden border transition-all duration-300 ${
          isActive ? "border-transparent p-[1px]" : "border-gray-700"
        }`}
        style={
          isActive
            ? {
                backgroundImage:
                  "linear-gradient(90deg, #0680FF 0%, #022ED2 100%)",
              }
            : {}
        }
      >
        <div className="bg-[#000526] rounded-md">
          <Image
            src={img}
            alt="course"
            width={400}
            height={240}
            className="w-full object-cover rounded-md"
          />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Image
                src={avatar}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-md object-cover"
              />
              <span className="text-white text-sm font-poppins">{name}</span>
            </div>
            <span className="text-white font-semibold text-sm">{earnings}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
