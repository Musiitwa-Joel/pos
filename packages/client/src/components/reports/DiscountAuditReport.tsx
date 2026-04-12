import React, { useMemo } from 'react';
import { Tag, ShieldAlert, User, DollarSign, Percent, TrendingDown } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

interface DiscountAuditReportProps {
  sales: any[];
  employees: any[];
}

export default function DiscountAuditReport({ sales, employees }: DiscountAuditReportProps) {
  const discountSales = useMemo(() => {
    return sales
      .filter(s => (s.discount || 0) > 0)
      .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
      .map(s => {
        const originalSubtotal = s.subtotal || 1;
        const discountRate = s.discount / originalSubtotal;
        
        const netSubtotal = s.items?.reduce((acc: number, item: any) => {
          const remainingQty = (item.quantity || 0) - (item.returnedQuantity || 0);
          return acc + (remainingQty * (item.unitPrice || 0));
        }, 0) || 0;
        
        const netDiscount = netSubtotal * discountRate;
        const isPartiallyReturned = s.items?.some((i: any) => (i.returnedQuantity || 0) > 0);
        const isFullyReturned = isPartiallyReturned && netSubtotal <= 0;

        return {
          ...s,
          netSubtotal,
          netDiscount,
          isPartiallyReturned,
          isFullyReturned,
          originalDiscount: s.discount,
          originalSubtotal: s.subtotal
        };
      });
  }, [sales]);

  const stats = useMemo(() => {
    const totalDiscount = discountSales.reduce((acc, s) => acc + s.netDiscount, 0);
    const totalRevenue = discountSales.reduce((acc, s) => acc + s.netSubtotal, 0);
    const avgPercentage = totalRevenue > 0 ? (totalDiscount / totalRevenue) * 100 : 0;
    
    const promoSavings = discountSales.filter(s => s.promoId).reduce((acc, s) => acc + s.netDiscount, 0);
    const manualOverrides = totalDiscount - promoSavings;

    return { totalDiscount, avgPercentage, promoSavings, manualOverrides, count: discountSales.filter(s => !s.isFullyReturned).length };
  }, [discountSales]);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="industrial-panel p-4 border-l-4 border-brand-accent">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-500 mb-2">
            <TrendingDown size={14} />
            <span className="text-[9px] font-display uppercase tracking-widest">Net_Revenue_Discounted</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--text-main)]">
            {formatCurrency(stats.totalDiscount)}
          </div>
          <div className="text-[9px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase">
            Effective Leakage ({stats.count} ACTIVE)
          </div>
        </div>

        <div className="industrial-panel p-4 border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-500 mb-2">
            <Tag size={14} />
            <span className="text-[9px] font-display uppercase tracking-widest">Net_Promotional_Savings</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-500">
            {formatCurrency(stats.promoSavings)}
          </div>
          <div className="text-[9px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase">
            Retained Value
          </div>
        </div>

        <div className="industrial-panel p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-500 mb-2">
            <ShieldAlert size={14} />
            <span className="text-[9px] font-display uppercase tracking-widest">Effective_Manual_Overrides</span>
          </div>
          <div className="text-2xl font-mono font-bold text-orange-500">
            {formatCurrency(stats.manualOverrides)}
          </div>
          <div className="text-[9px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase">
            Excluding Recovered
          </div>
        </div>

        <div className="industrial-panel p-4 border-l-4 border-brand-steel">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-500 mb-2">
            <Percent size={14} />
            <span className="text-[9px] font-display uppercase tracking-widest">Effective_Leakage_Rate</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-300">
            {stats.avgPercentage.toFixed(2)}%
          </div>
          <div className="text-[9px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase">
            Post-Return Ratio
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="industrial-panel flex flex-col md:min-h-[400px] overflow-visible">
        <div className="industrial-panel-header border-b border-brand-steel/50">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-brand-accent" />
            <span className="text-[10px] font-display uppercase tracking-widest">Discount_Audit_Log // NET_COMPLIANCE_VIEW</span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar text-[10px]">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-brand-steel/30 text-slate-800 dark:text-slate-400 text-left font-mono border-b border-brand-steel">
                <th className="p-3 font-medium uppercase tracking-widest hidden sm:table-cell">Timestamp</th>
                <th className="p-3 font-medium uppercase tracking-widest text-brand-accent">ID</th>
                <th className="p-3 font-medium uppercase tracking-widest hidden md:table-cell">Cashier</th>
                <th className="p-3 font-medium uppercase tracking-widest text-right hidden lg:table-cell">Net_Subtotal</th>
                <th className="p-3 font-medium uppercase tracking-widest truncate">Type / Offer</th>
                <th className="p-3 font-medium uppercase tracking-widest text-right">Discount</th>
                <th className="p-3 font-medium uppercase tracking-widest text-right hidden sm:table-cell">%</th>
              </tr>
            </thead>
            <tbody className="font-mono divide-y divide-brand-steel/30">
              {discountSales.map(sale => {
                const discountPercent = (sale.netDiscount / (sale.netSubtotal || 1)) * 100;
                const isHigh = discountPercent > 15;
                const cashier = employees.find(e => e.id === sale.cashierId)?.name || sale.cashierName || 'System';

                return (
                  <tr key={sale.id} className={cn("hover:bg-brand-accent/5 transition-colors group", sale.isFullyReturned && "opacity-40 grayscale bg-red-500/5")}>
                    <td className="p-3 text-slate-900 dark:text-slate-500 whitespace-nowrap hidden sm:table-cell text-[9px]">
                      {new Date(sale.createdAt || sale.timestamp).toLocaleString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-bold text-brand-accent">
                      <div className="flex flex-col gap-1">
                        <span className="hidden sm:inline">#{sale.id.slice(0, 8)}</span>
                        <span className="inline sm:hidden">#{sale.id.slice(0, 4)}</span>
                        {sale.isFullyReturned ? (
                          <span className="text-[7px] bg-red-500/20 text-red-500 px-1 py-0.5 rounded border border-red-500/20 w-fit">FULLY_REVERSED</span>
                        ) : sale.isPartiallyReturned ? (
                          <span className="text-[7px] bg-orange-500/20 text-orange-500 px-1 py-0.5 rounded border border-orange-500/20 w-fit">PARTIALLY_RECOVERED</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <User size={10} className="text-slate-900 dark:text-slate-500" />
                        <span>{cashier}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-slate-800 dark:text-slate-400 hidden lg:table-cell">
                      <div className="flex flex-col items-end">
                        <span>{formatCurrency(sale.netSubtotal)}</span>
                        {sale.isPartiallyReturned && (
                          <span className="text-[7px] line-through opacity-80 dark:opacity-50">{formatCurrency(sale.originalSubtotal)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {sale.promoName ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 rounded-full text-[8px]">
                          <Tag size={8} /> {sale.promoName}
                        </span>
                      ) : (
                        <span className="text-slate-900 dark:text-slate-500 italic">Manual_Override</span>
                      )}
                    </td>
                    <td className={cn("p-3 text-right font-bold text-[10px]", isHigh ? "text-danger" : "text-slate-300")}>
                      <div className="flex flex-col items-end">
                        <span>-{formatCurrency(sale.netDiscount)}</span>
                        {sale.isPartiallyReturned && (
                          <span className="text-[7px] line-through opacity-80 dark:opacity-50">-{formatCurrency(sale.originalDiscount)}</span>
                        )}
                      </div>
                    </td>
                    <td className={cn("p-3 text-right font-bold hidden sm:table-cell", isHigh ? "text-danger" : "text-slate-900 dark:text-slate-500")}>
                      {discountPercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {discountSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-slate-900 dark:text-slate-500 italic">
                    NO_DISCOUNT_ACTIVITY_LOGGED_FOR_PERIOD
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
