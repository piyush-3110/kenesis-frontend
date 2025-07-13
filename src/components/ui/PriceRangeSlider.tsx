'use client';

import { useState, useCallback, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValue = useCallback((percentage: number) => {
    const val = min + (percentage / 100) * (max - min);
    return Math.round(val / step) * step;
  }, [min, max, step]);

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
    
    const handleMouseMove = (e: MouseEvent) => {
      const slider = (e.currentTarget as HTMLElement)?.querySelector('.slider-track');
      if (!slider) return;
      
      const rect = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const newValue = getValue(percentage);
      
      setLocalValue(prev => {
        const newRange: [number, number] = type === 'min' 
          ? [Math.min(newValue, prev[1]), prev[1]]
          : [prev[0], Math.max(newValue, prev[0])];
        return newRange;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      onChange(localValue);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleInputChange = (type: 'min' | 'max', val: string) => {
    const numVal = Math.max(min, Math.min(max, Number(val) || 0));
    const newRange: [number, number] = type === 'min' 
      ? [Math.min(numVal, localValue[1]), localValue[1]]
      : [localValue[0], Math.max(numVal, localValue[0])];
    
    setLocalValue(newRange);
    onChange(newRange);
  };

  const minPercentage = getPercentage(localValue[0]);
  const maxPercentage = getPercentage(localValue[1]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Slider */}
      <div className="relative px-3">
        {/* Track */}
        <div className="slider-track relative h-2 bg-gray-700 rounded-full overflow-hidden">
          {/* Active range */}
          <div 
            className="absolute h-full rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
              background: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)'
            }}
          />
          
          {/* Glow effect */}
          <div 
            className="absolute h-full rounded-full opacity-30 blur-sm"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
              background: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)'
            }}
          />
        </div>

        {/* Min Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer transition-all duration-200 ${
            isDragging === 'min' ? 'scale-125 shadow-lg shadow-blue-500/50' : 'hover:scale-110'
          }`}
          style={{
            left: `calc(${minPercentage}% - 12px)`,
            background: 'linear-gradient(135deg, #0680FF 0%, #022ED2 100%)',
            border: '2px solid #1a1a1a',
            boxShadow: isDragging === 'min' ? '0 0 20px rgba(6, 128, 255, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
          onMouseDown={handleMouseDown('min')}
        >
          <div className="w-full h-full rounded-full bg-white/20" />
        </div>

        {/* Max Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer transition-all duration-200 ${
            isDragging === 'max' ? 'scale-125 shadow-lg shadow-blue-500/50' : 'hover:scale-110'
          }`}
          style={{
            left: `calc(${maxPercentage}% - 12px)`,
            background: 'linear-gradient(135deg, #0680FF 0%, #022ED2 100%)',
            border: '2px solid #1a1a1a',
            boxShadow: isDragging === 'max' ? '0 0 20px rgba(6, 128, 255, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
          onMouseDown={handleMouseDown('max')}
        >
          <div className="w-full h-full rounded-full bg-white/20" />
        </div>
      </div>

      {/* Value Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
          <DollarSign size={16} className="text-blue-400" />
          <input
            type="number"
            value={localValue[0]}
            onChange={(e) => handleInputChange('min', e.target.value)}
            className="bg-transparent text-white text-sm w-20 outline-none"
            min={min}
            max={max}
          />
        </div>
        
        <div className="px-3 py-1 text-gray-400 text-sm font-medium">to</div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
          <DollarSign size={16} className="text-blue-400" />
          <input
            type="number"
            value={localValue[1]}
            onChange={(e) => handleInputChange('max', e.target.value)}
            className="bg-transparent text-white text-sm w-20 outline-none"
            min={min}
            max={max}
          />
        </div>
      </div>

      {/* Range Info */}
      <div className="text-center">
        <div className="text-gray-400 text-xs">
          Range: ${localValue[0].toLocaleString()} - ${localValue[1].toLocaleString()}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          {((localValue[1] - localValue[0]) / (max - min) * 100).toFixed(0)}% of total range
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
