import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuditTrailReportProps {
  auditLogs: any[];
}

const formatAction = (action: string) => {
  switch (action) {
    case 'TRANSACTION_AUTHORIZED': return 'Transaction Authorized';
    case 'HIGH_VALUE_SALE_OR_DISCOUNT': return 'Flagged: High Value / Manual Discount';
    case 'MANUAL_DISCOUNT_APPLIED': return 'Manual Discount Applied';
    case 'PROMOTION_REDEEMED': return 'Promotion Redeemed';
    case 'SALE_RETURN': return 'Inventory Return Processed';
    case 'CREATE_PROMOTION': return 'Promotion Created';
    case 'UPDATE_PROMOTION': return 'Promotion Config Updated';
    case 'PROMOTION_EXTENDED': return 'Promotion Duration Extended';
    case 'TOGGLE_PROMOTION': return 'Promotion Status Changed';
    case 'DELETE_PROMOTION': return 'Promotion Removed';
    default: return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
};

export default function SecurityAuditTrail({ auditLogs }: AuditTrailReportProps) {
  return (
    <div className="flex-1 industrial-panel flex flex-col overflow-visible">
      <div className="p-4 border-b border-brand-steel flex flex-col gap-3 bg-red-600/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-red-500 shrink-0" />
            <h4 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest leading-none flex items-center gap-2">
              Security_Audit_Terminal 
              <span className="text-[8px] bg-brand-accent/20 text-brand-accent px-1 py-0.5 rounded animate-pulse">[BETA_V2]</span>
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></div>
            <span className="text-[9px] font-mono text-slate-900 dark:text-slate-500 uppercase tracking-tighter italic truncate">Administrative_Activity_Monitor</span>
          </div>
        </div>
        
        <div className="industrial-alert-v2 industrial-alert-critical flex-shrink-0 bg-red-950/20">
          <div className="alert-label">ENCRYPTED_SECURITY_NOTICE</div>
          <p className="font-mono leading-relaxed ">
            Forensic log of all administrative actions and data mutations. 
            All entries are <span className="text-red-400 font-bold tracking-widest">[IMMUTABLE]</span> and encrypted for auditing.
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="data-table min-w-[900px]">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>OPERATOR</th>
              <th>EVENT_SUMMARY</th>
              <th>TARGET_RESOURCE</th>
              <th>LOGGED_DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-20 text-[10px] font-mono text-slate-900 dark:text-slate-500 uppercase tracking-[0.3em]">No security records found for selected period</td></tr>
            ) : auditLogs.map((log, i) => (
              <tr key={i} className="hover:bg-brand-steel/5 transition-colors group">
                <td className="font-mono text-[9px] text-slate-800 dark:text-slate-800 dark:text-slate-400 italic font-medium">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="text-[10px] font-display uppercase font-bold text-black dark:text-slate-300">
                  {log.user?.username || 'SYSTEM'}
                </td>
                <td>
                  <span className={cn(
                    "text-[8px] px-2 py-0.5 rounded font-bold border whitespace-nowrap",
                    ['SALE_RETURN', 'DELETE_PROMOTION'].includes(log.action) ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    ['MANUAL_DISCOUNT_APPLIED', 'PROMOTION_REDEEMED', 'HIGH_VALUE_SALE_OR_DISCOUNT'].includes(log.action) ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    ['CREATE_PROMOTION', 'UPDATE_PROMOTION'].includes(log.action) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                  )}>
                    {formatAction(log.action)}
                  </span>
                </td>
                <td className="text-[10px] font-display text-black dark:text-[var(--text-main)] uppercase font-bold">{log.target || '[SYSTEM_CORE]'}</td>
                <td className="text-[9px] font-mono text-slate-900 dark:text-slate-800 dark:text-slate-400 max-w-sm">
                  <div className="line-clamp-2">
                    {log.oldValue && <span className="opacity-90 dark:opacity-60 line-through mr-2 text-slate-900 dark:text-slate-500 dark:text-slate-900 dark:text-slate-500">{log.oldValue}</span>}
                    <span className="text-black dark:text-slate-300 font-bold">{log.newValue || 'No additional telemetry data recorded'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
