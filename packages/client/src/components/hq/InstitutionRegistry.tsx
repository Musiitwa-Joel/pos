import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Server,
  Activity,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_INSTITUTIONS_HQ, UPDATE_INSTITUTION_STATUS } from '../../gql/registry';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import InstitutionalReports from './InstitutionalReports';

export default function InstitutionRegistry() {
  const { data, loading, refetch } = useQuery(GET_ALL_INSTITUTIONS_HQ, {
    pollInterval: 5000
  });
  const [updateStatus] = useMutation(UPDATE_INSTITUTION_STATUS);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allInstitutions = data?.allInstitutionsHq || [];
  // 👑 Filter out HQ from the registry list to avoid redundant self-tracking
  const institutions = allInstitutions.filter((i: any) => i.id !== 'HQ_VANGUARD_CORE');
  
  const filtered = filter === 'all' 
    ? institutions 
    : institutions.filter((i: any) => i.status?.toLowerCase() === filter);

  const selectedInstitution = institutions.find((i: any) => i.id === selectedId);

  return (
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 bg-[var(--bg-main)] min-h-full">
      {/* Header Module - Compacted */}
      <div className="flex flex-wrap justify-between items-center bg-[var(--bg-panel)] p-6 rounded-[2rem] border border-[var(--border-main)] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-[10px] font-display text-brand-accent uppercase tracking-[0.4em] mb-1 font-black">Global Infrastructure</h2>
          <h1 className="text-2xl font-display text-[var(--text-main)] uppercase tracking-[0.2em] font-black italic">Institutional Matrix</h1>
          <p className="text-[9px] text-[var(--text-muted)] mt-2 font-mono uppercase tracking-widest max-w-sm leading-relaxed opacity-80">
            Real-time oversight across the active Tred POS ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-1.5 relative z-10 bg-[var(--bg-panel)] p-1 rounded-xl border border-[var(--border-main)] shadow-inner">
          {(['all', 'active', 'suspended'] as const).map((tag) => (
             <button
               key={tag}
               onClick={() => setFilter(tag)}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-[8px] font-display font-black uppercase tracking-widest transition-all",
                 filter === tag 
                   ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                   : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
               )}
             >
               {tag}
             </button>
          ))}
        </div>
        <Globe size={200} className="absolute -right-10 -bottom-10 text-brand-accent/[0.03] animate-pulse" />
      </div>

      {/* Institutional Grid - Compacted */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((inst: any) => (
          <div key={inst.id} className="industrial-panel p-4 bg-[var(--bg-panel)] border border-[var(--border-main)] flex flex-col group hover:border-brand-accent/40 shadow-sm transition-all duration-300 relative overflow-hidden">
            <div className="flex justify-between items-start mb-5">
              <div className="flex flex-col">
                 <h3 className="text-[11px] font-display font-black text-[var(--text-main)] uppercase tracking-widest leading-tight group-hover:text-brand-accent transition-colors italic">{inst.name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-1 h-1 rounded-full", inst.status === 'suspended' ? "bg-amber-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
                    <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-black">{inst.status?.toUpperCase() || 'ACTIVE'}</span>
                    <span className="text-[7px] font-mono text-brand-accent uppercase tracking-widest opacity-30 ml-2 font-black">// {inst.planId?.replace('Vanguard_', '') || 'STD'}</span>
                 </div>
              </div>
              <div className="w-8 h-8 rounded-sm bg-[var(--bg-inset)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] font-mono text-[10px] font-black uppercase group-hover:border-brand-accent/30 transition-all shadow-inner">
                {inst.name.slice(0, 2)}
              </div>
            </div>

            <div className="space-y-2.5 flex-1">
               <div className="flex items-center gap-3 group/item">
                  <div className="w-7 h-7 rounded-sm bg-[var(--bg-inset)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] group-hover/item:text-brand-accent transition-colors shadow-sm">
                    <MapPin size={10} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-black text-[var(--text-main)] truncate max-w-[170px] uppercase opacity-80">{inst.physicalLocation || 'Cloud_Node_01'}</span>
                  </div>
               </div>

               <div className="flex items-center gap-3 group/item">
                  <div className="w-7 h-7 rounded-sm bg-[var(--bg-inset)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] group-hover/item:text-brand-accent transition-colors shadow-sm">
                    <Mail size={10} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-black text-[var(--text-main)] truncate max-w-[170px] lowercase opacity-90 dark:opacity-60 tracking-tight">{inst.ownerEmail}</span>
                  </div>
               </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-main)]/30 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                     {(inst.operators || []).length > 0 ? (
                       <>
                         {inst.operators.map((op: any, idx: number) => {
                            const maxToShow = inst.totalStaff > 5 ? 3 : 5;
                            if (idx >= maxToShow) return null;
                            const colors = ['bg-orange-500', 'bg-indigo-600', 'bg-blue-600', 'bg-emerald-600'];
                            const colorClass = colors[op.username.length % colors.length];
                            
                            return (
                              <div 
                                key={op.id} 
                                className={cn(
                                  "w-7 h-7 rounded-full border-2 border-[var(--bg-panel)] flex items-center justify-center text-[7px] font-black text-white uppercase overflow-hidden hover:scale-110 hover:-translate-y-1 transition-all cursor-help relative shrink-0",
                                  colorClass
                                )}
                                title={`${op.username} (${op.role})`}
                              >
                                {op.username?.slice(0, 2).toUpperCase()}
                              </div>
                            );
                         })}
                       </>
                     ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-[var(--bg-panel)] bg-[var(--bg-inset)] border border-[var(--border-main)] flex items-center justify-center text-[7px] font-black text-[var(--text-muted)] uppercase">
                          N/A
                        </div>
                     )}
                  </div>
                  <div className="flex flex-col ml-0.5">
                    <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none opacity-40">Active_Ops</span>
                  </div>
               </div>
                <div className="flex items-center gap-1.5 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                   <button 
                     onClick={async () => {
                       const newStatus = inst.status === 'suspended' ? 'active' : 'suspended';
                       await toast.promise(updateStatus({ variables: { id: inst.id, status: newStatus } }), {
                         loading: 'EX_COMMAND...',
                         success: 'LINK_UPDATED',
                         error: 'FAIL'
                       });
                       refetch();
                     }}
                     className={cn(
                       "w-7 h-7 flex items-center justify-center rounded-sm border transition-all",
                       inst.status === 'suspended'
                         ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                         : "text-amber-500 border-amber-500/30 hover:bg-amber-500 hover:text-white"
                     )}
                   >
                     {inst.status === 'suspended' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                   </button>
                   <button 
                     onClick={() => setSelectedId(inst.id)}
                     className="flex items-center gap-1.5 text-[8px] font-mono font-black text-brand-accent uppercase tracking-widest px-2.5 py-1.5 border border-brand-accent/30 hover:bg-brand-accent hover:text-white transition-all bg-brand-accent/5 rounded-sm"
                   >
                     REPORTS
                     <ArrowUpRight size={10} />
                   </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* 👑 Institutional Reports: Drilled-Down Forensic Suite */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-[300] bg-[var(--bg-main)] animate-in slide-in-from-right-4 duration-300">
          <InstitutionalReports 
            institution={selectedInstitution} 
            onBack={() => setSelectedId(null)} 
          />
        </div>
      )}
    </div>
  );
}
