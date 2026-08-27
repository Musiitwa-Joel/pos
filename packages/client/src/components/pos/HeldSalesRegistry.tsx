import React from 'react';
import { Clock, X, Trash2, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from '@legendapp/state/react';
import { useHardware } from '../../HardwareContext';

interface HeldSalesRegistryProps {
  ui$: any;
  onResumeSale: (held: any) => void;
  onDecommissionSale: (id: string) => void;
  onRefreshRegistry: () => void;
}

// 📦 [VANGUARD] Parked Transaction Registry:
// Isolated portal for recovering suspended sales.
export const HeldSalesRegistry = observer(({
  ui$,
  onResumeSale,
  onDecommissionSale,
  onRefreshRegistry
}: HeldSalesRegistryProps) => {
  const { heldSales } = useHardware();
  const isOpen = ui$.showHeldSales.get();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[101] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="industrial-panel w-full max-w-2xl flex flex-col max-h-[80vh] bg-[var(--bg-panel)]"
          >
            <div className="industrial-panel-header px-4 py-3 border-b border-brand-steel/30 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <Clock size={16} className="text-brand-accent shrink-0" />
                <span className="text-[10px] font-display uppercase tracking-widest truncate">
                  Parked_Transaction_Registry
                </span>
              </div>
              <button
                onClick={() => ui$.showHeldSales.set(false)}
                className="p-1 hover:text-brand-accent transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {heldSales.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-700 opacity-40 grayscale">
                  <PauseCircle size={48} strokeWidth={1} />
                  <p className="text-[10px] font-display tracking-[0.2em] uppercase mt-4">
                    Registry_Empty_No_Parked_Sales_Found
                  </p>
                </div>
              ) : (
                heldSales.map((held) => {
                  let itemsPreview = [];
                  try {
                    itemsPreview = JSON.parse(held.cart);
                  } catch (e) {
                    console.error('Cart parse failed:', e);
                  }

                  return (
                    <div
                      key={held.id}
                      className="bg-brand-dark border border-brand-steel/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-brand-accent transition-all animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-brand-accent font-mono text-[10px] uppercase tracking-tighter">
                            TX_ID: {held.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-slate-500 font-mono text-[9px]">
                            {new Date(held.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-800 dark:text-slate-400 uppercase font-display leading-tight line-clamp-1">
                          {itemsPreview.length} items: {itemsPreview.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onDecommissionSale(held.id)}
                          className="p-2 border border-brand-steel text-danger hover:bg-danger/10 transition-all rounded"
                          title="Discard Transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => onResumeSale(held)}
                          className="btn-industrial btn-primary px-4 py-2 text-[8px] font-display uppercase tracking-widest"
                        >
                          Resume_Sale
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-brand-steel bg-black/10 flex justify-between items-center">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                Total_Parked_Capacity: {heldSales.length} Transactions
              </span>
              <button
                onClick={onRefreshRegistry}
                className="text-[8px] font-display text-brand-accent hover:underline uppercase tracking-widest"
              >
                Force_Registry_Sync
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
