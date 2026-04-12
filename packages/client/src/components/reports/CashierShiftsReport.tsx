import React from 'react';
import { UserCog, Search, RefreshCw, LayoutDashboard, Package, ShieldAlert, Database, RotateCcw, Receipt } from 'lucide-react';
import { useHardware } from '../../HardwareContext';
import { toast } from 'sonner';
import { formatCurrency, cn } from '../../lib/utils';
import { Employee, Sale } from '../../types';

interface CashierShiftsReportProps {
  cashierShifts: any[];
  sales: Sale[];
  employees: Employee[];
  saleReturns: any[];
  dateRange: { start: string; end: string };
  cashierStats: {
    totalOpening: number;
    totalExpected: number;
    totalActual: number;
    totalVariance: number;
    orphanedRecoveries?: number;
  };
}

export default function CashierShiftsReport({ cashierShifts, sales, employees, saleReturns, dateRange, cashierStats }: CashierShiftsReportProps) {
  const { refreshSales, refreshReturns, fetchCashierShifts, refreshAllCustomerPayments } = useHardware();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        refreshSales(dateRange.start, dateRange.end),
        refreshReturns(dateRange.start, dateRange.end),
        fetchCashierShifts(dateRange.start, dateRange.end),
        refreshAllCustomerPayments(dateRange.start, dateRange.end)
      ]);
      toast.success('TERMINAL_SYNC_COMPLETE');
    } catch (e) {
      toast.error('SYNC_FAILED');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-visible">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {[
          { label: 'AGGR_OPENING', value: cashierStats.totalOpening, icon: <LayoutDashboard size={14} />, isCurrency: true },
          { label: 'AGGR_EXPECTED', value: cashierStats.totalExpected, icon: <Search size={14} />, highlight: true, isCurrency: true },
          { label: 'TOTAL_PHYSICAL', value: cashierStats.totalActual, icon: <Package size={14} />, color: 'text-success', isCurrency: true },
          { label: 'TOTAL_VARIANCE', value: cashierStats.totalVariance, icon: <ShieldAlert size={14} />, color: cashierStats.totalVariance < 0 ? 'text-danger' : 'text-success', isCurrency: true },
        ].map((stat, i) => (
          <div key={i} className="industrial-panel p-3 md:p-4 bg-brand-graphite/40 border-brand-steel/50 flex flex-col justify-between min-h-[85px] md:min-h-[100px] w-full">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <span className="text-[8px] md:text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest truncate">{stat.label}</span>
              <div className="text-slate-900 dark:text-slate-500 hidden sm:block">{stat.icon}</div>
            </div>
            <div className={cn("text-lg md:text-xl font-mono font-bold tracking-tight", stat.highlight ? "text-brand-accent" : stat.color || "text-[var(--text-main)]")}>
              {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
            </div>
            <div className="text-[7px] md:text-[8px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase tracking-tighter opacity-80 dark:opacity-50 truncate">REG_BAL_NODE :: {stat.label.split('_')[1]}</div>
          </div>
        ))}
      </div>

      {cashierStats.orphanedRecoveries && cashierStats.orphanedRecoveries > 0 ? (
        <div className="industrial-panel p-4 bg-success/5 border-success/20 flex items-center justify-between no-print mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center border border-success/20">
              <Receipt className="text-success" size={20} />
            </div>
            <div>
              <div className="text-[10px] font-display font-medium text-success/80 uppercase tracking-widest">OFF-SESSION COLLECTIONS DETECTED</div>
              <div className="text-[9px] font-mono text-slate-900 dark:text-slate-500 uppercase mt-0.5 opacity-90 dark:opacity-60">Revenue collected {formatCurrency(cashierStats.orphanedRecoveries)} while all terminals were closed.</div>
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-success tracking-tighter">
            +{formatCurrency(cashierStats.orphanedRecoveries)}
          </div>
        </div>
      ) : null}

      <div className="industrial-panel flex-1 bg-brand-graphite/40 border-brand-steel/50 flex flex-col overflow-visible min-h-[400px]">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-brand-steel/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-brand-graphite/60">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded">
              <Database size={14} className="text-brand-accent" />
            </div>
            <h3 className="text-[9px] md:text-[10px] font-display font-bold text-slate-800 dark:text-slate-400 uppercase tracking-[0.2em]">
              <span className="inline sm:hidden">CASHIER_RESOLVER</span>
              <span className="hidden sm:inline">Cashier_Shift_Resolver_Terminal</span>
            </h3>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 text-[8px] md:text-[9px] font-display font-bold text-slate-900 dark:text-slate-500 hover:text-brand-accent uppercase tracking-widest transition-all group disabled:opacity-80 dark:opacity-50"
            >
              <RotateCcw size={10} className={cn("group-hover:rotate-180 transition-transform duration-500", isSyncing && "animate-spin")} />
              <span>SYNC_TERMINAL</span>
            </button>
            <span className="text-[8px] md:text-[9px] font-mono text-orange-500/80 bg-orange-500/10 px-2 md:px-3 py-1 rounded-full border border-orange-500/20 italic truncate">BALANCING_LOGS</span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="min-w-[1400px] w-full border-collapse text-left font-mono text-[10px] whitespace-nowrap">
            <thead>
              <tr className="sticky top-0 bg-brand-graphite/95 backdrop-blur-sm z-30 border-b border-brand-steel/50">
                <th className="py-4 px-6 sticky left-0 bg-brand-graphite/100 z-40 border-r border-brand-steel/50 w-[180px] shadow-[4px_0_10px_rgba(0,0,0,0.5)]">CASHIER_IDENTITY</th>
                <th className="px-4">TIME_STAMP</th>
                <th className="px-4">DURATION</th>
                <th className="px-4 text-right">OPENING</th>
                <th className="px-4 text-right text-indigo-400">CASH_SALES</th>
                <th className="px-4 text-right text-cyan-400">DIGITAL_COL</th>
                <th className="px-4 text-right text-purple-400">CREDIT_SALES</th>
                <th className="px-4 text-right text-success/80">RECOVERY</th>
                <th className="px-4 text-right text-orange-500">PAYOUT_REFS</th>
                <th className="px-4 text-right text-brand-accent font-black border-l border-brand-steel/30">EXPECTED</th>
                <th className="px-4 text-right text-success font-bold">PHYSICAL</th>
                <th className="px-4 text-right">VARIANCE</th>
                <th className="px-6 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steel/30">
              {cashierShifts.length === 0 ? (
                <tr><td colSpan={13} className="text-center text-slate-900 dark:text-slate-500 font-mono text-[10px] py-20">NO_SHIFT_RECORDS_FOR_PERIOD_AUDIT</td></tr>
              ) : cashierShifts.map((s, i) => {
                const start = new Date(s.startTime);
                const end = s.endTime ? new Date(s.endTime) : null;
                return (
                  <tr key={i} className="group hover:bg-brand-accent/5 transition-colors h-14">
                    <td className="px-6 sticky left-0 bg-brand-graphite/100 z-20 border-r border-brand-steel/50 group-hover:bg-brand-graphite shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                      <div className="text-[11px] font-display font-medium text-brand-accent uppercase tracking-[0.05em]">{s.cashierName}</div>
                      <div className="text-[8px] opacity-40 uppercase tracking-tighter">Verified_Terminal_ID</div>
                    </td>
                    <td className="px-4 text-slate-800 dark:text-slate-400">
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'PRESENT'}
                    </td>
                    <td className="px-4 text-slate-900 dark:text-slate-500">{s.duration}</td>
                    <td className="px-4 text-right font-medium text-slate-800 dark:text-slate-400">{formatCurrency(s.openingCash)}</td>
                    <td className="px-4 text-right text-indigo-400 font-bold">{formatCurrency(s.cashTotal || 0)}</td>
                    <td className="px-4 text-right text-cyan-400 font-bold">{formatCurrency(s.digitalTotal || 0)}</td>
                    <td className="px-4 text-right text-purple-400 font-bold">{formatCurrency(s.creditTotal || 0)}</td>
                    <td className="px-4 text-right text-success font-bold">{formatCurrency(s.recoveryTotal || 0)}</td>
                    <td className="px-4 text-right text-orange-500 font-bold">-{formatCurrency(s.refundsTotal || 0)}</td>
                    <td className="px-4 text-right text-brand-accent font-black text-sm border-l border-brand-steel/30">{formatCurrency(s.expectedTotal)}</td>
                    <td className="px-4 text-right text-success font-bold text-xs">{formatCurrency(s.actualTotal)}</td>
                    <td className={cn("px-4 text-right font-black", s.variance < 0 ? 'text-danger shadow-[inset_-2px_0_0_#ef4444]' : s.variance > 0 ? 'text-success shadow-[inset_-2px_0_0_#10b981]' : 'text-slate-900 dark:text-slate-500')}>
                      {formatCurrency(s.variance)}
                    </td>
                    <td className="px-6 text-center">
                      <span className={cn('text-[8px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest', s.status === 'OPEN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-brand-steel/10 text-slate-900 dark:text-slate-500 border border-brand-steel/20')}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
