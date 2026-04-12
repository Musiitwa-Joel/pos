import React from 'react';
import { Landmark, Users } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Customer, Supplier } from '../../types';

interface FinancialReportProps {
  type: 'CREDIT_SALES' | 'SUPPLIER_PAYABLES';
  customers: Customer[];
  suppliers: Supplier[];
}

export default function FinancialReport({ type, customers, suppliers }: FinancialReportProps) {
  if (type === 'CREDIT_SALES') {
    return (
      <div className="flex-1 industrial-panel flex flex-col overflow-visible">
        <div className="industrial-alert-v2 flex-shrink-0 mb-1 hidden sm:block">
          <div className="alert-label">RECEIVABLES_AUDIT_LOGIC</div>
          <p className="font-mono leading-relaxed ">
            Showing real-time outstanding balances for all credit-enabled customers. 
            Risk levels are calculated based on balance vs. assigned credit limit.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>CUSTOMER_NAME</th>
                <th className="text-right">BALANCE</th>
                <th className="text-right hidden sm:table-cell">LIMIT</th>
                <th className="text-right hidden md:table-cell">RISK</th>
                <th className="text-right hidden lg:table-cell">LAST_PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {[...customers].sort((a,b) => b.balance - a.balance).map(c => (
                <tr key={c.id} className="hover:bg-brand-steel/5 transition-colors">
                  <td className="text-[9px] md:text-[10px] font-display uppercase font-bold truncate max-w-[120px] md:max-w-none">{c.name}</td>
                  <td className="text-right font-mono text-[10px] md:text-xs text-danger font-bold">{formatCurrency(c.balance)}</td>
                  <td className="text-right font-mono text-xs text-slate-900 dark:text-slate-500 hidden sm:table-cell">{formatCurrency(c.creditLimit || 0)}</td>
                  <td className="text-right hidden md:table-cell">
                    <span className={cn(
                      "text-[7px] md:text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap",
                      c.balance > (c.creditLimit || 0) * 0.9 ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      c.balance > (c.creditLimit || 0) * 0.5 ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    )}>
                      {c.balance > (c.creditLimit || 0) * 0.9 ? 'CRITICAL_LIMIT' : 
                       c.balance > (c.creditLimit || 0) * 0.5 ? 'MODERATE_EXPOSURE' : 'SECURE'}
                    </span>
                  </td>
                  <td className="text-right font-mono text-[9px] text-slate-900 dark:text-slate-500 uppercase italic hidden md:table-cell">
                    {c.lastPaymentDate ? new Date(c.lastPaymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'NEVER'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // SUPPLIER_PAYABLES
  return (
    <div className="flex-1 industrial-panel flex flex-col overflow-visible">
      <div className="industrial-alert-v2 flex-shrink-0 mb-1 hidden sm:block">
        <div className="alert-label">LIABILITY_PIPELINE_METRICS</div>
        <p className="font-mono leading-relaxed ">
          Detailed log of outstanding procurement balances owed to registered suppliers. 
          Total Payables represents the sum of all unpaid supply invoices.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        <table className="data-table">
          <thead>
            <tr>
              <th>SUPPLIER_ENTITY</th>
              <th className="hidden sm:table-cell">CONTACT_DATA</th>
              <th className="text-right">PAYABLE</th>
              <th className="text-right hidden md:table-cell">TOTAL_VOLUME</th>
              <th className="text-right">LAST_LOG</th>
            </tr>
          </thead>
          <tbody>
            {[...suppliers].sort((a: any, b: any) => (b.balance || 0) - (a.balance || 0)).map((s: any, i: number) => (
              <tr key={s.id || i} className="hover:bg-brand-steel/5 transition-colors">
                <td className="text-[9px] md:text-[10px] font-display uppercase font-bold truncate max-w-[120px] md:max-w-none">{s.name}</td>
                <td className="text-[9px] font-mono text-slate-900 dark:text-slate-500 uppercase hidden sm:table-cell">{s.phone} {s.email ? `| ${s.email}` : ''}</td>
                <td className="text-right font-mono text-[10px] md:text-xs text-danger font-bold">{formatCurrency(s.balance || 0)}</td>
                <td className="text-right font-mono text-xs text-slate-800 dark:text-slate-400 hidden md:table-cell">{s.totalOrders ?? 0} ORDERS</td>
                <td className="text-right font-mono text-[9px] text-slate-900 dark:text-slate-500 uppercase italic">
                   {s.lastDelivery ? new Date(s.lastDelivery).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'LOG_EMPTY'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
