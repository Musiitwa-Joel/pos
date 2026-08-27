import React from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { observer } from '@legendapp/state/react';
import { cn } from '../../lib/utils';
import { usePOS } from '../../POSContext';

interface POSToolbarProps {
  ui$: any;
}

// 📱 [VANGUARD] Mobile Navigation & Header Component:
// Manages tab switching and cart visibility on small viewports.
export const POSToolbar = observer(({
  ui$
}: POSToolbarProps) => {
  const { posState$ } = usePOS();
  const itemCount = posState$.cart.get().reduce((s, i) => s + i.quantity, 0);
  const checkoutTab = ui$.checkoutTab.get();

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden px-4 py-3 bg-brand-accent text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ShoppingCart size={18} />
          <span className="font-display uppercase text-[10px] tracking-widest font-black leading-none pt-1">
            ACTIVE_SALE // {itemCount}_ITEMS
          </span>
        </div>
        <button
          onClick={() => ui$.isCartMobileOpen.set(false)}
          className="p-1 hover:bg-black/10 transition-all rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Industrial Tab Switcher (Mobile Only) */}
      <div className="lg:hidden flex bg-brand-dark border-b border-brand-steel divide-x divide-brand-steel shrink-0">
        <button
          onClick={() => ui$.checkoutTab.set('items')}
          className={cn(
            "flex-1 py-4 text-[10px] font-display uppercase tracking-[0.2em] transition-all",
            checkoutTab === 'items' ? "bg-brand-accent text-white" : "text-slate-900 dark:text-slate-500 hover:bg-brand-accent/10"
          )}
        >
          [ Items_Audit ]
        </button>
        <button
          onClick={() => ui$.checkoutTab.set('settle')}
          className={cn(
            "flex-1 py-4 text-[10px] font-display uppercase tracking-[0.2em] transition-all",
            checkoutTab === 'settle' ? "bg-brand-accent text-white" : "text-slate-900 dark:text-slate-500 hover:bg-brand-accent/10"
          )}
        >
          [ Settle_TX ]
        </button>
      </div>
    </>
  );
});
