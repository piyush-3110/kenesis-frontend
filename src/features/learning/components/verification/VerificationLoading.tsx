import React from "react";
import { Loader2 } from "lucide-react";

export const VerificationLoading: React.FC = () => (
  <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl">
    {/* Background Gradient */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        background: 'linear-gradient(135deg, rgba(6,128,255,0.3) 0%, rgba(2,46,210,0.2) 50%, transparent 100%)',
      }}
    />
    
    <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
      <div 
        className="rounded-full p-4 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(6,128,255,0.2) 0%, rgba(2,46,210,0.1) 100%)',
          boxShadow: '0 0 30px rgba(6,128,255,0.3)',
        }}
      >
        <Loader2 className="h-16 w-16 animate-spin text-[#0680FF]" />
      </div>
      
      <h2 className="font-poppins text-2xl md:text-3xl font-bold text-white mb-4">
        Verifying{" "}
        <span 
          className="bg-gradient-to-r from-[#0680FF] to-[#022ED2] bg-clip-text text-transparent"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Certificate
        </span>
      </h2>
      
      <p className="font-poppins text-white/70 text-lg">
        Please wait while we verify the authenticity...
      </p>
      
      {/* Animated dots */}
      <div className="flex space-x-1 mt-4">
        <div 
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ 
            backgroundColor: '#0680FF',
            animationDelay: '0ms',
          }}
        />
        <div 
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ 
            backgroundColor: '#0680FF',
            animationDelay: '150ms',
          }}
        />
        <div 
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ 
            backgroundColor: '#0680FF',
            animationDelay: '300ms',
          }}
        />
      </div>
    </div>
  </div>
);
