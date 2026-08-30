import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CustomSelectOption {
  value: string;
  label: string;
  avatarUrl?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
  variant?: 'filter' | 'form' | 'subform';
  disabled?: boolean;
  placement?: 'bottom' | 'top' | 'auto';
  searchable?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  className,
  variant = 'filter',
  disabled = false,
  placement = 'auto',
  searchable = true
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [calculatedPlacement, setCalculatedPlacement] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    } else {
      if (placement === 'auto') {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const requiredHeight = Math.min(options.length * 36 + 16, 200);
          if (spaceBelow < requiredHeight && rect.top > spaceBelow) {
            setCalculatedPlacement('top');
          } else {
            setCalculatedPlacement('bottom');
          }
        }
      } else {
        setCalculatedPlacement(placement);
      }
    }
  }, [isOpen, placement, options.length]);

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
  const isSubform = variant === 'subform';

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  return (
    <div ref={containerRef} className={cn("relative w-full text-left", isOpen && "z-[100]", className)}>
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
            : isSubform
              ? cn("bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-800 text-sm focus:border-blue-500", !disabled && "focus:border-blue-500")
              : "bg-slate-50 border border-slate-200 hover:border-[#4EACAF]/20 px-3 py-2 rounded-lg font-bold text-xs text-slate-600 focus:bg-white focus:border-[#4EACAF] uppercase"
        )}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption?.avatarUrl ? (
            <img src={selectedOption.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200" />
          ) : null}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
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
            initial={{ opacity: 0, y: calculatedPlacement === 'top' ? -5 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: calculatedPlacement === 'top' ? -5 : 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-[100] w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-0.5 min-w-[220px]",
              calculatedPlacement === 'top' ? "bottom-full mb-1.5" : "mt-1.5"
            )}
          >
            {searchable && options.length > 3 && (
              <div className="p-1 mb-1 border-b border-slate-100 sticky top-0 bg-white z-10">
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:border-[#4EACAF] focus:bg-white"
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt) => {
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
                      "w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer",
                      isForm
                        ? "font-black italic text-sm tracking-wide text-gray-700 hover:bg-[#4EACAF]/10 hover:text-[#4EACAF]"
                        : isSubform
                          ? "font-medium text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          : "font-bold text-xs uppercase text-slate-700 hover:bg-[#4EACAF]/10 hover:text-[#4EACAF]",
                      isSelected && (
                        isSubform
                          ? "bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
                          : "bg-[#4EACAF] text-white hover:bg-[#4EACAF] hover:text-white"
                      )
                    )}
                  >
                    {opt.avatarUrl ? (
                      <img src={opt.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 shadow-xs" />
                    ) : null}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
