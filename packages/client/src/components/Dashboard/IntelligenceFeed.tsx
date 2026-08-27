import React from 'react';
import { 
  ClipboardList, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingDown 
} from 'lucide-react';
import { observer } from '@legendapp/state/react';
import { useIntelligence } from '../../contexts/IntelligenceContext';
import { formatCurrency, cn } from '../../lib/utils';

// 🛰️ [VANGUARD] Live Event Matrix:
// High-frequency reactive list. Only this component wakes up when 
// new transactions enter the pipeline.
export const IntelligenceFeed = observer(() => {
  const { combinedLogs$ } = useIntelligence();
  const combinedLogs = combinedLogs$.get();

  return (
    <div className="industrial-panel flex flex-col min-h-[400px]">
      <div className="industrial-panel-header bg-[var(--panel-bg)]/40 flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-brand-accent" />
          <span className="text-[10px] font-display">INTELLIGENCE_FEED</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-mono text-brand-accent">● LIVE_DATA</span>
          <span className="text-[6px] font-mono text-slate-500 uppercase tracking-tighter">Buffer: 4096KB</span>
        </div>
      </div>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {combinedLogs.map((log: any, i) => {
          const isReturn = log.type === 'RETURN';
          const isExpense = log.type === 'EXPENSE';
          const isSale = log.type === 'SALE';
          
          return (
            <div key={i} className={cn(
              "flex items-center justify-between p-3 border group transition-all",
              isSale ? "border-brand-steel bg-brand-dark/5 hover:border-brand-accent/50" : 
              isExpense ? "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50" :
              "border-danger/30 bg-danger/5 hover:border-danger/60"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  isSale ? "bg-brand-steel/10 text-brand-accent" : 
                  isExpense ? "bg-orange-500/10 text-orange-400" :
                  "bg-danger/10 text-danger"
                )}>
                  {isSale ? <ArrowUpRight size={14} /> : 
                   isExpense ? <ArrowDownRight size={14} /> : 
                   <TrendingDown size={14} />}
                </div>
                <div>
                  <p className="text-[9px] font-display">
                    {isSale ? log.paymentMethod?.toUpperCase() : 
                     isExpense ? log.category?.toUpperCase() : 
                     `REFUND: ${log.reason?.toUpperCase() || 'UNSPECIFIED'}`}
                  </p>
                  <p className="text-[8px] text-slate-900 dark:text-slate-500 font-mono mt-0.5">
                    {new Date(log.sortDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // {log.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-xs font-mono font-bold",
                  isSale ? "text-brand-accent" : "text-danger"
                )}>
                  {isSale ? '+' : '-'}{formatCurrency(log.total || log.amount)}
                </span>
              </div>
            </div>
          );
        })}
        {combinedLogs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 py-20">
            <p className="text-[10px] font-display uppercase tracking-widest opacity-30">Await_Telemetry...</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-brand-steel bg-[var(--panel-bg)]/20">
        <button className="btn-industrial btn-outline w-full text-[9px] tracking-widest">
          SYSTEM_CONSOLIDATION_VIEW
        </button>
      </div>
    </div>
  );
});
