import React, { useMemo } from "react";
import { CreditCard, History, UserCheck, Edit, Search } from "lucide-react";
import { observer } from "@legendapp/state/react";
import { formatCurrency, cn } from "../../lib/utils";

interface CreditTableProps {
  customers$: any;
  ui$: any;
  isOffline$: any;
  onRecordPayment: (customer: any) => void;
  onViewHistory: (customer: any) => void;
  onViewDetails: (customer: any) => void;
  onEditProfile: (customer: any) => void;
}

// ⚡ [ATOMIC] High-Performance Debtor Row
const DebtorRow = React.memo(({ customer, isOffline, onRecordPayment, onViewHistory, onViewDetails, onEditProfile }: any) => {
  const utilization = (customer.balance / customer.creditLimit) * 100;
  return (
    <tr className="group transition-colors hover:bg-brand-steel/5">
      <td className="sticky left-0 bg-[var(--bg-panel)] z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-steel/30 flex items-center justify-center text-xs font-display text-slate-800 dark:text-slate-400 font-bold uppercase">
            {customer.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-display text-[var(--text-main)] font-bold tracking-tight uppercase">
              {customer.name}
            </span>
            <span className="text-[9px] text-slate-900 dark:text-slate-500 font-mono font-bold">
              CONTACT: {customer.phone}
            </span>
          </div>
        </div>
      </td>
      <td>
        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-400">
          {formatCurrency(customer.creditLimit)}
        </span>
      </td>
      <td>
        <span className={cn(
          "text-xs font-mono font-bold",
          customer.balance > 0 ? "text-danger" : "text-success",
        )}>
          {formatCurrency(customer.balance)}
        </span>
      </td>
      <td>
        <div className="w-40 space-y-1">
          <div className="flex justify-between text-[8px] font-mono text-slate-900 dark:text-slate-500">
            <span>{utilization.toFixed(1)}%</span>
            <span className="font-bold">{formatCurrency(customer.creditLimit - customer.balance)} LEFT</span>
          </div>
          <div className="h-1 w-full bg-brand-dark border border-brand-steel overflow-hidden shadow-inner">
            <div
              className={cn(
                "h-full transition-all duration-500",
                utilization > 90 ? "bg-danger" : utilization > 70 ? "bg-warning" : "bg-brand-accent",
              )}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onRecordPayment(customer)}
            disabled={isOffline}
            className={cn(
              "p-1.5 text-slate-900 dark:text-slate-500 hover:text-success hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded",
              isOffline && "opacity-30 cursor-not-allowed",
            )}
            title={isOffline ? "Sync Required" : "Record Payment"}
          >
            <CreditCard size={14} />
          </button>
          <button
            onClick={() => onViewHistory(customer)}
            className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-brand-accent hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded"
            title="Payment History"
          >
            <History size={14} />
          </button>
          <button
            onClick={() => onViewDetails(customer)}
            className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)] hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded"
            title="View Details"
          >
            <UserCheck size={14} />
          </button>
          <button
            onClick={() => onEditProfile(customer)}
            disabled={isOffline}
            className={cn(
              "p-1.5 text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)] hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded",
              isOffline && "opacity-30 cursor-not-allowed",
            )}
            title={isOffline ? "Sync Required" : "Edit Customer"}
          >
            <Edit size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
});

// ⚡ [ATOMIC] High-Performance Mobile Debtor Card
const MobileDebtorCard = React.memo(({ customer, isOffline, onRecordPayment, onViewHistory, onEditProfile }: any) => {
  const utilization = (customer.balance / customer.creditLimit) * 100;
  return (
    <div className="industrial-panel p-2 sm:p-3 bg-[var(--bg-panel)] flex flex-col gap-2 sm:gap-2.5 border-brand-steel/20 hover:border-brand-accent/50 active:scale-[0.99] transition-all">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
          <h3 className="text-[10px] font-display font-black text-[var(--text-main)] uppercase tracking-tight truncate max-w-[140px]">
            {customer.name}
          </h3>
        </div>
        {utilization > 80 ? (
          <span className="text-[7px] font-display text-danger font-black uppercase tracking-widest animate-pulse">
            CRITICAL_EXPOSURE
          </span>
        ) : (
          <span className="text-[7px] font-display text-success uppercase font-bold tracking-widest opacity-90 dark:opacity-60">
            STABLE_ACCOUNT
          </span>
        )}
      </div>

      <div className="bg-black/10 p-2 border border-brand-steel/10 rounded-sm">
        <div className="flex justify-between items-end mb-1.5">
          <span className={cn(
            "text-[11px] font-mono font-black",
            customer.balance > customer.creditLimit * 0.7 ? "text-danger" : "text-brand-accent",
          )}>
            {formatCurrency(customer.balance)}
          </span>
          <span className="text-[8px] font-mono text-slate-900 dark:text-slate-500">
            {utilization.toFixed(0)}%_USED
          </span>
        </div>
        <div className="h-1 w-full bg-black/20 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full transition-all duration-700",
              utilization > 90 ? "bg-danger" : utilization > 70 ? "bg-warning" : "bg-brand-accent shadow-[0_0_8px_rgba(var(--brand-accent-rgb),0.4)]",
            )}
            style={{ width: `${Math.min(100, utilization)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 px-1 py-0.5 rounded-sm">
            {customer.phone}
          </span>
          <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 px-1 py-0.5 rounded-sm">
            LIM: {formatCurrency(customer.creditLimit).replace("USH", "")}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onRecordPayment(customer)}
            disabled={isOffline}
            className="w-8 h-8 flex items-center justify-center bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded active:bg-brand-accent active:text-white transition-all shadow-sm"
          >
            <CreditCard size={12} />
          </button>
          <button
            onClick={() => onViewHistory(customer)}
            className="w-8 h-8 flex items-center justify-center bg-brand-steel/10 text-slate-900 dark:text-slate-500 border border-brand-steel/20 rounded active:scale-95"
          >
            <History size={12} />
          </button>
          <button
            onClick={() => onEditProfile(customer)}
            disabled={isOffline}
            className="w-8 h-8 flex items-center justify-center bg-brand-steel/10 text-slate-900 dark:text-slate-500 border border-brand-steel/20 rounded active:scale-95"
          >
            <Edit size={12} />
          </button>
        </div>
      </div>
    </div>
  );
});

// 🛰️ [VANGUARD] Credit Data Registry:
// High-fidelity grid and card system for financial oversight.
export const CreditTable = observer(({
  customers$,
  ui$,
  isOffline$,
  onRecordPayment,
  onViewHistory,
  onViewDetails,
  onEditProfile
}: CreditTableProps) => {
  const searchQuery = ui$.searchQuery.get();
  const customers = customers$.get() || [];
  const isOffline = isOffline$.get();

  const filteredCustomers = useMemo(() => {
    return customers.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Performance Buffer: 100 rows
  const visibleCustomers = filteredCustomers.slice(0, 100);

  return (
    <div className="industrial-panel flex-none md:flex-1 flex flex-col md:overflow-hidden">
      {/* Search Horizon */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-brand-steel/10 bg-black/5 items-stretch sm:items-center flex-none">
        <span className="text-[10px] font-display uppercase tracking-widest text-slate-900 dark:text-slate-500 hidden sm:inline">
          CREDIT_LEDGER
        </span>
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-accent/50"
            size={14}
          />
          <input
            type="text"
            placeholder="FILTER_DEBTOR_REGISTRY..."
            className="terminal-input w-full pl-10 h-10 text-[9px] uppercase font-mono tracking-widest bg-transparent border-none"
            value={searchQuery}
            onChange={(e) => ui$.searchQuery.set(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-none md:flex-1 md:overflow-y-auto overflow-x-auto custom-scrollbar">
        {/* Desktop Table View */}
        <table className="data-table hidden md:table border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-20 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">CUSTOMER_PROFILE</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-20 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">CREDIT_LIMIT</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-20 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">CURRENT_BALANCE</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-20 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-left px-4 py-2">UTILIZATION</th>
              <th className="sticky top-0 bg-[var(--bg-panel)] z-20 border-b border-brand-steel/10 shadow-[0_1px_0_rgba(0,0,0,0.05)] text-right px-4 py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.map((customer: any) => (
              <DebtorRow 
                key={customer.id} 
                customer={customer} 
                isOffline={isOffline}
                onRecordPayment={onRecordPayment}
                onViewHistory={onViewHistory}
                onViewDetails={onViewDetails}
                onEditProfile={onEditProfile}
                formatCurrency={formatCurrency}
              />
            ))}
          </tbody>
        </table>

        {/* Mobile Credit Health Card Stack */}
        {/* 🛡️ Chassis Protocol: 100% adherence to original card stack logic */}
        <div className="md:hidden p-2 space-y-2 pb-32">
          {visibleCustomers.map((customer: any) => (
            <MobileDebtorCard 
              key={customer.id} 
              customer={customer}
              isOffline={isOffline}
              onRecordPayment={onRecordPayment}
              onViewHistory={onViewHistory}
              onEditProfile={onEditProfile}
            />
          ))}
          {filteredCustomers.length > 100 && (
            <div className="p-4 text-center">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Showing top 100 results. Refine search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
