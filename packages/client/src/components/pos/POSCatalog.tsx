import React from 'react';
import { Search, Clock } from 'lucide-react';
import { observer, useObservable } from '@legendapp/state/react';
import { cn, formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { toast } from 'sonner';
import CatalogItemCard from './CatalogItemCard';
import { useHardware } from '../../HardwareContext';

interface POSCatalogProps {
  addToCart: (product: Product) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  products: Product[];
  ui$: any;
}

// 🛰️ [VANGUARD] Isolated Catalog Hub:
// Now utilizing Legend-State for zero-render localized search.
export const POSCatalog = observer(({
  addToCart,
  searchInputRef,
  products,
  ui$
}: POSCatalogProps) => {
  const { heldSales, refreshHeldSales } = useHardware();
  const heldSalesCount = heldSales.length;
  const local$ = useObservable({ searchQuery: "" });

  const filteredProducts = React.useMemo(() => products.filter(
    (p) =>
      p.name.toLowerCase().includes(local$.searchQuery.get().toLowerCase()) ||
      p.barcode?.includes(local$.searchQuery.get()),
  ), [products, local$.searchQuery.get()]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const topResult = filteredProducts[0];
      if (topResult) {
        if (topResult.stock > 0) {
          addToCart(topResult);
          local$.searchQuery.set("");
        } else {
          toast.error(`STOCK_VOID: ${topResult.name.toUpperCase()} IS OUT OF STOCK`);
        }
      }
    }
  };

  return (
    <div className="industrial-panel flex-1 flex flex-col min-h-0 bg-[var(--bg-panel)]">
      <div className="industrial-panel-header min-w-0 px-4 py-3">
        <div className="flex items-center gap-2 shrink-0 min-w-0 overflow-hidden">
          <Search size={14} className="text-brand-accent shrink-0" />
          <span className="text-[0.625rem] font-display uppercase tracking-widest truncate">
            Product_Catalog
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {heldSalesCount > 0 && (
            <button
              onClick={() => {
                refreshHeldSales(false);
                ui$.showHeldSales.set(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent hover:bg-brand-accent hover:text-white transition-all rounded text-[8px] font-display uppercase animate-pulse shrink-0"
            >
              <Clock size={10} className="shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">PARKED_SALES: </span>
                <span className="sm:hidden">PARKED: </span>
                {heldSalesCount}
              </span>
            </button>
          )}
          <span className="keyboard-hint shrink-0 whitespace-nowrap text-[8px] opacity-90 dark:opacity-60 hidden sm:inline-block">
            ^ K TO FOCUS
          </span>
        </div>
      </div>

      <div className="p-2 border-b border-brand-steel bg-black/5">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="SCAN OR TYPE PRODUCT NAME..."
          className="terminal-input w-full h-9 sm:h-10 text-sm"
          value={local$.searchQuery.get()}
          onChange={(e: any) => local$.searchQuery.set(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 pb-32 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 content-start custom-scrollbar min-h-0">
        {filteredProducts.slice(0, 100).map((product) => (
          <CatalogItemCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-700 py-20 opacity-30 grayscale">
            <Search size={40} className="mb-4" />
            <p className="text-[10px] font-display uppercase tracking-widest text-center px-4">
              No_System_Matches_Found_In_Local_Buffer
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
