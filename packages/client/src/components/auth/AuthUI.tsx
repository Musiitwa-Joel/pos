import React from 'react';
import { cn } from '../../lib/utils';

export const StepIndicator = React.memo(({ current, mode = 'signup' }: { current: string, mode?: 'signup' | 'forgot' }) => {
  const signupSteps = ['IDENTITY', 'REGISTRY', 'PAYMENT', 'DEPLOYMENT'];
  const forgotSteps = ['IDENTITY', 'VERIFY', 'RESET', 'SUCCESS'];
  const steps = mode === 'signup' ? signupSteps : forgotSteps;
  const currentIdx = steps.indexOf(current);
  const totalSteps = steps.length;

  return (
    <div className="mb-10 px-1">
      <div className="flex justify-between items-end mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neo-orange">Phase_0{currentIdx + 1}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{current}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
        {steps.map((step, idx) => (
          <div key={step} className={cn(
            "h-1 transition-all duration-700",
            idx <= currentIdx ? "bg-black" : "bg-black/5"
          )} />
        ))}
      </div>
    </div>
  );
});

StepIndicator.displayName = 'StepIndicator';

export const SegmentedOTP = React.memo(({ value, onChange, onComplete, disabled }: { value: string, onChange: (val: string) => void, onComplete: () => void, disabled?: boolean }) => {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const handleDigitChange = (digit: string, idx: number) => {
    if (disabled) return;
    const isNumeric = /^\d?$/.test(digit);
    if (!isNumeric) return;

    const newValue = value.split('');
    newValue[idx] = digit;
    const finalString = newValue.join('').substring(0, 6);
    onChange(finalString);

    if (digit && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  // Trigger completion check
  React.useEffect(() => {
    if (value.length === 6) {
      onComplete();
    }
  }, [value, onComplete]);

  return (
    <div className="flex justify-between gap-2 sm:gap-4">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="relative w-full aspect-square sm:w-14 sm:h-20">
          <input
            ref={(el) => { inputs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[idx] || ''}
            onChange={(e) => handleDigitChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            disabled={disabled}
            className={cn(
               "w-full h-full neo-border bg-black/5 text-center font-black text-2xl sm:text-4xl focus:border-neo-orange focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(255,107,0,1)] transition-all outline-none",
               disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      ))}
    </div>
  );
});

SegmentedOTP.displayName = 'SegmentedOTP';
