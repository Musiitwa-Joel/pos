import React from 'react';
import { observer } from '@legendapp/state/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  FileCheck, 
  Globe, 
  Zap, 
  CheckCircle2, 
  ArrowLeft,
  Database,
  UserCheck,
  History,
  Terminal,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies';
}

export default observer(function LegalPage({ type }: LegalPageProps) {
  const config = {
    privacy: {
      title: "PRIVACY POLICY",
      subtitle: "Institutional Data Sovereignty",
      color: "bg-neo-blue",
      sections: [
        {
          title: "DATA COLLECTION & ORIGIN",
          content: "TredPOS collects forensic operational telemetry during active sessions. This includes Sales History, Physical Cash Float values, Employee Terminal ID mapping, and Customer Credit profiles. No personal biometric or sensitive third-party metadata is harvested outside the operational scope.",
          icon: Database
        },
        {
          title: "ENCRYPTION AT REST",
          content: "All transaction ledgers are hardened using multi-layer AES-256 encryption. We utilize hardware-level isolation for sensitive POS nodes, ensuring that your organization's financial history is impenetrable and locally sovereign.",
          icon: Lock
        },
        {
          title: "RETENTION PROTOCOLS",
          content: "To maintain forensic financial compliance, TredPOS retains transactional audit logs for a cycle of 7 consecutive years. This ensures total auditability for institutional tax and regulatory investigations.",
          icon: History
        }
      ]
    },
    terms: {
      title: "TERMS OF SERVICE",
      subtitle: "Institutional MSA & Protocols",
      color: "bg-neo-orange",
      sections: [
        {
          title: "DATA SOVEREIGNTY",
          content: "Your institutional data remains yours. TredPOS acts solely as the orchestration layer. We do not monetize your sales performance, supplier records, or institutional growth trends. You have the right to a full forensic export at any tactical interval.",
          icon: Globe
        },
        {
          title: "HARDWARE MAINTENANCE",
          content: "The TredPOS architecture requires a healthy hardware bridge. Organizations are responsible for the physical security of terminal units, scanner maintenance, and local network integrity that houses the POS nodes.",
          icon: Terminal
        },
        {
          title: "TRANSACTIONAL INTEGRITY",
          content: "Organizations agreement to utilize TredPOS signifies a commitment to forensic-grade accuracy. Manual overrides must follow manager-authorized protocols to preserve the ledger's institutional integrity.",
          icon: ShieldAlert
        }
      ]
    },
    cookies: {
      title: "COOKIE POLICY",
      subtitle: "Zero-Trace Intelligence Tracking",
      color: "bg-neo-green",
      sections: [
        {
          title: "SESSION PERSISTENCE",
          content: "TredPOS utilizes localStorage for technical session persistence and aesthetic theme preference. We do not utilize tracking cookies, advertising pixels, or third-party behavioral telemetry.",
          icon: Zap
        },
        {
          title: "TERMINAL CACHING",
          content: "To ensure high-velocity product selection, we utilize IndexedDB for forensic product caching. This data is locally isolated and never shared with external advertising or tracking networks.",
          icon: Cpu
        },
        {
          title: "ENHANCED SECURITY",
          content: "We provide an option to operate in 'Stealth Mode' which purges all local persistence upon terminal logout, ensuring zero trace of operational activity on shared hardware.",
          icon: UserCheck
        }
      ]
    }
  };

  const current = config[type];

  return (
     <div className="pt-20 overflow-hidden text-balance">
      {/* Hero Section */}
      <section className={cn("relative py-16 sm:py-32 text-white border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8", current.color)}>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="inline-block px-4 py-1 bg-white text-black neo-border mb-8 -rotate-1">
              <span className="text-xs font-black uppercase tracking-widest italic">{current.subtitle}</span>
            </div>
             <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-none mb-8 font-display uppercase tracking-tighter italic">
              {current.title.split(' ')[0]} <br />
              <span className="text-white underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-black italic">{current.title.split(' ').slice(1).join(' ')}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-32 bg-white border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 italic pb-8 border-b-4 border-black">
              <span>Protocol Update: March 2026</span>
              <span>Version 2.4.0-Forensic</span>
            </div>

            {current.sections.map((section, i) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 sm:mb-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cream neo-border flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    <section.icon size={28} className="sm:size-[32px]" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black font-display uppercase italic tracking-tighter leading-tight border-l-4 sm:border-l-8 border-black pl-4 sm:pl-8">
                    {i + 1}. {section.title}
                  </h2>
                </div>
                
                 <p className="text-base sm:text-xl md:text-2xl font-bold opacity-70 leading-relaxed max-w-none">
                  {section.content}
                </p>

                 <div className="mt-8 sm:mt-12 p-6 sm:p-10 neo-border bg-cream/30 border-dashed border-2 border-black/20">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-3">
                    <Zap size={16} className="text-neo-orange" /> Institutional Verification
                  </h4>
                  <p className="text-sm sm:text-base font-bold opacity-50 italic">
                    This clause has been audited for compliance with global retail operating standards G-POS-2026 and institutional data sovereignty frameworks.
                  </p>
                </div>
              </motion.section>
            ))}

            {/* Back Link */}
            <div className="mt-32 pt-12 border-t-4 border-black text-center">
              <Link to="/" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest hover:gap-8 transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});
