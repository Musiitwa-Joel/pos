import React from 'react';
import { Search } from 'lucide-react';
import { observer, useObservable } from '@legendapp/state/react';
import { Product } from '../../types';
import { toast } from 'sonner';
import CatalogItemCard from './CatalogItemCard';

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
  const local$ = useObservable({ searchQuery: "" });
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const playClickSound = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 840;
    gain.gain.value = 0.02;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.08);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }, []);

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
      <div className="catalog-search-shell p-2 border-b border-brand-steel bg-black/5">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="SCAN OR TYPE PRODUCT NAME..."
          className="terminal-input catalog-search-input w-full h-11 sm:h-12 text-sm"
          value={local$.searchQuery.get()}
          onChange={(e: any) => local$.searchQuery.set(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto p-2 pb-32 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 content-start custom-scrollbar min-h-0"
        onClickCapture={(e) => {
          const target = e.target as HTMLElement | null;
          if (!target) return;
          const button = target.closest('button');
          if (!button) return;
          playClickSound();
        }}
      >
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
