import React from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'motion/react';
import { Zap, Calendar, ArrowRight, Shield, Rocket, Bug, Layers, ChevronRight } from 'lucide-react';
import { GET_CHANGELOGS } from '../gql/website';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { format, parseISO, isValid } from 'date-fns';

const CategoryBadge = ({ category }: { category: string }) => {
  const configs: Record<string, { icon: any, color: string, bg: string }> = {
    FEATURE: { icon: Rocket, color: 'text-neo-green', bg: 'bg-neo-green/10' },
    FIX: { icon: Bug, color: 'text-neo-blue', bg: 'bg-neo-blue/10' },
    SECURITY: { icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10' },
    ARCHITECTURE: { icon: Layers, color: 'text-neo-orange', bg: 'bg-neo-orange/10' }
  };

  const config = configs[category] || configs.FEATURE;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 neo-border border text-[9px] font-black uppercase tracking-widest", config.bg, config.color)}>
      <Icon size={12} />
      {category}
    </div>
  );
};

export default function ChangelogPage() {
  const { data, loading, error } = useQuery(GET_CHANGELOGS, {
    fetchPolicy: 'network-only'
  });
  const logs = data?.getChangelogs || [];

  // 🧬 Forensic Registry Audit Log
  if (data?.getChangelogs) {
    console.log("[TredPOS_Registry_Audit] Hydrated Logs:", data.getChangelogs);
  }

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 border-b-4 border-black overflow-hidden bg-white">
        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 neo-border bg-neo-orange flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <Zap size={24} className="text-black" />
                </div>
                <div className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-neo-orange">Protocol_Updates // v2.8</div>
             </div>
             <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-tight text-black">
                Platform <br />
                <span className="text-neo-orange">Change Log</span>
             </h1>
             <p className="max-w-2xl text-lg font-bold text-black opacity-60 uppercase tracking-tight leading-relaxed mt-4">
                A forensic audit of platform evolutions, architectural migrations, and security hardening protocols.
             </p>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* Timeline Section */}
      <section className="py-24 container mx-auto px-6 md:px-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
             <div className="w-16 h-16 border-4 border-neo-orange border-t-transparent rounded-full animate-spin" />
             <div className="font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Hydrating_Telemetry_Stream...</div>
          </div>
        ) : error ? (
          <div className="p-12 neo-border border-4 bg-red-50 text-red-600 text-center">
             <h3 className="text-2xl font-black uppercase">Telemetry_Link_Fracture</h3>
             <p className="font-mono text-sm mt-2">Failed to establish connection with the Registry Hub.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="space-y-20">
              {logs.map((log: any, index: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={log.id} 
                  className="relative grid md:grid-cols-[1fr_3fr] gap-8 md:gap-20"
                >
                  {/* Left Column: Meta */}
                  <div className="md:text-right space-y-4">
                    <div className="flex items-center md:justify-end gap-3 md:gap-4">
                       <span className="text-4xl font-black text-neo-orange font-mono">#{logs.length - index}</span>
                        <div className="h-0.5 w-12 bg-black hidden md:block" />
                    </div>
                    <div className="text-xl font-black uppercase tracking-tighter text-black flex items-center md:justify-end gap-2">
                       <Calendar size={20} className="text-neo-orange" />
                        {(() => {
                          const val = log.released_at || log.created_at || log.releasedAt || log.createdAt;
                          if (!val) return 'PENDING_SYNC';
                          try {
                            const d = typeof val === 'string' ? parseISO(val) : new Date(val);
                            if (!isValid(d)) return 'PENDING_SYNC';
                            return format(d, 'MMM d, yyyy');
                          } catch (e) {
                            return 'PENDING_SYNC';
                          }
                        })()}
                    </div>
                    <div className="flex md:justify-end">
                       <div className="px-4 py-2 bg-black text-white text-xs font-black rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(255,107,0,1)]">
                          VERSION {log.version}
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                       <CategoryBadge category={log.category} />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-black leading-none group-hover:text-neo-orange transition-colors">
                       {log.title}
                    </h2>
                    <div className="p-8 neo-border border-4 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2 opacity-[0.05]">
                          <Zap size={100} className="text-black" />
                       </div>
                       <div className="text-black opacity-90 font-bold leading-relaxed tracking-tight">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-black uppercase mb-6 text-neo-orange border-b-2 border-black pb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-black uppercase mb-4" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-black uppercase mb-3" {...props} />,
                              h4: ({node, ...props}) => <h4 className="text-base font-black uppercase mb-2 text-neo-orange" {...props} />,
                              p: ({node, ...props}) => <p className="mb-6 last:mb-0 text-sm leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-6" {...props} />,
                              li: ({node, ...props}) => (
                                <li className="flex items-start gap-2 text-xs font-black uppercase tracking-tight" {...props}>
                                  <span className="text-neo-orange mt-1">▶</span>
                                  <span>{props.children}</span>
                                </li>
                              ),
                              strong: ({node, ...props}) => <strong className="text-neo-orange font-black" {...props} />,
                              code: ({node, ...props}) => <code className="bg-black text-white px-2 py-0.5 rounded-sm font-mono text-[10px]" {...props} />,
                            }}
                          >
                            {log.content}
                          </ReactMarkdown>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {logs.length === 0 && (
                <div className="py-40 text-center border-4 border-dashed border-black/10">
                   <p className="text-xl font-black text-black/40 uppercase tracking-widest">No entry nodes found in registry.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="py-24 border-t-4 border-black bg-neo-orange text-black">
         <div className="container mx-auto px-6 md:px-10 text-center">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-8">Want real-time updates?</h2>
            <button className="neo-button bg-black text-white py-6 px-12 text-xl font-black uppercase tracking-widest shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-4 mx-auto">
               FOLLOW @TREDPOS
               <ChevronRight size={24} />
            </button>
         </div>
      </section>
    </div>
  );
}
