import React, { useId, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export default function DatePicker({ value, onChange, className = '', label }: DatePickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const formatted = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    : 'SELECT DATE';

  const handleClick = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.click();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center gap-1 md:gap-2 bg-brand-dark border border-brand-steel/60 hover:border-brand-accent/50 rounded px-2 md:px-3 py-1.5 cursor-pointer group transition-all duration-150 ${className}`}
    >
      {/* Lucide icon — always visible */}
      <Calendar
        size={14}
        className="text-brand-accent shrink-0 group-hover:scale-110 transition-transform pointer-events-none"
      />

      {/* Label prefix */}
      {label && (
        <span className="hidden sm:inline text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mr-1 shrink-0 pointer-events-none">
          {label}
        </span>
      )}

      {/* Displayed date value */}
      <span className="text-[11px] font-mono text-[color:var(--text-main)] whitespace-nowrap select-none pointer-events-none">
        {formatted}
      </span>

      {/* Invisible but interactive input so the browser can natively handle the calendar popup */}
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  );
}
