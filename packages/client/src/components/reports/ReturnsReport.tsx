import React from 'react';
import { RotateCcw, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../types';

interface ReturnsReportProps {
  saleReturns: any[];
  products: Product[];
  totalRefunds: number;
}

export default function ReturnsReport({ saleReturns, products, totalRefunds }: ReturnsReportProps) {
  const avgReturn = saleReturns.length > 0 ? totalRefunds / saleReturns.length : 0;
  
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-visible">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        {[
          { label: 'TOTAL_REFUNDED', value: formatCurrency(totalRefunds), color: 'text-orange-500' },
          { label: 'RETURN_VOLUME', value: `${saleReturns.length} ITEMS`, color: 'text-slate-300' },
          { label: 'AVG_RETURN_VAL', value: formatCurrency(avgReturn), color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="industrial-panel p-3 sm:p-4 bg-brand-dark/20 flex flex-col gap-1 border-brand-steel/30">
            <span className="text-[9px] font-display text-slate-900 dark:text-slate-500 tracking-widest">{stat.label}</span>
            <div className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="industrial-panel flex-1 flex flex-col overflow-visible">
        <div className="industrial-panel-header border-b border-brand-steel pb-4 mb-4">
          <div className="flex items-center gap-2 px-4">
            <RotateCcw size={16} className="text-red-500 shrink-0" />
            <h4 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest truncate">Reversed Sales Audit</h4>
          </div>
        </div>
      
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="data-table min-w-[800px]">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>PRODUCT_IDENTITY</th>
              <th className="text-right">QTY</th>
              <th className="text-right">REFUND_AMOUNT</th>
              <th>REASON</th>
            </tr>
          </thead>
          <tbody>
            {saleReturns.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-slate-900 dark:text-slate-500 font-mono text-[10px]">
                  NO_RETURN_RECORDS_FOUND_FOR_PERIOD
                </td>
              </tr>
            ) : (
              saleReturns.map((ret, i) => {
                const product = products.find(p => p.id === ret.productId);
                return (
                  <tr key={ret.id || i} className="group hover:bg-red-500/5 transition-colors">
                    <td className="font-mono text-[10px] text-slate-800 dark:text-slate-400">
                      {new Date(ret.createdAt).toLocaleString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-display text-[10px] text-[var(--text-main)] uppercase group-hover:text-red-500 transition-colors">
                          {product?.name || 'Unknown Item'}
                        </span>
                        <span className="text-[8px] font-mono text-slate-900 dark:text-slate-500">ID: {ret.productId.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="text-right font-mono text-xs text-brand-accent">{ret.quantity}</td>
                    <td className="text-right font-mono text-xs text-danger font-bold">{formatCurrency(ret.amount)}</td>
                    <td className="text-[9px] font-mono text-slate-900 dark:text-slate-500 italic uppercase">
                      <div className="flex items-center gap-1">
                        <Package size={10} className="opacity-80 dark:opacity-50" />
                        {ret.reason || 'NO_REASON_SPECIFIED'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
