import React from 'react';
import { Landmark } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

interface CashFlowReportProps {
  cashFlow: {
    totalInflow: number;
    totalExpenses: number;
    totalRefunds: number;
    totalOutflow: number;
    netCash: number;
    daily: { date: string; inflow: number; outflow: number }[];
  };
}

export default function CashFlowReport({ cashFlow }: CashFlowReportProps) {
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-visible">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {[
          { label: 'TOTAL_INFLOW', value: formatCurrency(cashFlow.totalInflow), color: 'text-success' },
          { label: 'TOTAL_EXPENSES', value: formatCurrency(cashFlow.totalExpenses), color: 'text-danger' },
          { label: 'TOTAL_REFUNDS', value: formatCurrency(cashFlow.totalRefunds), color: 'text-orange-400' },
          { label: 'NET_CASH_FLOW', value: formatCurrency(cashFlow.netCash), color: cashFlow.netCash >= 0 ? 'text-success' : 'text-danger' },
        ].map((stat, i) => (
          <div key={i} className="industrial-panel p-3 md:p-4 flex flex-col gap-1 md:gap-2 bg-brand-dark/20 border-brand-steel/30">
            <span className="text-[8px] md:text-[9px] font-display text-slate-900 dark:text-slate-500 tracking-widest truncate">{stat.label}</span>
            <div className={`text-lg md:text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
      
      <div className="industrial-panel flex-1 overflow-visible flex flex-col">
        <div className="p-4 border-b border-brand-steel flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 bg-brand-dark/30">
          <div className="flex items-center gap-2">
            <Landmark size={14} className="text-cyan-500" />
            <div className="text-[9px] md:text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest">
              <span className="inline sm:hidden">CASH_MOVEMENT_LEDGER</span>
              <span className="hidden sm:inline">Daily Cash Movement Ledger</span>
            </div>
          </div>
          <div className="text-[9px] md:text-[10px] font-mono text-brand-accent uppercase italic">Inflows vs Outflows</div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-1">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left text-[10px] md:text-xs">DATE_STAMP</th>
                <th className="text-right sm:text-center text-[10px] sm:text-xs min-w-[120px]">
                   <span className="inline-flex sm:hidden">MOVEMENT [IN/OUT]</span>
                   <span className="hidden sm:inline-flex">INFLOW vs OUTFLOW</span>
                </th>
                <th className="text-right min-w-[100px]">NET_DELTA</th>
                <th className="text-right hidden md:table-cell">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {cashFlow.daily.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-900 dark:text-slate-500 font-mono text-[10px] py-20">NO_TRANSACTIONS_IN_SELECTED_PERIOD</td></tr>
              ) : cashFlow.daily.map((row, i) => {
                const net = row.inflow - row.outflow;
                return (
                  <tr key={i} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="font-mono text-[9px] md:text-[10px] text-slate-800 dark:text-slate-400">
                      <div className="flex flex-col sm:block">
                        <span className="font-bold sm:font-normal">{new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        <span className="text-[8px] sm:text-[10px] opacity-90 dark:opacity-60 sm:ml-1 uppercase">{new Date(row.date).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                      </div>
                    </td>
                    <td className="text-right sm:text-center">
                       <div className="flex flex-col sm:flex-row sm:justify-center items-end sm:items-baseline gap-0.5 sm:gap-4 font-mono text-[9px] md:text-xs">
                          <span className="text-success inline-flex">+{formatCurrency(row.inflow)}</span>
                          <span className="text-danger inline-flex text-[8px] sm:text-xs decoration-danger/30">-{formatCurrency(row.outflow)}</span>
                       </div>
                    </td>
                    <td className={`text-right font-mono text-[11px] md:text-xs font-black ${net >= 0 ? 'text-success' : 'text-danger'}`}>
                       {formatCurrency(net)}
                    </td>
                    <td className="text-right hidden md:table-cell">
                      <span className={cn('text-[8px] px-2 py-0.5 rounded-full font-bold', net >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                        {net >= 0 ? 'SURPLUS' : 'DEFICIT'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {cashFlow.daily.length > 0 && (
              <tfoot className="bg-brand-steel/10">
                <tr className="border-t-2 border-brand-steel">
                  <td className="font-display text-[9px] text-slate-800 dark:text-slate-400">_PERIOD_TOTALS</td>
                  <td className="text-right sm:text-center">
                     <div className="flex flex-col sm:flex-row sm:justify-center items-end sm:items-baseline gap-0.5 sm:gap-4 font-mono text-[9px] md:text-xs font-bold">
                        <span className="text-success">+{formatCurrency(cashFlow.totalInflow)}</span>
                        <span className="text-danger text-[8px] sm:text-xs">-{formatCurrency(cashFlow.totalOutflow)}</span>
                     </div>
                  </td>
                  <td className={cn("text-right font-mono text-[10px] md:text-xs font-black bg-brand-accent/5 px-2", cashFlow.netCash >= 0 ? "text-success" : "text-danger")}>
                    {formatCurrency(cashFlow.netCash)}
                  </td>
                  <td className="text-right font-display text-[8px] text-slate-900 dark:text-slate-500 uppercase tracking-tighter hidden md:table-cell">
                   verified_net_liquidity
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
