import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Lock, 
  Zap, 
  Activity, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SystemAudit() {
  const auditLogs = [
    { id: "LOG_09432", type: "SECURITY", action: "MASTER_ID_SYNC", target: "SYSTEM_CORE", status: "SUCCESS", actor: "AUTO_INIT", time: "13:06:51" },
    { id: "LOG_09431", type: "ACCESS", action: "LOGIN_VERIFIED", target: "HQ_CEO_PORTAL", status: "AUTHORIZED", actor: "ceo@tredpos.com", time: "13:05:22" },
    { id: "LOG_09430", type: "BILLING", action: "COLLECTION_RECORDED", target: "KGH_TERMINAL", status: "COMMITTED", actor: "AUTO_CLEARING", time: "12:59:04" },
    { id: "LOG_09429", type: "REGISTRY", action: "NODES_AUTO_PROVISIONED", target: "B2B_REGISTRY", status: "SYNCED", actor: "HSM_BOOT", time: "12:58:33" },
    { id: "LOG_09428", type: "SYSTEM", action: "DATABASE_PATCH_APPLIED", target: "tredpos_registry", status: "APPLIED", actor: "SCHEMA_STRATEGY", time: "12:58:12" },
  ];

  return (
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 bg-[var(--bg-main)] min-h-full">
      {/* Header Cluster */}
      <div className="flex flex-wrap justify-between items-center bg-[var(--bg-panel)] p-6 rounded-[2rem] border border-[var(--border-main)] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-[10px] font-display text-brand-accent uppercase tracking-[0.4em] mb-1 font-black underline decoration-2 decoration-brand-accent/30 underline-offset-4">Forensic Observability Hub</h2>
          <h1 className="text-2xl font-display text-[var(--text-main)] uppercase tracking-[0.2em] font-black italic">Security & Audit Logs</h1>
          <p className="text-[9px] text-[var(--text-muted)] mt-2 font-mono uppercase tracking-widest max-w-sm leading-relaxed opacity-80">
            Real-time decryption of global activity streams. Ensuring 100% forensic transparency across the Vanguard ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
           <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-main)] shadow-inner">
              <Search className="text-[var(--text-muted)]" size={14} />
              <input 
                placeholder="LOCATE_LOG_STAMP..." 
                className="bg-transparent border-none outline-none text-[8px] font-mono text-[var(--text-main)] uppercase tracking-widest w-48 placeholder:text-[var(--text-muted)]/30"
              />
           </div>
           <button className="industrial-btn-primary p-2.5 rounded-lg shadow-lg shadow-brand-accent/20">
             <Filter size={14} />
           </button>
        </div>
        <Lock size={300} className="absolute -right-20 -bottom-20 text-brand-accent/5 animate-pulse" />
      </div>

      <div className="bg-[var(--bg-panel)] border border-[var(--border-main)] rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-280px)] flex flex-col">
         <div className="bg-[var(--bg-panel)] px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <Activity size={12} className="text-brand-accent animate-pulse" />
                  <span className="text-[9px] font-mono font-black text-brand-accent uppercase tracking-[0.2em]">Live Stream Active</span>
               </div>
               <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Global Correlation Established</span>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[7px] font-mono font-black text-emerald-500 uppercase tracking-widest">System_Nominal</span>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto scrollbar-industrial p-3 space-y-2 bg-[var(--bg-main)]/30">
            {auditLogs.map((log, i) => (
              <div key={log.id} className="flex flex-wrap items-center gap-4 px-5 py-4 bg-[var(--bg-panel)] border border-[var(--border-main)] rounded-xl hover:border-brand-accent/30 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
                 <div className="w-1 h-full absolute left-0 top-0 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                 
                 <div className="flex items-center gap-4 w-48 shrink-0">
                    <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase">{log.time}</span>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[7px] font-mono font-black uppercase tracking-widest",
                      log.type === 'SECURITY' ? "text-rose-500 bg-rose-500/10 border border-rose-500/20" :
                      log.type === 'ACCESS' ? "text-blue-500 bg-blue-500/10 border border-blue-500/20" :
                      "text-[var(--text-muted)] bg-slate-500/10 border border-[var(--border-main)]"
                    )}>
                      {log.type}
                    </div>
                 </div>

                 <div className="flex-1 flex items-center gap-3 overflow-hidden min-w-[200px]">
                    <span className="text-[10px] font-display text-[var(--text-main)] uppercase tracking-widest font-black whitespace-nowrap group-hover:text-brand-accent transition-colors">{log.action}</span>
                    <ArrowRight size={12} className="text-[var(--border-main)]" />
                    <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest font-black truncate">{log.target}</span>
                 </div>

                 <div className="flex items-center gap-8 shrink-0 ml-auto">
                    <div className="flex flex-col items-end">
                       <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Authority</span>
                       <span className="text-[9px] font-mono text-[var(--text-main)] uppercase font-black tracking-widest">{log.actor}</span>
                    </div>
                    <div className="flex flex-col items-end w-20">
                       <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest italic leading-none mb-1">{log.status}</span>
                       <span className="text-[6px] font-mono text-[var(--text-muted)] opacity-80 dark:opacity-50 uppercase tracking-tighter">{log.id}</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>

         <div className="p-6 bg-[var(--bg-panel)] border-t border-[var(--border-main)] flex justify-center items-center shadow-inner">
            <button className="text-[10px] font-display font-black text-brand-accent uppercase tracking-[0.5em] animate-pulse hover:opacity-100 opacity-90 dark:opacity-60">
               --- Accessing Cold Deep Logs ---
            </button>
         </div>
      </div>
    </div>
  );
}
