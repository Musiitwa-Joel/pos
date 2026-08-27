import React from "react";
import { Plus, Upload, AlertCircle, Package } from "lucide-react";
import { observer } from "@legendapp/state/react";
import { cn } from "../../lib/utils";

interface InventoryHeaderProps {
  ui$: any;
  products$: any;
  isOffline$: any;
  onOpenAdd: () => void;
  onOpenUpload: () => void;
}

// 🛰️ [VANGUARD] Inventory Intelligence Header:
// Reactive head-unit for stock oversight and registry actions.
export const InventoryHeader = observer(({
  ui$,
  products$,
  isOffline$,
  onOpenAdd,
  onOpenUpload
}: InventoryHeaderProps) => {
  const openWidget = ui$?.openWidget?.get?.();
  const products = products$?.get?.() || [];
  const isOffline = isOffline$?.get?.();

  const suggestions = React.useMemo(() => {
    return products
      .filter((p: any) => (p.stock || 0) <= (p.minStock || 5))
      .map((p: any) => ({ ...p, suggestedOrder: (p.minStock || 5) * 2 - (p.stock || 0) }));
  }, [products]);

  const deadStock = React.useMemo(() => {
    return products.filter((p: any) => (p.stock || 0) > 0 && (p.daysSinceLastSale === null || p.daysSinceLastSale > 30));
  }, [products]);

  const productCount = products.length;

  return (
    <div className="flex flex-col gap-6 shrink-0">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-display text-[var(--text-main)] uppercase tracking-tight">
            Inventory // Intelligence
          </h1>
          <p className="text-[9px] text-slate-800 dark:text-slate-500 font-mono uppercase tracking-[0.2em] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            System_Live // Total_Registry: {productCount}_Items
          </p>
        </div>
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            onClick={onOpenAdd}
            disabled={isOffline}
            className={cn(
              "btn-industrial btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] py-2 sm:py-2.5 font-black tracking-widest uppercase",
              isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
            )}
          >
            <Plus size={14} />
            {isOffline ? "LOCKED" : "REGISTER_NEW"}
          </button>
          <button
            onClick={onOpenUpload}
            disabled={isOffline}
            className={cn(
              "btn-industrial bg-brand-steel/5 border-brand-steel/30 flex items-center justify-center p-4 sm:p-2.5 hover:bg-brand-steel/20 transition-all",
              isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
            )}
            title="Import_Buffer"
          >
            <Upload size={14} className="text-brand-accent" />
          </button>
        </div>
      </div>

      {/* Intelligence Widgets (Mobile Accordion) */}
      <div className="sm:hidden space-y-2">
        <div className="industrial-panel p-2 border-orange-500/20">
          <button
            onClick={() => ui$.openWidget.set(openWidget === "restock" ? null : "restock")}
            className="w-full flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 text-orange-400">
              <AlertCircle size={14} className="shrink-0" />
              <span className="text-sm font-display uppercase tracking-widest font-black">
                Restock_Intelligence
              </span>
            </div>
            <div className="text-[10px] font-mono text-orange-400">
              {openWidget === "restock" ? "▾" : "▸"}
            </div>
          </button>
          {openWidget === "restock" && (
            <div className="mt-2 space-y-1 text-[9px] font-mono">
              {suggestions.slice(0, 3).map((s) => (
                <div key={s.id} className="flex justify-between items-center leading-none py-1">
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="text-orange-400 font-bold">
                    +{s.suggestedOrder} {s.unit}
                  </span>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="text-[9px] italic text-slate-500">ALL_STOCK_LEVELS_HEALTHY</p>
              )}
            </div>
          )}
        </div>

        <div className="industrial-panel p-2 border-brand-steel/20">
          <button
            onClick={() => ui$.openWidget.set(openWidget === "dead" ? null : "dead")}
            className="w-full flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-400">
              <Package size={14} className="shrink-0" />
              <span className="text-sm font-display uppercase tracking-widest font-black">
                Dead_Stock_Detection
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {openWidget === "dead" ? "▾" : "▸"}
            </div>
          </button>
          {openWidget === "dead" && (
            <div className="mt-2 space-y-1 text-[9px] font-mono">
              {deadStock.slice(0, 3).map((s) => (
                <div key={s.id} className="flex justify-between items-center leading-none py-1">
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="text-slate-900 font-bold">
                    {s.daysSinceLastSale === null ? "NEVER_SOLD" : `${s.daysSinceLastSale}D_STAGNANT`}
                  </span>
                </div>
              ))}
              {deadStock.length === 0 && (
                <p className="text-[9px] italic text-slate-500">NO_STAGNANT_INVENTORY_DETECTED</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Widgets (Desktop Grid) */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
        <div className="industrial-panel p-3 bg-orange-500/5 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[9px] font-display uppercase tracking-widest font-black">
              Restock_Intelligence
            </span>
          </div>
          <div className="space-y-1.5">
            {suggestions.slice(0, 3).map((s) => (
              <div key={s.id} className="flex justify-between items-center text-[9px] font-mono leading-none py-1 border-b border-orange-500/10 last:border-0">
                <span className="text-[var(--text-main)] opacity-70 truncate pr-4">{s.name}</span>
                <span className="text-orange-400 shrink-0 font-bold">+{s.suggestedOrder} {s.unit}</span>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="text-[9px] text-slate-500 font-mono italic p-1">ALL_STOCK_LEVELS_HEALTHY</p>
            )}
          </div>
        </div>
        <div className="industrial-panel p-3 bg-[var(--bg-inset)] border-brand-steel/30">
          <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-400">
            <Package size={14} className="shrink-0" />
            <span className="text-[9px] font-display uppercase tracking-widest font-black">
              Dead_Stock_Detection
            </span>
          </div>
          <div className="space-y-1.5">
            {deadStock.slice(0, 3).map((s) => (
              <div key={s.id} className="flex justify-between items-center text-[9px] font-mono leading-none py-1 border-b border-brand-steel/5 last:border-0">
                <span className="text-[var(--text-main)] opacity-70 truncate pr-4">{s.name}</span>
                <span className="text-slate-900 dark:text-slate-500 uppercase tracking-tighter shrink-0 font-bold">
                  {s.daysSinceLastSale === null ? "NEVER_SOLD" : `${s.daysSinceLastSale}D_STAGNANT`}
                </span>
              </div>
            ))}
            {deadStock.length === 0 && (
              <p className="text-[9px] text-slate-500 font-mono italic p-1">NO_STAGNANT_INVENTORY_DETECTED</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
