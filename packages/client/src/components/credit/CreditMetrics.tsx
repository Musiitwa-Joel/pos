import React from "react";
import { CreditCard, AlertCircle, TrendingUp } from "lucide-react";
import { observer } from "@legendapp/state/react";
import { formatCurrency } from "../../lib/utils";

interface CreditMetricsProps {
  ui$: any;
  totalOutstanding$: any;
  criticalDebtors$: any;
  recoveredToday$: any;
}

// 🛰️ [VANGUARD] Credit Metric Intelligence:
// High-fidelity performance cards with mobile accordion support.
// 🛡️ PRESERVING ORIGINAL MOBILE DESIGN LAYOUT.
export const CreditMetrics = observer(({
  ui$,
  totalOutstanding$,
  criticalDebtors$,
  recoveredToday$,
}: CreditMetricsProps) => {
  const openMetric = ui$.openMetric.get();
  const totalOutstanding = totalOutstanding$.get();
  const criticalDebtors = criticalDebtors$.get();
  const recoveredToday = recoveredToday$.get();

  return (
    <>
      {/* Mobile Credit Health: Accordion Stack (md:hidden) */}
      {/* 🛡️ Chassis Protocol: Maintaining 100% original mobile design */}
      <div className="md:hidden space-y-2 -mx-4 px-4">
        <div className="industrial-panel p-2 bg-danger/5 border-danger/20">
          <button
            className="w-full flex items-center justify-between"
            onClick={() =>
              ui$.openMetric.set(openMetric === "outstanding" ? null : "outstanding")
            }
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-dark border border-danger/20 text-danger scale-90">
                <CreditCard size={14} />
              </div>
              <div className="text-[9px] font-display uppercase tracking-widest">
                Total_Receivables
              </div>
            </div>
            <div className="text-sm font-mono">
              {openMetric === "outstanding" ? "▾" : "▸"}
            </div>
          </button>
          {openMetric === "outstanding" && (
            <div className="mt-2">
              <div className="text-sm font-display text-[var(--text-main)]">
                {formatCurrency(totalOutstanding)}
              </div>
            </div>
          )}
        </div>

        <div className="industrial-panel p-2 bg-warning/5 border-warning/20">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => ui$.openMetric.set(openMetric === "risk" ? null : "risk")}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-dark border border-warning/20 text-warning scale-90">
                <AlertCircle size={14} />
              </div>
              <div className="text-[9px] font-display uppercase tracking-widest">
                Critical_Profiles
              </div>
            </div>
            <div className="text-sm font-mono">
              {openMetric === "risk" ? "▾" : "▸"}
            </div>
          </button>
          {openMetric === "risk" && (
            <div className="mt-2">
              <div className="text-sm font-display text-[var(--text-main)]">
                {criticalDebtors}{" "}
                <span className="text-[8px] opacity-90">ACCTS</span>
              </div>
            </div>
          )}
        </div>

        <div className="industrial-panel p-2 bg-success/5 border-success/20">
          <button
            className="w-full flex items-center justify-between"
            onClick={() =>
              ui$.openMetric.set(openMetric === "recovered" ? null : "recovered")
            }
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-dark border border-success/20 text-success scale-90">
                <TrendingUp size={14} />
              </div>
              <div className="text-[9px] font-display uppercase tracking-widest">
                Recovered_Today
              </div>
            </div>
            <div className="text-sm font-mono">
              {openMetric === "recovered" ? "▾" : "▸"}
            </div>
          </button>
          {openMetric === "recovered" && (
            <div className="mt-2">
              <div className="text-sm font-display text-[var(--text-main)]">
                {formatCurrency(recoveredToday)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Metric Horizon: Grid Layout (md:grid) */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 overflow-x-auto no-scrollbar pb-2 md:-mx-6 md:px-6 shrink-0 mask-linear-right">
        {/* Metric Card: Outstanding */}
        <div className="industrial-panel p-3 bg-danger/5 border-danger/20 min-w-[160px] flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1 bg-brand-dark border border-danger/20 text-danger scale-90">
              <CreditCard size={14} />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          </div>
          <p className="text-[7px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            Total_Receivables
          </p>
          <h3 className="text-sm font-display text-[var(--text-main)] tracking-widest">
            {formatCurrency(totalOutstanding)}
          </h3>
        </div>

        {/* Metric Card: Risk */}
        <div className="industrial-panel p-3 bg-warning/5 border-warning/20 min-w-[160px] flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1 bg-brand-dark border border-warning/20 text-warning scale-90">
              <AlertCircle size={14} />
            </div>
            <span className="text-[7px] font-display text-warning uppercase font-black tracking-tighter">
              RISK
            </span>
          </div>
          <p className="text-[7px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            Critical_Profiles
          </p>
          <h3 className="text-sm font-display text-[var(--text-main)] tracking-widest">
            {criticalDebtors}{" "}
            <span className="text-[8px] opacity-90 dark:opacity-60">ACCTS</span>
          </h3>
        </div>

        {/* Metric Card: Recovery */}
        <div className="industrial-panel p-3 bg-success/5 border-success/20 min-w-[160px] flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1 bg-brand-dark border border-success/20 text-success scale-90">
              <TrendingUp size={14} />
            </div>
            <span className="text-[7px] font-display text-success uppercase font-black tracking-tighter">
              FLOW
            </span>
          </div>
          <p className="text-[7px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            Recovered_Today
          </p>
          <h3 className="text-sm font-display text-[var(--text-main)] tracking-widest">
            {formatCurrency(recoveredToday)}
          </h3>
        </div>
      </div>
    </>
  );
});
