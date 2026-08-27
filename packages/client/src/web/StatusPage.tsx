import React from 'react';
import { observer } from '@legendapp/state/react';
import { motion } from 'motion/react';
import { useQuery } from '@apollo/client';
import { 
  ShieldCheck, 
  Activity, 
  Globe, 
  Database, 
  Network, 
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info
} from 'lucide-react';
import TredPosSEO from '../components/common/TredPosSEO';
import { cn } from '../lib/utils';
import { GET_STATUS_COMPONENTS, GET_INCIDENT_HISTORY } from '../gql/website';

// Icon Map for dynamic components (optional, can just use a default Activity icon if not matched)
const ICON_MAP: Record<string, any> = {
  "Global POS API": Globe,
  "Internal Ledger Hub": Database,
  "Inventory Sync Engine": Activity,
  "Forensic Data Vault": ShieldCheck,
  "Regional Node Sync": Network,
};

export default observer(function StatusPage() {
  const { data: compData, loading: compLoading } = useQuery(GET_STATUS_COMPONENTS);
  const { data: incData, loading: incLoading } = useQuery(GET_INCIDENT_HISTORY, {
    variables: { limit: 10 }
  });

  const components = compData?.getStatusComponents || [];
  const incidents = incData?.getIncidentHistory || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return { color: 'bg-[#00D26A]', text: 'Operational', labelColor: 'text-[#00D26A]', border: 'border-[#00D26A]/20', health: 99.99 };
      case 'DEGRADED': return { color: 'bg-yellow-400', text: 'Degraded', labelColor: 'text-yellow-600', border: 'border-yellow-400/20', health: 98.75 };
      case 'PARTIAL_OUTAGE': return { color: 'bg-neo-orange', text: 'Partial Outage', labelColor: 'text-neo-orange', border: 'border-neo-orange/20', health: 85.20 };
      case 'MAJOR_OUTAGE': return { color: 'bg-red-500', text: 'Major Outage', labelColor: 'text-red-500', border: 'border-red-500/20', health: 0 };
      default: return { color: 'bg-zinc-400', text: 'Unknown', labelColor: 'text-zinc-600', border: 'border-zinc-400/20', health: 0 };
    }
  };

  const isGlobalOperational = !components.some((c: any) => c.status !== 'OPERATIONAL');

  // Generate 40-50 bars for the matrix (representing stability history)
  const renderUptimeBars = (status: string) => {
    const bars = Array.from({ length: 45 });
    return (
      <div className="flex gap-[2px] h-10 w-full mt-6">
        {bars.map((_, i) => {
          // Mock some jitter for degraded components
          const isDown = status !== 'OPERATIONAL' && i % 15 === 0;
          return (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-sm transition-all duration-500", 
                isDown ? "bg-neo-orange/40" : status === 'OPERATIONAL' ? "bg-[#00D26A]/40 group-hover:bg-[#00D26A]/60" : "bg-red-500/40"
              )} 
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] pt-32 pb-20 px-6">
      <TredPosSEO 
        title="System Pulse & Node Health" 
        description="Real-time telemetry and institutional status monitoring for TredPos global operations. Monitor cluster stability and incident history."
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-block px-4 py-1 bg-neo-green neo-border mb-6 -rotate-1">
              <span className="text-xs font-black uppercase tracking-widest">Real-Time Pulse</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-[0.85] mb-8 font-display uppercase tracking-tighter italic TredPos-Pulse">
              SYSTEM <br />
              <span className="text-neo-orange">PULSE.</span>
            </h1>
            <p className="text-lg md:text-2xl font-bold max-w-xl mx-auto lg:mx-0 mb-10 leading-tight opacity-70 TredPos-Pulse-Subtext">
              Real-time telemetry and institutional status monitoring for TredPos global operations. 
            </p>
          </div>
          <div className="neo-border border-dashed p-6 bg-white/50 flex items-center gap-4">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", isGlobalOperational ? "bg-[#00D26A]" : "bg-neo-orange")} />
            <span className="font-black uppercase text-sm tracking-widest">
              {isGlobalOperational ? "All Systems Operational" : "Partial Interference"}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="neo-card p-6 sm:p-10 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
              <div className="flex items-center justify-between mb-12 border-b-2 border-black/5 pb-8">
                <h3 className="text-2xl font-black font-display uppercase italic tracking-widest">CURRENT STATUS</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 neo-border px-3 py-1">Refreshes automatically</span>
              </div>

              <div className="space-y-16">
                {compLoading ? (
                  <div className="py-24 text-center">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : components.length === 0 ? (
                  <div className="py-24 text-center opacity-40 italic font-black uppercase">NO MONITORING NODES DETECTED</div>
                ) : components.map((system: any) => {
                  const config = getStatusConfig(system.status);
                  const Icon = ICON_MAP[system.name] || Activity;

                  return (
                    <div key={system.id} className="group flex flex-col pt-12 first:pt-0 border-t-2 border-black/5 first:border-0">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 neo-border bg-zinc-50 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <Icon size={28} className="text-black" />
                          </div>
                          <div>
                            <span className="font-black uppercase tracking-tight text-2xl italic block mb-1">{system.name}</span>
                            <div className={cn("inline-flex items-center gap-2 px-3 py-1 neo-border rounded-full font-black text-[9px] uppercase tracking-widest bg-white", config.labelColor)}>
                               <CheckCircle2 size={12} />
                               {config.text}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right self-end sm:self-auto">
                            <span className="text-4xl font-black font-display italic leading-none block">{config.health}%</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-1">Institutional Reliability</p>
                        </div>
                      </div>

                      <div className="relative">
                         {renderUptimeBars(system.status)}
                         <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-widest opacity-20 italic">
                            <span>90 days ago</span>
                            <span>Today</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incidents Section */}
            <div className="neo-card p-10 bg-black text-white shadow-[12px_12px_0px_0px_rgba(30,30,30,1)] border-4 border-black">
              <h3 className="text-2xl font-black font-display uppercase mb-12 text-neo-orange italic tracking-widest">Incident Journal</h3>
              <div className="space-y-12">
                {incLoading ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : incidents.length === 0 ? (
                  <div className="border-l-4 border-[#00D26A] pl-8 py-3">
                    <p className="text-2xl font-black font-display italic uppercase text-white">Cluster Neutralized</p>
                    <p className="text-xs font-black text-white/40 mt-2 uppercase tracking-widest">All telemetry signals are within normal parameters.</p>
                  </div>
                ) : incidents.map((inc: any) => {
                  const timestamp = inc.created_at ? new Date(isNaN(Number(inc.created_at)) ? inc.created_at : Number(inc.created_at)) : new Date();
                  const displayTitle = inc.title || "TELEMETRY_SIGNAL_INITIALIZED";
                  const displayMessage = inc.message || "Establishing institutional data handshake...";
                  
                  return (
                    <div key={inc.id} className="border-l-4 border-neo-orange pl-8 py-2 relative group">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {timestamp.toLocaleString().toUpperCase()}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                        <h4 
                          className="text-2xl font-black uppercase italic tracking-tight leading-none"
                          style={{ color: '#FFFFFF' }}
                        >
                          {displayTitle}
                        </h4>
                        <span className={cn("text-[9px] font-black px-3 py-1 neo-border border-white/20 uppercase italic w-fit", 
                          inc.impact === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-neo-orange text-white'
                        )}>
                          {inc.impact} IMPACT
                        </span>
                      </div>
                      <p 
                        className="font-bold leading-relaxed max-w-4xl text-sm italic bg-white/5 p-4 neo-border border-white/5"
                        style={{ color: '#E4E4E7' }}
                      >
                        {displayMessage}
                      </p>
                      <div className="mt-6 flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase px-3 py-1 neo-border border-[#00D26A]/30 bg-[#00D26A]/10 flex items-center gap-2" style={{ color: '#00D26A' }}>
                            <CheckCircle2 size={12} /> {inc.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="neo-card bg-neo-blue p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-white">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 neo-border bg-white/10 flex items-center justify-center">
                   <Clock size={32} />
                </div>
                <h4 className="text-3xl font-black font-display uppercase italic">Global <br /> Uptime</h4>
              </div>
              <div className="bg-black/20 p-8 text-center neo-border border-white/10">
                <p className="text-6xl font-black font-display mb-2">99.99%</p>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.5em]">Annual Reliability Log</p>
              </div>
            </div>

            <div className="neo-card bg-neo-orange p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black group">
              <h4 className="text-2xl font-black font-display uppercase mb-6 italic tracking-widest">Warp Hub</h4>
              <p className="font-bold text-sm mb-10 opacity-90 italic leading-snug">Experiencing service interference? Connect with our vanguard orbital team.</p>
              <button className="w-full neo-button bg-black text-white py-5 px-6 font-black uppercase italic group-hover:bg-neo-blue transition-colors text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
                Signal Command
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

