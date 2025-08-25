"use client";
import { ChevronDown, ChevronRight, CheckCircle, PlayCircle, FileText, X } from "lucide-react";
import type { Chapter, Module } from "../types";
import React from "react";

interface Props { chapters: Chapter[]; failed?: Set<string>; expanded: Set<string>; onToggleChapter:(id:string)=>void; onSelect:(m:Module)=>void; selectedModule?:Module|null; sidebarOpen:boolean; setSidebarOpen:(v:boolean)=>void; formatDuration:(s:number)=>string; retryFailed?:()=>void; }
export const Sidebar: React.FC<Props> = ({ chapters, failed, expanded, onToggleChapter, onSelect, selectedModule, sidebarOpen, setSidebarOpen, formatDuration, retryFailed }) => {
  return (
    <div className={`${sidebarOpen? 'w-72 sm:w-80':'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 relative`}>
      <div className="h-full bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-800/30 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Course Content</h2>
            <div className="flex items-center gap-2">{failed && failed.size>0 && <button onClick={retryFailed} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Retry</button>}<button onClick={()=> setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X size={16}/></button></div>
          </div>
          <div className="p-3 space-y-3">{chapters.map((ch, idx)=> { const isExpanded = expanded.has(ch.id); return (<div key={ch.id} className="space-y-2"><button onClick={()=> onToggleChapter(ch.id)} className="w-full flex items-center gap-2 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/30 transition text-left">{isExpanded? <ChevronDown size={14} className="text-blue-400"/>:<ChevronRight size={14} className="text-gray-400"/>}<span className="text-sm font-medium text-white flex-1">Chapter {idx+1}: {ch.title}</span><span className="text-[10px] text-gray-400">{ch.modules.length} lessons</span></button>{isExpanded && <div className="space-y-1 ml-4">{ch.modules.map((m,i)=> (<button key={m.id} onClick={()=> onSelect(m)} className={`w-full p-2 rounded text-left text-sm flex items-start gap-2 group ${selectedModule?.id===m.id? 'bg-blue-600/20 border border-blue-500/30':'hover:bg-blue-600/10'}`}>{m.completed? <CheckCircle size={14} className="text-green-400"/>: m.type==='video'? <PlayCircle size={14} className="text-blue-300"/>:<FileText size={14} className="text-green-300"/>}<div className="flex-1 min-w-0"><p className={`line-clamp-2 ${selectedModule?.id===m.id? 'text-blue-300':'text-white group-hover:text-blue-200'}`}>{i+1}. {m.title}</p><div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5"><span>{formatDuration(m.duration)}</span>{m.isPreview && <span className="text-green-400">Preview</span>}</div></div></button>))}</div>}</div>); })}</div>
        </div>
      </div>
    </div>
  );
};
