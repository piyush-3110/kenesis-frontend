"use client";
import React from "react";
import { Star, Send, CheckCircle } from "lucide-react";

interface Props { onSubmit:(d:{rating:number; title:string; comment:string})=>void; loading:boolean; onCancel:()=>void; }
export const ReviewForm: React.FC<Props> = ({ onSubmit, loading, onCancel }) => {
  const [rating,setRating]=React.useState(5);
  const [title,setTitle]=React.useState("");
  const [comment,setComment]=React.useState("");
  return (
    <form onSubmit={(e)=>{e.preventDefault(); onSubmit({ rating, title:title.trim(), comment: comment.trim()});}} className="space-y-6 p-6 rounded-xl border border-blue-500/30 bg-black/40">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Write Your Review</h3>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
          <CheckCircle size={12}/>Verified
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rating *</label>
        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(s=> <button type="button" key={s} onClick={()=> setRating(s)} className="p-1"><Star className={`w-6 h-6 ${s<=rating? 'text-yellow-400 fill-yellow-400':'text-gray-600'}`}/></button>)}
          <span className="text-sm text-gray-400 ml-2">{rating} star{rating!==1?'s':''}</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
          <input value={title} onChange={e=> setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white" required/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Comment *</label>
          <textarea value={comment} onChange={e=> setComment(e.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white resize-none" required />
        </div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <button disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm disabled:opacity-50">
          {loading? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/>:<Send size={16}/>}
          {loading? 'Submitting...' : 'Submit Review'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 text-gray-400 hover:text-white text-sm">Cancel</button>
      </div>
    </form>
  );
};
