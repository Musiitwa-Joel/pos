import React, { useState } from 'react';
import { 
  LayoutGrid, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  DollarSign,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_INSTITUTIONS_HQ, GET_BILLING_PLANS, RECORD_SYSTEM_PAYMENT, SEND_BILLING_REMINDER } from '../../gql/registry';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function BillingHub() {
  const { data, loading, refetch } = useQuery(GET_ALL_INSTITUTIONS_HQ);
  const [searchTerm, setSearchTerm] = useState('');
  
  const allInstitutions = data?.allInstitutionsHq || [];
  // 👑 filter out HQ from the billing stats to avoid self-tracking revenue/reminders
  const institutions = allInstitutions.filter((i: any) => i.id !== 'HQ_VANGUARD_CORE');
  
  const filtered = institutions.filter((i: any) => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Active Institutions', value: institutions.length, icon: Users, color: 'text-blue-500', trend: '+12%' },
    { label: 'Monthly collections', value: 'UGX 0.00', icon: DollarSign, color: 'text-[var(--text-muted)]', trend: '---' },
    { label: 'Pending Reminders', value: institutions.filter((i: any) => i.paymentStatus === 'pending').length, icon: AlertCircle, color: 'text-orange-500', trend: '-2' },
    { label: 'Growth Vector', value: 'High', icon: TrendingUp, color: 'text-brand-accent', trend: 'Stable' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[var(--bg-main)]">
      {/* CEO Command Banner */}
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div>
          <h2 className="text-[10px] font-display text-[var(--text-muted)] uppercase tracking-[0.4em] mb-2 font-black">Vanguard HQ</h2>
          <h1 className="text-3xl font-display text-[var(--text-main)] uppercase tracking-wider font-black flex flex-wrap items-center gap-4">
            Master Billing Hub
            <span className="px-3 py-1 bg-brand-accent text-white text-[10px] rounded-full shadow-lg border border-brand-accent/20">CEO_PORTAL_ACTIVE</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-brand-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="LOCATE INSTITUTION..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="terminal-input pl-12 pr-6 py-3 w-full text-[10px] font-mono tracking-widest bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:border-brand-accent/50"
            />
          </div>
        </div>
      </div>

      {/* Financial Vector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)] hover:border-brand-accent/30 transition-all group overflow-hidden relative shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div className={cn("p-3 rounded-xl bg-brand-steel/10 border border-[var(--border-main)]", stat.color)}>
                   <stat.icon size={20} className="text-current" />
                 </div>
                 <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-tighter", 
                   stat.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500")}>
                   {stat.trend}
                 </span>
               </div>
               <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-display mb-1">{stat.label}</p>
               <p className="text-2xl font-mono font-bold text-[var(--text-main)] tracking-tight">{stat.value}</p>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-[var(--text-main)]">
               <stat.icon size={120} />
             </div>
          </div>
        ))}
      </div>

      {/* Institutional Collections Matrix */}
      <div className="industrial-panel bg-[var(--bg-panel)] overflow-hidden border-[var(--border-main)] shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--border-main)] bg-[var(--bg-panel)]/50 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-3">
            <LayoutGrid size={18} className="text-brand-accent" />
            <h3 className="text-xs font-display text-[var(--text-main)] uppercase tracking-[0.2em] font-bold">Institutional Registry Matrix</h3>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono text-[var(--text-muted)] italic uppercase">Showing {filtered.length} Live Terminals</span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-steel/30 scrollbar-track-transparent pr-2 border-b border-[var(--border-main)]/30">
          <table className="w-full border-collapse">
            <thead className="bg-[var(--bg-panel)] text-[10px] font-display text-[var(--text-muted)] uppercase tracking-[0.25em] sticky top-0 z-20 backdrop-blur-md">
              <tr className="border-b border-[var(--border-main)]">
                <th className="px-6 py-3 text-left font-black">Identity</th>
                <th className="px-6 py-3 text-left font-black">Tier</th>
                <th className="px-6 py-3 text-center font-black">Logic_State</th>
                <th className="px-6 py-3 text-right font-black">Action_Vector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]/30">
              {filtered.map((inst: any) => (
                <tr key={inst.id} className="group hover:bg-brand-accent/[0.01] transition-colors">
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-sm bg-[var(--bg-inset)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] font-mono text-[10px] uppercase group-hover:border-brand-accent/40 group-hover:text-brand-accent transition-all duration-300">
                        {inst.name.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[11px] font-display font-black text-[var(--text-main)] uppercase tracking-tight leading-none group-hover:text-brand-accent transition-colors mb-1">{inst.name}</h4>
                        <p className="text-[8px] font-mono text-[var(--text-muted)] opacity-80 dark:opacity-50 leading-none tracking-widest">{inst.ownerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-brand-accent font-black uppercase tracking-widest leading-none">{inst.plan?.name?.replace('Vanguard_', '') || 'STANDARD'}</span>
                      <span className="text-[7px] font-mono text-[var(--text-muted)] opacity-30 leading-none mt-1 uppercase tracking-tighter italic">Term: MON</span>
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-center">
                    <div className={cn(
                      "flex items-center justify-center gap-2 text-[8px] font-mono font-black uppercase tracking-[0.2em]",
                      inst.paymentStatus === 'paid' ? "text-emerald-500" : "text-amber-500 animate-pulse"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", inst.paymentStatus === 'paid' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]")} />
                      {inst.paymentStatus || 'PENDING'}
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-right">
                    <div className="flex justify-end items-center gap-4">
                       <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-mono text-[var(--text-main)] font-black tracking-tighter">{formatCurrency(inst.plan?.monthlyFee || 0)}</span>
                          <span className="text-[6px] font-mono text-[var(--text-muted)] uppercase tracking-widest opacity-40">Yield</span>
                       </div>
                       <div className="flex gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          {inst.paymentStatus !== 'paid' && (
                            <button 
                              onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), {
                                loading: 'TX_REMINDER...',
                                success: 'LINK_ESTABLISHED',
                                error: 'FAIL'
                              })}
                              className="w-7 h-7 flex items-center justify-center text-amber-500 hover:text-white hover:bg-amber-500 transition-all border border-[var(--border-main)] rounded-sm"
                            >
                              <Send size={10} />
                            </button>
                          )}
                          <button 
                            className="w-7 h-7 flex items-center justify-center text-brand-accent hover:text-white hover:bg-brand-accent transition-all border border-[var(--border-main)] rounded-sm"
                          >
                            <DollarSign size={12} />
                          </button>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
