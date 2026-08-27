import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from '@legendapp/state/react';
import { usePOS } from '../../POSContext';
import { formatCurrency, cn } from '../../lib/utils';
import { CartItem } from '../../types';

interface POSTransactionProps {
  ui$: any;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
}

import CartItemRow from './CartItemRow';

// 🛰️ [VANGUARD] Active Transaction Matrix:
// High-frequency reactive component. Re-renders ONLY when the cart 
// content (posState$.cart) is modified or the settle tab is toggled.
export const POSTransaction = observer(({
  ui$,
  removeFromCart,
  updateQuantity
}: POSTransactionProps) => {
  const { posState$ } = usePOS();
  const cart = posState$.cart.get() as CartItem[];
  const checkoutTab = ui$.checkoutTab.get();

  return (
    <div className={cn(
      "flex-1 industrial-panel flex flex-col min-h-0 bg-[var(--bg-panel)] overflow-hidden",
      checkoutTab !== 'items' && "hidden md:flex"
    )}>
      <div className="industrial-panel-header min-w-0">
        <div className="flex items-center gap-2 shrink-0 min-w-0 overflow-hidden">
          <ShoppingCart
            size={14}
            className="text-brand-accent shrink-0"
          />
          <span className="text-[0.625rem] font-display uppercase tracking-widest truncate">
            Active_Transaction
          </span>
        </div>
        <span className="text-[0.55rem] font-mono text-slate-900 dark:text-slate-500 shrink-0 whitespace-nowrap ml-auto">
          {cart.length} LINE_ITEMS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <CartItemRow 
              key={item.id}
              item={item}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          ))}
        </AnimatePresence>
        {cart.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-30 py-20 grayscale">
            <ShoppingCart size={40} strokeWidth={1} />
            <p className="text-[9px] font-display tracking-[0.2em] uppercase">
              Terminal_Idle_Buffer_Clear
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
