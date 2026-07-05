import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block align-middle ml-1 mr-1 shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Help info"
        className="w-5 h-5 rounded-full bg-slate-200 hover:bg-[#0D9488] text-slate-600 hover:text-white font-bold text-[11px] inline-flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
      >
        ؟
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 right-0 sm:left-1/2 sm:-translate-x-1/2 w-64 p-3.5 bg-[#1E293B] text-white text-xs rounded-2xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 leading-relaxed font-normal">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700 font-bold text-amber-300">
            <span>{title || 'توضيح / Help Info'}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-200">{content}</p>
          {/* Arrow */}
          <div className="absolute top-full right-2 sm:left-1/2 sm:-translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1E293B]" />
        </div>
      )}
    </div>
  );
};
