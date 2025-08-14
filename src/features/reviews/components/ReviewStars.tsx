"use client";
import { Star } from "lucide-react";

export const ReviewStars = ({ rating, size='md' }: { rating: number; size?: 'sm'|'md'|'lg' }) => {
  const map = { sm:'w-3 h-3', md:'w-4 h-4', lg:'w-5 h-5'} as const;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s=> (
        <Star key={s} className={`${map[size]} ${s<=rating? 'text-yellow-400 fill-yellow-400':'text-gray-600'}`} />
      ))}
    </div>
  );
};
