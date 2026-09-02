import React from 'react';
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
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string'
      ? { label: opt.replace(/_/g, ' '), value: opt }
      : opt.label === opt.value
        ? { ...opt, label: opt.label.replace(/_/g, ' ') }
        : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  return (
    <div className={cn("relative space-y-1", className)}>
      {label && (
        <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest block">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "terminal-input w-full p-2 text-xs appearance-auto bg-[var(--bg-panel)]",
          className
        )}
      >
        {!selectedOption && (
          <option value="" disabled>
            {placeholder.replace(/_/g, ' ')}
          </option>
        )}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
