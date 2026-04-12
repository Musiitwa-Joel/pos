import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, Globe, Database, Network, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function StatusPage() {
  const systems = [
    { name: "Global POS API", status: "Operational", health: 100, icon: Globe },
    { name: "Internal Ledger Hub", status: "Operational", health: 100, icon: Database },
    { name: "Inventory Sync Engine", status: "Performance Degraded", health: 85, icon: Activity },
    { name: "Forensic Data Vault", status: "Operational", health: 100, icon: ShieldCheck },
    { name: "Regional Node Sync", status: "Operational", health: 99, icon: Network },
  ];

  return (
     <div className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-cream overflow-hidden text-balance">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="inline-block px-4 py-1 bg-neo-green neo-border mb-6 -rotate-1">
            <span className="text-xs font-black uppercase tracking-widest">Real-Time Pulse</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 font-display uppercase tracking-tight">System <br /> <span className="text-neo-blue">Visibility.</span></h1>
          <p className="text-xl font-bold max-w-2xl opacity-70">Transparent, real-time monitoring of our global core and regional nodes.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 mb-30">
          <div className="lg:col-span-8 space-y-8">
            <div className="neo-card p-6 sm:p-10 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
                <h3 className="text-2xl sm:text-3xl font-black font-display uppercase italic">Service Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-neo-green animate-pulse neo-border border-black shrink-0" />
                  <span className="font-black uppercase text-xs sm:text-sm">All Systems Go</span>
                </div>
              </div>

              <div className="space-y-12">
                {systems.map((system) => (
                  <div key={system.name} className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 neo-border bg-neo-orange/10 flex items-center justify-center shrink-0">
                          <system.icon size={20} className="text-neo-orange" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-xs sm:text-sm">{system.name}</span>
                      </div>
                      <span className={cn("text-[10px] sm:text-xs font-black px-3 py-1 neo-border uppercase self-start sm:self-center", 
                        system.status === "Operational" ? "bg-neo-green/20 text-neo-green border-neo-green/40" : "bg-yellow-400/20 text-yellow-600 border-yellow-400/40")}>
                        {system.status}
                      </span>
                    </div>
                    <div className="h-6 bg-zinc-100 neo-border border-zinc-200 relative overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${system.health}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full", system.health === 100 ? "bg-neo-green" : "bg-yellow-400")} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="neo-card p-10 bg-black text-white">
              <h3 className="text-2xl font-black font-display uppercase mb-10 text-neo-orange">Maintenance Journal</h3>
              <div className="space-y-8">
                {[
                  { date: "March 28, 2026", task: "Database Indexing Optimization", type: "Planned" },
                  { date: "March 24, 2026", task: "Global Node Load Balancer Expansion", type: "Security" },
                  { date: "March 20, 2026", task: "Real-time Sync Latency Mitigation", type: "Corrective" }
                ].map(entry => (
                  <div key={entry.task} className="border-l-4 border-neo-green pl-6 py-2">
                    <p className="text-xs font-black text-white/40 mb-2 uppercase tracking-widest">{entry.date}</p>
                    <p className="text-lg font-bold">{entry.task}</p>
                    <span className="text-[10px] font-black uppercase text-neo-orange mt-2 inline-block">{entry.type} Patch</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="neo-card bg-neo-blue p-6 sm:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-4 mb-6">
                <Clock className="text-white shrink-0" size={32} />
                <h4 className="text-xl sm:text-2xl font-black font-display text-white uppercase italic">Uptime</h4>
              </div>
              <div className="bg-white/10 neo-border border-white/20 p-6 sm:p-8 text-center backdrop-blur-md">
                <p className="text-4xl sm:text-6xl font-black font-display text-white mb-2">99.98%</p>
                <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Last 365 Days</p>
              </div>
            </div>

            <div className="neo-card bg-neo-orange p-6 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="text-xl sm:text-2xl font-black font-display uppercase mb-6 italic">Support Hub</h4>
              <p className="font-bold text-xs sm:text-sm mb-8 sm:mb-10">Experiencing issues? Our elite engineering team is standing by 24/7/365.</p>
              <button className="w-full neo-button bg-black text-white hover:bg-white hover:text-black text-lg py-5 px-6 italic font-black uppercase">
                Contact Warp Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
