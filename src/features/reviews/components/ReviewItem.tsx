"use client";
import React from "react";
import { User, Calendar, MoreVertical, ThumbsUp, ThumbsDown } from "lucide-react";
import { ReviewStars } from "./ReviewStars";

interface ReviewItemProps { review:any; canEdit:boolean; onEdit:(r:any)=>void; onDelete:(id:string)=>void; onVote:(id:string, helpful:boolean)=>void; voting:boolean; }
export const ReviewItem: React.FC<ReviewItemProps> = ({ review, canEdit, onEdit, onDelete, onVote, voting }) => (
  <div className="p-6 rounded-xl bg-black/30 border border-gray-700/30">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h4 className="font-semibold text-white flex items-center gap-2">{review.username}</h4>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <div className="flex items-center gap-1"><Calendar size={12}/>{new Date(review.createdAt).toLocaleDateString()}</div>
            <ReviewStars rating={review.rating} size="sm"/>
          </div>
        </div>
      </div>
      {canEdit && <button onClick={()=> onEdit(review)} className="p-1 text-gray-400 hover:text-white"><MoreVertical size={16}/></button>}
    </div>
    <h5 className="font-semibold text-white mb-2">{review.title}</h5>
    <p className="text-gray-300 leading-relaxed">{review.comment}</p>
    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700/30">
      <button disabled={voting} onClick={()=> onVote(review.id,true)} className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm"><ThumbsUp size={14}/>Helpful ({review.helpfulVotes})</button>
      <button disabled={voting} onClick={()=> onVote(review.id,false)} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm"><ThumbsDown size={14}/>Not Helpful</button>
    </div>
  </div>
);
