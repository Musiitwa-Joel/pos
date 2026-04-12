import React from 'react';
import { History, Truck } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Product, Supplier } from '../../types';

interface PurchaseReportProps {
  transactions: any[];
  products: Product[];
  suppliers: Supplier[];
}

export default function PurchaseReport({ transactions, products, suppliers }: PurchaseReportProps) {
  // Only keep stock_in and purchase
  const purchases = transactions.filter(t => t.type === 'stock_in' || t.type === 'purchase');

  const totalProcuredUnits = purchases.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalProcuredValue = purchases.reduce((acc, t) => {
    const cost = t.unitCost || (products.find(p => p.id === t.productId)?.costPrice || 0);
    return acc + (cost * (t.quantity || 0));
  }, 0);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-visible">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        {[
          { label: 'TOTAL_PROCURED_VALUE', value: formatCurrency(totalProcuredValue), color: 'text-sky-500' },
          { label: 'UNITS_PROCURED', value: `${totalProcuredUnits} UNITS`, color: 'text-slate-300' },
          { label: 'TRANSACTION_COUNT', value: `${purchases.length} TXNS`, color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="industrial-panel p-3 sm:p-4 bg-brand-dark/20 flex flex-col gap-1 border-brand-steel/30">
            <span className="text-[9px] font-display text-slate-900 dark:text-slate-500 tracking-widest">{stat.label}</span>
            <div className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="industrial-panel flex-1 flex flex-col overflow-visible">
        <div className="industrial-panel-header border-b border-brand-steel pb-4 mb-4 flex flex-col gap-4 px-4">
          <div className="flex items-center gap-2 w-full">
            <History size={16} className="text-sky-500 shrink-0" />
            <h4 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest leading-none truncate">Procurement Audit Log</h4>
          </div>
          
          <div className="industrial-alert-v2 flex-shrink-0">
            <div className="alert-label">DATA_PIPE_SCOPE</div>
            <p className="font-mono leading-relaxed ">
              Only products restocked or purchased within the selected date range are indexed below. 
              Real-time stock quantities for all items are located in the <span className="text-sky-400 font-bold tracking-widest">[Inventory]</span> report module.
            </p>
          </div>
        </div>
      
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>PRODUCT_IDENTITY</th>
                <th>SUPPLIER_REF</th>
                <th className="text-right">QTY_RECEIVED</th>
                <th className="text-right">UNIT_COST</th>
                <th className="text-right">TOTAL_VALUATION</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-900 dark:text-slate-500 font-mono text-[10px]">
                    NO_PROCUREMENT_RECORDS_FOUND_FOR_PERIOD
                  </td>
                </tr>
              ) : (
                purchases.map((txn, i) => {
                  const product = products.find(p => p.id === txn.productId);
                  const isSupplierRef = txn.referenceId && txn.referenceId.length >= 8;
                  const supplier = isSupplierRef ? suppliers.find(s => s.id === txn.referenceId) : null;
                  
                  const cost = txn.unitCost || product?.costPrice || 0;
                  const total = cost * txn.quantity;

                  return (
                    <tr key={txn.id || i} className="group hover:bg-sky-500/5 transition-colors">
                      <td className="font-mono text-[10px] text-slate-800 dark:text-slate-400">
                        {new Date(txn.createdAt).toLocaleString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-display text-[10px] text-[var(--text-main)] uppercase group-hover:text-sky-500 transition-colors">
                            {product?.name || 'Unknown Item'}
                          </span>
                          <span className="text-[8px] font-mono text-slate-900 dark:text-slate-500">ID: {txn.productId.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td>
                        {supplier ? (
                          <div className="flex flex-col">
                            <span className="font-display text-[10px] text-amber-500 uppercase">
                              {supplier.name}
                            </span>
                            <span className="text-[8px] font-mono text-slate-900 dark:text-slate-500">REF: {txn.referenceId?.slice(0,8) || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-900 dark:text-slate-500 block pt-1">
                            {txn.referenceId || 'INTERNAL_ADJUSTMENT'}
                          </span>
                        )}
                      </td>
                      <td className="text-right font-mono text-xs text-sky-500 font-bold">+{txn.quantity}</td>
                      <td className="text-right font-mono text-xs text-slate-900 dark:text-slate-500">{formatCurrency(cost)}</td>
                      <td className="text-right font-mono text-xs text-[var(--text-main)] font-bold">{formatCurrency(total)}</td>
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
