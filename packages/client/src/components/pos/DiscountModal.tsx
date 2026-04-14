import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Percent, Banknote, Delete, Check, X } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  currentDiscount: number;
  onApply: (discount: number, reason: string) => void;
}

export default function DiscountModal({ isOpen, onClose, subtotal, currentDiscount, onApply }: DiscountModalProps) {
  const [unit, setUnit] = useState<'fixed' | 'percent'>('fixed');
  const [inputValue, setInputValue] = useState('0');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentDiscount > 0 ? currentDiscount.toString() : '0');
      setUnit('fixed');
    }
  }, [isOpen, currentDiscount]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: any) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === '.') {
        handleNumberClick('.');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    const g = globalThis as any;
    g.window?.addEventListener('keydown', handleKeyDown);
    return () => g.window?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputValue, unit]); // Dependencies to ensure handlers use fresh state

  const handleNumberClick = (num: string) => {
    setInputValue(prev => {
      if (prev === '0') return num;
      return prev + num;
    });
  };

  const handleBackspace = () => {
    setInputValue(prev => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const numericValue = parseFloat(inputValue) || 0;
  
  const effectiveDiscount = unit === 'percent' 
    ? (subtotal * numericValue) / 100 
    : numericValue;

  const finalTotal = Math.max(0, subtotal - effectiveDiscount);
  const maxDiscount = subtotal * 0.15;
  const isOverLimit = effectiveDiscount > maxDiscount;

  const handleSubmit = () => {
    if (isOverLimit) return;
    if (!reason.trim()) {
      setError('JUSTIFICATION_REQUIRED: ENTER_REASON_FOR_OVERRIDE');
      return;
    }
    onApply(effectiveDiscount, reason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PRICE_OVERRIDE_TERMINAL" maxWidth="max-w-md">
      <div className="flex flex-col gap-6">
        {/* Toggle Unit */}
        <div className="flex bg-brand-dark p-1 border border-brand-steel rounded-lg">
          <button 
            onClick={() => setUnit('fixed')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all font-display text-[10px] tracking-widest",
              unit === 'fixed' ? "bg-brand-accent text-white shadow-lg" : "text-slate-900 dark:text-slate-500 hover:text-slate-300"
            )}
          >
            <Banknote size={14} /> FIXED_USH
          </button>
          <button 
            onClick={() => setUnit('percent')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all font-display text-[10px] tracking-widest",
              unit === 'percent' ? "bg-brand-accent text-white shadow-lg" : "text-slate-900 dark:text-slate-500 hover:text-slate-300"
            )}
          >
            <Percent size={14} /> PERCENTAGE_%
          </button>
        </div>

        {/* Input Display */}
        <div className="industrial-panel p-6 bg-brand-dark/50 border-brand-accent/30 text-center group cursor-default">
           <div className="text-[9px] text-slate-900 dark:text-slate-500 font-display mb-2 uppercase tracking-widest">ENTER_DISCOUNT_VALUE</div>
           <div className="text-4xl font-mono font-bold text-brand-accent select-none">
              {unit === 'percent' ? `${inputValue}%` : formatCurrency(numericValue)}
           </div>
        </div>

        {/* Impact Analysis */}
        <div className="grid grid-cols-2 gap-4">
           <div className="industrial-panel p-3 border-dashed opacity-90 dark:opacity-60">
              <div className="text-[8px] text-slate-900 dark:text-slate-500 uppercase font-display mb-1">Effective_Savings</div>
              <div className="text-sm font-mono text-emerald-500">-{formatCurrency(effectiveDiscount)}</div>
           </div>
           <div className="industrial-panel p-3 border-brand-accent/20">
              <div className="text-[8px] text-slate-900 dark:text-slate-500 uppercase font-display mb-1">Adjusted_Grand_Total</div>
              <div className="text-sm font-mono text-[var(--text-main)]">{formatCurrency(finalTotal)}</div>
           </div>
        </div>

        {/* Reason for Override */}
        <div className="space-y-1">
          <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest leading-none pt-1">
            JUSTIFICATION_REQUIRED
          </label>
          <input 
            type="text" 
            className={cn(
              "terminal-input w-full p-3 text-[10px]",
              error?.includes('JUSTIFICATION') && "border-danger bg-danger/5"
            )}
            placeholder="E.G. CUSTOMER_LOYALTY, DAMAGED_PACKAGING..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
          />
        </div>

        {(isOverLimit || error) && (
          <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-[9px] font-mono animate-pulse uppercase leading-relaxed">
            {isOverLimit 
               ? (unit === 'percent' 
                   ? `OVERRIDE_REFUSED: MAXIMUM_AUTHORIZED_REDUCTION_IS_15%_(${formatCurrency(maxDiscount)})`
                   : `OVERRIDE_REFUSED: MAXIMUM_FIXED_REDUCTION_EXCEEDED. LIMIT: ${formatCurrency(maxDiscount)} (15% OF TOTAL)`)
               : error
            }
          </div>
        )}

        {/* Action Buttons (Keyboard-first) */}
        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleSubmit} 
            disabled={isOverLimit}
            className={cn(
               "flex-1 py-4 industrial-panel flex items-center justify-center gap-2 transition-all active:scale-95",
               isOverLimit 
                 ? "bg-slate-800 text-slate-500 cursor-not-allowed grayscale" 
                 : "bg-brand-accent text-white shadow-[0_0_15px_rgba(var(--brand-accent-rgb),0.3)]"
            )}
          >
            <Check size={18} /> <span className="text-[10px] uppercase font-display tracking-widest">FINALIZE_OVERRIDE</span>
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 text-[10px] font-display uppercase tracking-[0.2em] text-slate-900 dark:text-slate-500 hover:text-slate-300 transition-colors"
        >
          CANCEL_&_CLOSE
        </button>
      </div>
    </Modal>
  );
}
