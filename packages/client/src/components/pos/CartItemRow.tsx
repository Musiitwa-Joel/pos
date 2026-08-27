import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';
import { CartItem } from '../../types';

interface CartItemRowProps {
  item: CartItem;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
}

// 🛰️ [VANGUARD] Atomic Transaction Row:
// Memoized to prevent re-renders during high-frequency barcode scans.
// Only animates and updates when the specific line item changes.
const CartItemRow = React.memo(({ item, removeFromCart, updateQuantity }: CartItemRowProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="bg-brand-dark/50 border border-brand-steel/50 p-2 flex flex-col gap-2 group"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold truncate pr-2 uppercase leading-tight">
          {item.name}
        </span>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-slate-900 dark:text-slate-500 hover:text-danger transition-colors shrink-0"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 bg-brand-dark border border-brand-steel px-1.5 py-0.5">
          <button
            onClick={() => updateQuantity(item.id, -1)}
            className="text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)]"
          >
            <Minus size={10} />
          </button>
          <span className="text-[10px] font-mono w-4 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, 1)}
            className="text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)]"
          >
            <Plus size={10} />
          </button>
        </div>
        <span className="text-[10px] font-mono font-bold tracking-tight">
          {formatCurrency(item.price * item.quantity)}
        </span>
      </div>
    </motion.div>
  );
});

CartItemRow.displayName = 'CartItemRow';

export default CartItemRow;
