import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Product } from '../../types';

function relativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) return 'NEVER';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (diffMs < 0) return 'NOW';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'NOW';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface InventoryReportProps {
  products: Product[];
  type: 'INVENTORY_STOCK' | 'LOW_STOCK';
}

export default React.memo(function InventoryReport({ products, type }: InventoryReportProps) {
  if (type === 'INVENTORY_STOCK') {
    return (
      <div className="flex-1 industrial-panel flex flex-col overflow-visible">
        <div className="p-4 border-b border-brand-steel flex flex-col gap-3 bg-brand-dark/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-emerald-500" />
              <h4 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest leading-none truncate max-w-[200px] sm:max-w-none">
                <span className="inline sm:hidden">VALUATION_LEDGER</span>
                <span className="hidden sm:inline">Inventory Valuation Ledger</span>
              </h4>
            </div>
            <div className="text-[8px] sm:text-[9px] font-mono text-emerald-600 uppercase font-bold tracking-widest border border-emerald-500/20 px-2 py-0.5 rounded w-fit">REAL_TIME_STATUS</div>
          </div>
          
          <div className="industrial-alert-v2 flex-shrink-0 hidden sm:block">
            <div className="alert-label">LIVE_INVENTORY_METRICS</div>
            <p className="font-mono leading-relaxed ">
              Displaying current quantity-on-hand for all registered stock items. 
              Valuation totals are calculated based on latest recorded unit costs.
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>ITEM_IDENTITY</th>
                <th className="text-right">STOCK</th>
                <th className="text-right hidden sm:table-cell">UNIT_PRICE</th>
                <th className="text-right">TOTAL_VALUE</th>
                <th className="text-right hidden md:table-cell">DAYS_IN_STOCK</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                    <td className="text-[9px] md:text-[10px] font-display uppercase truncate max-w-[150px] md:max-w-none">{p.name}</td>
                    <td className="text-right font-mono text-[10px] md:text-xs">
                      <span className={cn(p.stock <= p.minStock ? "text-orange-400" : "text-[var(--text-main)]")}>
                        {p.stock} <span className="hidden sm:inline">{p.unit}</span>
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs text-slate-800 dark:text-slate-400 hidden sm:table-cell">{formatCurrency(p.price)}</td>
                    <td className="text-right font-mono text-[10px] md:text-xs text-brand-accent font-bold">{formatCurrency(p.price * p.stock)}</td>
                    <td className="text-right font-mono text-[10px] text-[var(--text-main)] uppercase italic hidden md:table-cell">
                      {p.lastSaleDate ? relativeTime(p.lastSaleDate) : 'NEW'}
                    </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-brand-steel/10">
              <tr className="border-t-2 border-brand-steel">
                <td className="font-display text-[8px] md:text-[9px] text-slate-800 dark:text-slate-400">TOTAL_VALUATION_AGGREGATE</td>
                <td className="hidden sm:table-cell" colSpan={2}></td>
                <td className="sm:hidden"></td>
                <td className="text-right font-mono text-[10px] md:text-xs font-bold text-success">
                  {formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}
                </td>
                <td className="hidden md:table-cell"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  const lowStockItems = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="flex-1 industrial-panel flex flex-col overflow-visible">
      <div className="p-6 md:p-10 text-center flex flex-col items-center gap-3 md:gap-4 bg-orange-500/5 border-b border-brand-steel">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
          <AlertTriangle size={24} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-display text-[var(--text-main)] font-bold uppercase tracking-tight">Replenishment Alert Terminal</h2>
          <div className="industrial-alert-v2 industrial-alert-critical flex-shrink-0 mt-4 mx-auto max-w-lg hidden sm:block">
            <div className="alert-label">CRITICAL_THRESHOLD_WARNING</div>
            <p className="font-mono leading-relaxed  text-left">
              Only products with stock levels below their defined minimum are shown. 
              Consult your procurement agent to place restocking orders immediately.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-left">CRITICAL_ITEM</th>
              <th className="text-right">CURRENT</th>
              <th className="text-right hidden sm:table-cell">MIN_REQ</th>
              <th className="text-right">ORDER</th>
              <th className="text-right">TOTAL_EST_COST</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.length === 0 ? (
               <tr><td colSpan={5} className="text-center py-20 text-success font-mono text-[10px] uppercase">All stock levels satisfactory</td></tr>
            ) : lowStockItems.map(p => (
              <tr key={p.id} className="bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                <td className="text-[9px] md:text-[10px] font-display uppercase font-bold text-orange-400 truncate max-w-[110px] md:max-w-none">{p.name}</td>
                <td className="text-right font-mono text-[9px] md:text-xs text-danger font-bold whitespace-nowrap">{p.stock} <span className="hidden xs:inline">UNIT</span></td>
                <td className="text-right font-mono text-[9px] md:text-xs text-slate-800 dark:text-slate-400 hidden sm:table-cell">{p.minStock}</td>
                <td className="text-right font-mono text-[9px] md:text-xs bg-brand-accent/20 text-white font-bold whitespace-nowrap">+{p.minStock * 2 - p.stock} <span className="hidden xs:inline">PCS</span></td>
                <td className="text-right font-mono text-[9px] md:text-xs text-brand-accent whitespace-nowrap">{formatCurrency((p.minStock * 2 - p.stock) * p.costPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
})
