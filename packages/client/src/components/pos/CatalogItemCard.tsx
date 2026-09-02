import React from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { Product } from '../../types';

interface CatalogItemCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

// 🛰️ [VANGUARD] Atomic Catalog Blade:
// Memoized to zero-render unless the specific product identity or stock changes.
const CatalogItemCard = React.memo(({ product, addToCart }: CatalogItemCardProps) => {
  return (
    <button
      onClick={() => addToCart(product)}
      disabled={product.stock <= 0}
      className={cn(
        "industrial-panel p-3 text-left group transition-all hover:border-brand-accent/50 active:scale-[0.98] bg-[var(--bg-panel)] flex flex-col h-full",
        product.stock <= 0
          ? "opacity-30 grayscale cursor-not-allowed"
          : "",
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 uppercase truncate pr-2">
          {product.category}
        </span>
        <span
          className={cn(
            "text-[7px] font-mono px-1 py-0.5 whitespace-nowrap",
            product.stock < (product.minStock || 5)
              ? "bg-danger/20 text-danger"
              : "bg-brand-steel/20 text-slate-800 dark:text-slate-400",
          )}
        >
          STK: {product.stock}
        </span>
      </div>
      <h3 className="mb-1 font-bold text-[9px] sm:text-[10px] group-hover:text-brand-accent transition-colors line-clamp-2 uppercase leading-snug overflow-hidden min-h-[2.25rem] sm:min-h-[2.5rem]">
        {product.name}
      </h3>
      <div className="mt-auto min-h-[1.1rem] flex items-end">
        <p className="text-brand-accent font-display font-bold text-[11px] sm:text-xs truncate group-hover:hidden">
          {formatCurrency(product.price)}
        </p>
        <p className="hidden text-brand-accent font-display font-bold text-[11px] sm:text-xs truncate group-hover:block">
          ADD TO CART
        </p>
      </div>
    </button>
  );
});

CatalogItemCard.displayName = 'CatalogItemCard';

export default CatalogItemCard;
