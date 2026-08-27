import React from "react";
import { UserPlus, Users } from "lucide-react";
import { observer } from "@legendapp/state/react";
import { cn } from "../../lib/utils";

interface CreditHeaderProps {
  ui$: any;
  customerCount$: any;
  isOffline$: any;
  onOpenNew: () => void;
}

// 🛰️ [VANGUARD] Credit Intelligence Header:
// Reactive head-unit for debtor oversight and registry actions.
export const CreditHeader = observer(({
  ui$,
  customerCount$,
  isOffline$,
  onOpenNew,
}: CreditHeaderProps) => {
  const count = customerCount$.get();
  const isOffline = isOffline$.get();

  return (
    <div className="flex justify-between items-center shrink-0 border-b border-brand-steel/10 pb-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-lg sm:text-2xl font-display text-[var(--text-main)] uppercase tracking-tight">
          Credit // Intel
        </h1>
        <p className="text-[8px] text-slate-900 dark:text-slate-500 font-mono uppercase tracking-[0.2em] opacity-90 dark:opacity-60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          Registry: {count}_DEBTORS
        </p>
      </div>
      <button
        onClick={onOpenNew}
        disabled={isOffline}
        className={cn(
          "btn-industrial btn-primary w-auto px-4 py-2 sm:py-2.5 flex items-center justify-center gap-2 font-black tracking-widest text-[9px] uppercase transition-all",
          isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
        )}
      >
        <UserPlus size={14} />
        <span className="hidden sm:inline">{isOffline ? "SYSTEM_LOCKED" : "NEW_DEBTOR_PROFILE"}</span>
        <span className="sm:hidden">{isOffline ? "LOCKED" : "NEW"}</span>
      </button>
    </div>
  );
});
