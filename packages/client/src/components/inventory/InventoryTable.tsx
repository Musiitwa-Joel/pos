import React, { useMemo } from "react";
import { Edit2, Trash2, Package } from "lucide-react";
import { observer } from "@legendapp/state/react";
import { formatCurrency, cn } from "../../lib/utils";

interface InventoryTableProps {
  products$: any;
  ui$: any;
  isOffline$: any;
  onEdit: (product: any) => void;
  onRetire: (id: string) => void;
}

// ⚡ [ATOMIC] High-Performance Table Row
const InventoryTableRow = React.memo(({ product, isOffline, onEdit, onRetire, formatCurrency }: any) => {
  return (
    <tr className="group border-b border-brand-steel/5 hover:bg-brand-steel/5 transition-colors">
      <td>
        <div className="flex flex-col">
          <span className="text-xs font-display font-black text-black dark:text-[var(--text-main)] tracking-tight uppercase">
            {product.name}
          </span>
          <span className="text-[9px] text-black dark:text-slate-500 font-mono font-bold">
            ID: #{product.id.slice(0, 8)}...
          </span>
        </div>
      </td>
      <td>
        <span className="text-[9px] font-display bg-black/5 dark:bg-[var(--bg-inset)] border border-black/10 dark:border-brand-steel px-2 py-0.5 text-black dark:text-[var(--text-main)] font-bold">
          {(product.category || "UNCATEGORIZED").toUpperCase()}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs font-mono font-black",
            product.stock <= product.minStock
              ? "text-orange-500"
              : "text-black dark:text-[var(--text-main)]",
          )}>
            {product.stock} {product.unit}
          </span>
        </div>
      </td>
      <td>
        <span className="text-xs font-mono font-black text-black dark:text-[var(--text-main)]">
          {formatCurrency(product.price)}
        </span>
      </td>
      <td>
        {product.stock <= 0 ? (
          <div className="flex items-center gap-2 text-danger">
            <div className="status-indicator bg-danger animate-pulse" />
            <span className="text-[9px] font-display">OUT_OF_STOCK</span>
          </div>
        ) : product.stock <= product.minStock ? (
          <div className="flex items-center gap-2 text-warning">
            <div className="status-indicator bg-warning animate-pulse" />
            <span className="text-[9px] font-display">LOW_STOCK</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-success">
            <div className="status-indicator bg-success" />
            <span className="text-[9px] font-display">OPTIMAL</span>
          </div>
        )}
      </td>
      <td className="text-right">
        <div className={cn(
          "flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isOffline && "hidden"
        )}>
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)] hover:bg-brand-steel/30 transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onRetire(product.id)}
            className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-danger hover:bg-brand-steel/30 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
});

// ⚡ [ATOMIC] High-Performance Mobile Card
const InventoryMobileCard = React.memo(({ product, isOffline, onEdit, onRetire, formatCurrency }: any) => {
  return (
    <div
      className="industrial-panel p-2 sm:p-3 bg-[var(--bg-panel)] flex flex-col gap-2 sm:gap-2.5 border-brand-steel/20 hover:border-brand-accent/50 transition-all active:scale-[0.99]"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-tight line-clamp-1">
          {product.name}
        </span>
        <div className="shrink-0 flex items-center gap-1.5 font-black">
          {product.stock <= 0 ? (
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          ) : product.stock <= product.minStock ? (
            <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
          )}
          <span className={cn(
            "text-[7px] uppercase tracking-widest",
            product.stock <= 0 ? "text-danger" : product.stock <= product.minStock ? "text-warning" : "text-success",
          )}>
            {product.stock <= 0 ? "CRITICAL" : product.stock <= product.minStock ? "ALERT" : "STABLE"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-black/10 p-2 border border-brand-steel/10 rounded-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] font-mono font-bold text-brand-accent">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[7px] font-mono text-slate-800 dark:text-slate-500 font-bold uppercase">
            Unit_Price_Point
          </span>
        </div>
        <div className="h-6 w-px bg-brand-steel/20" />
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-[10px] font-mono font-black",
            product.stock <= product.minStock ? "text-orange-400" : "text-[var(--text-main)]",
          )}>
            {product.stock} {product.unit}
          </span>
          <span className="text-[7px] font-mono text-slate-800 dark:text-slate-500 font-bold uppercase tracking-tighter">
            Current_Registry
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/5 -mx-3 px-3 py-1 mt-1 border-t border-brand-steel/10">
        <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/20 px-1 py-0.5 rounded-sm font-bold">
          SKU: #{product.id.slice(0, 6)}
        </span>
        <div className="flex gap-1">
          <button
            disabled={isOffline}
            onClick={() => onEdit(product)}
            className="p-1.5 text-slate-800 dark:text-slate-400 hover:text-brand-accent transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button
            disabled={isOffline}
            onClick={() => onRetire(product.id)}
            className="p-1.5 text-slate-800 dark:text-slate-400 hover:text-danger transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
});

// 🛰️ [VANGUARD] Inventory Data Registry:
// High-fidelity grid and card system for stock oversight.
export const InventoryTable = observer(({
  products$,
  ui$,
  isOffline$,
  onEdit,
  onRetire
}: InventoryTableProps) => {
  const searchQuery = ui$?.searchQuery?.get?.() || "";
  const filter = ui$?.filter?.get?.() || "all";
  const products = products$?.get?.() || [];
  const isOffline = isOffline$?.get?.();

  const filteredProducts = useMemo(() => {
    return (products || []).filter((p: any) => {
      const name = p.name || "UNKNOWN PRODUCT";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filter === "low") return matchesSearch && (p.stock || 0) <= (p.minStock || 5) && (p.stock || 0) > 0;
      if (filter === "out") return matchesSearch && (p.stock || 0) <= 0;
      return matchesSearch;
    });
  }, [products, searchQuery, filter]);

  // Implement a safety buffer for DOM performance
  const visibleProducts = filteredProducts.slice(0, 100);

  return (
    <div className="flex-1 industrial-panel overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
        {/* Desktop Table View */}
        <table className="data-table hidden md:table border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">PRODUCT_DETAILS</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">CATEGORY</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">STOCK_LEVEL</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">UNIT_PRICE</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">STATUS</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-right px-4 py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <InventoryTableRow 
                key={product.id}
                product={product}
                isOffline={isOffline}
                onEdit={onEdit}
                onRetire={onRetire}
                formatCurrency={formatCurrency}
              />
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden p-2 sm:p-3 space-y-2 pb-32">
          {visibleProducts.map((product) => (
            <InventoryMobileCard 
              key={product.id}
              product={product}
              isOffline={isOffline}
              onEdit={onEdit}
              onRetire={onRetire}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-20 text-center text-slate-900 dark:text-slate-500">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-display uppercase tracking-widest">
              NO_INVENTORY_RECORDS_FOUND
            </p>
          </div>
        )}

        {filteredProducts.length > 100 && (
          <div className="p-4 text-center border-t border-brand-steel/10 bg-brand-steel/5">
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              Showing top 100 results. Refine search for specific records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
