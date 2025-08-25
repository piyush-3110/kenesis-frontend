"use client";
import React from "react";
import { ReviewItem } from "./ReviewItem";

interface Props { reviews:any[]; canEdit:(r:any)=>boolean; onEdit:(r:any)=>void; onDelete:(id:string)=>void; onVote:(id:string, helpful:boolean)=>void; votingId:string|null; }
export const ReviewsList: React.FC<Props> = ({ reviews, canEdit, onEdit, onDelete, onVote, votingId }) => {
  if(reviews.length===0) return <div className="text-center py-12 text-gray-400">No reviews yet</div>;
  return <div className="grid gap-6">{reviews.map(r=> <ReviewItem key={r.id} review={r} canEdit={canEdit(r)} onEdit={onEdit} onDelete={onDelete} onVote={onVote} voting={votingId===r.id} />)}</div>;
};
