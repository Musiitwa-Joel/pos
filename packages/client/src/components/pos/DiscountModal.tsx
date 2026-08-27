import React, { useEffect } from 'react';
import { observer, useObservable } from '@legendapp/state/react';
import Modal from '../Modal';
import { Percent, Banknote, Delete, Check, X } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

interface DiscountModalProps {
  ui$: any;
  subtotal: any;
  currentDiscount: any;
  onApply: (discount: number, reason: string) => void;
}

export default observer(function DiscountModal({ ui$, subtotal: subtotal$, currentDiscount: currentDiscount$, onApply }: DiscountModalProps) {
  const local$ = useObservable({
    unit: 'fixed' as 'fixed' | 'percent',
    inputValue: '0',
    reason: '',
    error: null as string | null
  });

  const isOpen = ui$.isDiscountModalOpen.get();
  const subtotal = subtotal$.get();
  const currentDiscount = currentDiscount$.get();

  useEffect(() => {
    if (isOpen) {
      local$.inputValue.set(currentDiscount > 0 ? currentDiscount.toString() : '0');
      local$.unit.set('fixed');
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
        ui$.isDiscountModalOpen.set(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNumberClick = (num: string) => {
    const prev = local$.inputValue.peek();
    if (prev === '0') local$.inputValue.set(num);
    else local$.inputValue.set(prev + num);
  };

  const handleBackspace = () => {
    const prev = local$.inputValue.peek();
    if (prev.length <= 1) local$.inputValue.set('0');
    else local$.inputValue.set(prev.slice(0, -1));
  };

  const numericValue = parseFloat(local$.inputValue.get()) || 0;
  
  const effectiveDiscount = local$.unit.get() === 'percent' 
    ? (subtotal * numericValue) / 100 
    : numericValue;

  const finalTotal = Math.max(0, subtotal - effectiveDiscount);
  const maxDiscount = subtotal * 0.15;
  const isOverLimit = effectiveDiscount > maxDiscount;

  const handleSubmit = () => {
    if (isOverLimit) return;
    if (!local$.reason.get().trim()) {
      local$.error.set('JUSTIFICATION_REQUIRED: ENTER_REASON_FOR_OVERRIDE');
      return;
    }
    onApply(effectiveDiscount, local$.reason.get());
    ui$.isDiscountModalOpen.set(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => ui$.isDiscountModalOpen.set(false)} title="PRICE_OVERRIDE_TERMINAL" maxWidth="max-w-md">
      <div className="flex flex-col gap-6">
        {/* Toggle Unit */}
        <div className="flex bg-brand-dark p-1 border border-brand-steel rounded-lg">
          <button 
            onClick={() => local$.unit.set('fixed')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all font-display text-[10px] tracking-widest",
              local$.unit.get() === 'fixed' ? "bg-brand-accent text-white shadow-lg" : "text-slate-900 dark:text-slate-500 hover:text-slate-300"
            )}
          >
            <Banknote size={14} /> FIXED_USH
          </button>
          <button 
            onClick={() => local$.unit.set('percent')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all font-display text-[10px] tracking-widest",
              local$.unit.get() === 'percent' ? "bg-brand-accent text-white shadow-lg" : "text-slate-900 dark:text-slate-500 hover:text-slate-300"
            )}
          >
            <Percent size={14} /> PERCENTAGE_%
          </button>
        </div>

        {/* Input Display */}
        <div className="industrial-panel p-6 bg-brand-dark/50 border-brand-accent/30 text-center group cursor-default">
           <div className="text-[9px] text-slate-900 dark:text-slate-500 font-display mb-2 uppercase tracking-widest">ENTER_DISCOUNT_VALUE</div>
           <div className="text-4xl font-mono font-bold text-brand-accent select-none">
              {local$.unit.get() === 'percent' ? `${local$.inputValue.get()}%` : formatCurrency(numericValue)}
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
              local$.error.get()?.includes('JUSTIFICATION') && "border-danger bg-danger/5"
            )}
            placeholder="E.G. CUSTOMER_LOYALTY, DAMAGED_PACKAGING..."
            value={local$.reason.get()}
            onChange={(e) => {
              local$.reason.set(e.target.value);
              local$.error.set(null);
            }}
          />
        </div>

        {(isOverLimit || local$.error.get()) && (
          <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-[9px] font-mono animate-pulse uppercase leading-relaxed">
            {isOverLimit 
               ? (local$.unit.get() === 'percent' 
                   ? `OVERRIDE_REFUSED: MAXIMUM_AUTHORIZED_REDUCTION_IS_15%_(${formatCurrency(maxDiscount)})`
                   : `OVERRIDE_REFUSED: MAXIMUM_FIXED_REDUCTION_EXCEEDED. LIMIT: ${formatCurrency(maxDiscount)} (15% OF TOTAL)`)
               : local$.error.get()
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
          onClick={() => ui$.isDiscountModalOpen.set(false)}
          className="w-full py-4 text-[10px] font-display uppercase tracking-[0.2em] text-slate-900 dark:text-slate-500 hover:text-slate-300 transition-colors"
        >
          CANCEL_&_CLOSE
        </button>
      </div>
    </Modal>
  );
});
