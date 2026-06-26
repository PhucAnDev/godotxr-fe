import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
  variant?: 'filter' | 'form';
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  className,
  variant = 'filter',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];
  const isForm = variant === 'form';

  return (
    <div ref={containerRef} className={cn("relative w-full text-left", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between transition-colors text-left outline-none",
          disabled 
            ? "bg-slate-100/80 border border-slate-200 cursor-not-allowed text-gray-400 opacity-60" 
            : "cursor-pointer",
          isForm 
            ? cn("bg-[#FDFCF5] border-2 border-transparent rounded-2xl px-5 py-4 font-black italic tracking-wide text-gray-700 text-sm", !disabled && "focus:border-[#4EACAF]")
            : "bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 focus:bg-white focus:border-[#4EACAF] uppercase"
        )}
      >
        <span className="truncate pr-4">{selectedOption?.label}</span>
        {!disabled && (
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0", 
              isOpen && "transform rotate-180"
            )} 
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-0.5"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex flex-col items-start gap-0.5 cursor-pointer",
                    isForm
                      ? "font-black italic text-sm tracking-wide text-gray-700 hover:bg-[#4EACAF]/10 hover:text-[#4EACAF]"
                      : "font-bold text-xs uppercase text-slate-700 hover:bg-[#4EACAF]/10 hover:text-[#4EACAF]",
                    isSelected && "bg-[#4EACAF] text-white hover:bg-[#4EACAF] hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
