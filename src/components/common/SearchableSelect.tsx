import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

export interface SearchableSelectProps {
  value: string | number | null;
  onChange: (value: any) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '-- Chọn vật phẩm --',
  searchPlaceholder = 'Tìm kiếm vật phẩm...',
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [calculatedPlacement, setCalculatedPlacement] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Calculate placement based on screen position
  useEffect(() => {
    if (isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If space below is less than 280px and there is more space above, open top
        if (spaceBelow < 280 && rect.top > spaceBelow) {
          setCalculatedPlacement('top');
        } else {
          setCalculatedPlacement('bottom');
        }
      }
    }
  }, [isOpen]);

  // Focus input when open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === value) || null;
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(query));
  }, [searchQuery, options]);

  return (
    <div ref={containerRef} className={cn("relative w-full text-left", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between transition-colors text-left outline-none",
          "bg-white border border-slate-200 hover:border-blue-500/50 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-800 focus:bg-white focus:border-blue-500",
          disabled 
            ? "bg-slate-100/80 border border-slate-200 cursor-not-allowed text-gray-400 opacity-60" 
            : "cursor-pointer"
        )}
      >
        <span className="truncate pr-4">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
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
              "absolute z-50 w-full bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-64",
              calculatedPlacement === 'top' ? "bottom-full mb-1.5" : "mt-1.5"
            )}
          >
            {/* Search Input Box */}
            <div className="p-2.5 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none border-none placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-4 text-slate-400 font-bold italic text-xs">
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
                        "w-full text-left px-3 py-2.5 rounded-xl transition-all font-semibold text-xs text-slate-750 hover:bg-blue-50 hover:text-blue-600 cursor-pointer",
                        isSelected && "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
