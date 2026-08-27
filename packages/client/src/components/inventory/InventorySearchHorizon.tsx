import React from "react";
import { Search } from "lucide-react";
import { observer } from "@legendapp/state/react";
import { cn } from "../../lib/utils";

interface InventorySearchHorizonProps {
  ui$: any;
}

// 🛰️ [VANGUARD] Inventory Search Horizon:
// High-frequency reactive corridor for system filtering.
export const InventorySearchHorizon = observer(({ ui$ }: InventorySearchHorizonProps) => {
  const filter = ui$.filter.get();
  const searchQuery = ui$.searchQuery.get();

  return (
    <div className="flex flex-col gap-3 py-2 border-y border-brand-steel/10 bg-black/5 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0">
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-accent/50"
          size={14}
        />
        <input
          type="text"
          placeholder="FILTER_SYSTEM_BUFFER..."
          className="terminal-input w-full pl-10 h-10 text-[9px] uppercase font-mono tracking-widest bg-transparent border-none"
          value={searchQuery}
          onChange={(e) => ui$.searchQuery.set(e.target.value)}
        />
      </div>

      {/* Filter Horizon Scrollable */}
      <div className="flex gap-2 flex-wrap sm:overflow-x-auto pb-1 scrollbar-hide no-scrollbar px-2 mask-linear-right">
        <button
          onClick={() => ui$.filter.set("all")}
          className={cn(
            "px-3 sm:px-4 h-8 flex items-center justify-center whitespace-nowrap text-[8px] font-display uppercase tracking-widest transition-all rounded-sm",
            filter === "all"
              ? "bg-brand-accent text-white shadow-lg"
              : "bg-brand-steel/10 text-slate-700 dark:text-slate-500 hover:bg-brand-steel/20",
          )}
        >
          ALL_RECORDS
        </button>
        <button
          onClick={() => ui$.filter.set("low")}
          className={cn(
            "px-3 sm:px-4 h-8 flex items-center justify-center whitespace-nowrap text-[8px] font-display uppercase tracking-widest transition-all rounded-sm",
            filter === "low"
              ? "bg-orange-500 text-white shadow-lg"
              : "bg-brand-steel/10 text-slate-700 dark:text-slate-500 hover:bg-brand-steel/20",
          )}
        >
          LOW_THRESHOLD
        </button>
        <button
          onClick={() => ui$.filter.set("out")}
          className={cn(
            "px-3 sm:px-4 h-8 flex items-center justify-center whitespace-nowrap text-[8px] font-display uppercase tracking-widest transition-all rounded-sm",
            filter === "out"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-brand-steel/10 text-slate-700 dark:text-slate-500 hover:bg-brand-steel/20",
          )}
        >
          ZERO_STOCK
        </button>
      </div>
    </div>
  );
});
