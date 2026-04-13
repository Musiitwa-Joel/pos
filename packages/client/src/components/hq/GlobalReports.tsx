import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Globe, 
  Zap, 
  ShieldCheck, 
  DollarSign
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_ALL_INSTITUTIONS_HQ } from '../../gql/registry';
import { cn } from '../../lib/utils';

export default function GlobalReports() {
  const { data, loading } = useQuery(GET_ALL_INSTITUTIONS_HQ);
  
  const allInstitutions = data?.allInstitutionsHq || [];
  const institutions = allInstitutions.filter((i: any) => i.id !== 'HQ_VANGUARD_CORE');

  const stats = [
    { label: "Total Platform Revenue", value: "UGX 0.00", trend: "N/A", positive: true, icon: DollarSign },
    { label: "Active Institutional Terminals", value: institutions.length.toString(), trend: `+${institutions.length}`, positive: true, icon: ShieldCheck },
    { label: "Average Yield per Node", value: "UGX 0.00", trend: "---", positive: false, icon: Activity },
    { label: "Growth Vector", value: "High", trend: "+100%", positive: true, icon: TrendingUp },
  ];

  return (
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 bg-[var(--bg-main)] min-h-full">
      {/* Header Cluster */}
      <div className="flex flex-wrap justify-between items-center bg-[var(--bg-panel)] p-6 rounded-[2rem] border border-[var(--border-main)] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-[10px] font-display text-brand-accent uppercase tracking-[0.4em] mb-1 font-black underline decoration-2 decoration-brand-accent/30 underline-offset-4">Forensic Analytics Hub</h2>
          <h1 className="text-2xl font-display text-[var(--text-main)] uppercase tracking-[0.2em] font-black italic">Platform Intelligence</h1>
          <p className="text-[9px] text-[var(--text-muted)] mt-2 font-mono uppercase tracking-widest max-w-sm leading-relaxed opacity-80">
            Real-time telemetry and financial orchestration across the entire Tred-Vanguard ecosystem.
          </p>
        </div>
          <div className="flex items-center gap-2 relative z-10">
             <button 
               disabled={institutions.length === 0}
               className={cn(
                 "industrial-btn-primary px-6 py-2.5 rounded-lg text-[9px] font-display font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-accent/20 transition-all duration-300",
                 institutions.length === 0 && "opacity-40 blur-[1.5px] grayscale cursor-not-allowed pointer-events-none"
               )}
             >
               <Globe size={14} />
               Export Global Ledger
             </button>
          </div>
        <BarChart3 size={300} className="absolute -right-20 -bottom-20 text-brand-accent/5 animate-pulse" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="industrial-panel p-5 bg-[var(--bg-panel)] border-[var(--border-main)] group hover:border-brand-accent/40 transition-all shadow-sm hover:shadow-xl duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-brand-accent/5 border border-brand-accent/10 text-brand-accent group-hover:scale-110 transition-transform">
                <stat.icon size={18} />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black font-mono tracking-widest uppercase",
                stat.positive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
              )}>
                {stat.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</h3>
            <span className="text-xl font-display text-[var(--text-main)] uppercase tracking-widest font-black leading-tight italic">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-380px)]">
         {/* Revenue Distribution Chart Area */}
         <div className="col-span-12 lg:col-span-8 bg-[var(--bg-panel)] rounded-2xl border border-[var(--border-main)] p-6 flex flex-col relative overflow-hidden shadow-inner">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-xs font-display text-[var(--text-main)] uppercase tracking-widest italic font-black">Regional Revenue Velocity</h3>
              <div className="flex gap-2 text-[8px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> KLA</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> GUL</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> MBR</span>
              </div>
            </div>
            
            {/* Visual Placeholder for High-Energy Trends */}
            <div className="flex-1 flex items-end gap-1.5 pb-2">
               {Array.from({length: 40}).map((_, i) => (
                 <div 
                   key={i} 
                   className="flex-1 bg-brand-accent/10 border-t-2 border-brand-accent transition-all hover:bg-brand-accent/30 group relative"
                   style={{ height: `${20 + Math.random() * 80}%` }}
                 >
                   <div className="absolute opacity-0 group-hover:opacity-100 -top-6 left-1/2 -translate-x-1/2 text-[7px] font-mono text-brand-accent font-black bg-[var(--bg-panel)] px-1 border border-brand-accent/20 z-10 shadow-lg">
                     {Math.floor(Math.random() * 100)}%
                   </div>
                 </div>
               ))}
            </div>
            
            <Zap size={400} className="absolute -left-40 -top-40 text-brand-accent/2 pointer-events-none" />
         </div>

         {/* Growth Composition */}
         <div className="col-span-12 lg:col-span-4 bg-[var(--bg-panel)] rounded-2xl border border-[var(--border-main)] p-6 flex flex-col space-y-6 shadow-sm">
            <h3 className="text-xs font-display text-[var(--text-main)] uppercase tracking-widest italic font-black">Ecosystem Stability</h3>
            <div className="space-y-4">
              {[
                { name: "Node Uptime", val: 99.98, color: "bg-emerald-500" },
                { name: "Collection Rate", val: 84.4, color: "bg-brand-accent" },
                { name: "Market Penetration", val: 12.2, color: "bg-purple-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                   <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-[0.2em]">
                      <span className="text-[var(--text-muted)] font-black">{item.name}</span>
                      <span className="text-[var(--text-main)] font-black">{item.val}%</span>
                   </div>
                   <div className="h-1 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-main)]/30">
                      <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.val}%` }} />
                   </div>
                </div>
              ))}
            </div>
            
            <div className="flex-1 border border-[var(--border-main)] rounded-xl bg-[var(--bg-main)] p-4 flex flex-col justify-center items-center gap-3 shadow-inner">
               <Activity size={24} className="text-brand-accent animate-pulse" />
               <span className="text-[9px] font-display text-[var(--text-muted)] uppercase tracking-widest font-black leading-tight text-center">Platform Health: Nominal</span>
               <div className="flex gap-1">
                 {Array.from({length: 8}).map((_, i) => (
                   <span key={i} className="w-1 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
