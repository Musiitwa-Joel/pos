import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function Select({ value, onChange, options, placeholder = 'SELECT...', className, label }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt.toUpperCase(), value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative space-y-1", className)} ref={containerRef}>
      {label && (
        <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest block">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "terminal-input w-full p-2 text-xs flex items-center justify-between transition-all group",
          isOpen ? "border-brand-accent shadow-[0_0_10px_rgba(249,115,22,0.1)]" : "hover:border-slate-600"
        )}
      >
        <span className={cn(
          "truncate",
          !selectedOption ? "text-slate-900 dark:text-slate-500" : "text-[var(--text-main)]"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={14} 
          className={cn(
            "text-slate-900 dark:text-slate-500 transition-transform duration-200 group-hover:text-brand-accent",
            isOpen && "rotate-180 text-brand-accent"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-1 industrial-panel overflow-hidden bg-brand-graphite shadow-xl border-brand-steel/80 backdrop-blur-md"
          >
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {normalizedOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[10px] font-mono flex items-center justify-between transition-colors",
                    opt.value === value 
                      ? "bg-brand-accent/20 text-brand-accent" 
                      : "text-slate-800 dark:text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check size={12} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
