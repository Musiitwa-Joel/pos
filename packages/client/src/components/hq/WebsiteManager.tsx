import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Globe,
  Layout,
  Rocket,
  Zap,
  MessageSquare,
  Settings as SettingsIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Layers,
  Activity,
  Fingerprint,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Type,
  Star,
  FileText,
  Mail,
  User,
  Briefcase,
  ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import InquiriesView from './website/InquiriesView';
import SettingsView from './website/SettingsView';

// Sub-modules from the user's admin sub-directory
import ContentManager from '../../web/admin/ContentManager';
import Inquiries from '../../web/admin/Inquiries';
import Settings from '../../web/admin/Settings';

interface NavRowProps {
  id: string;
  title: string;
  icon: any;
  active: boolean;
  onClick: () => void;
}

interface NavCardProps {
  id: string;
  title: string;
  icon: any;
  category: 'CONTENT' | 'UTILITY' | 'SECURITY';
  color: string;
  description: string;
  onClick: () => void;
}

function InstitutionalCard({ title, icon: Icon, category, color, description, onClick }: NavCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col h-64 p-8 bg-[var(--bg-panel)] border border-[var(--border-main)] hover:border-neo-blue/50 transition-all text-left overflow-hidden shadow-lg hover:shadow-2xl"
    >
      {/* Decorative accent for highlight */}
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", color)} />

      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <div className={cn("p-2 rounded-sm bg-opacity-10", color.replace('bg-', 'bg-opacity-10 text-').replace('text-', ''))}>
          <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-90 dark:opacity-60">
          {category}
        </span>
      </div>

      {/* Body Content */}
      <div className="flex-1">
        <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight mb-3 group-hover:text-neo-blue transition-colors">
          {title}
        </h3>
        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider leading-relaxed line-clamp-3 opacity-80">
          {description}
        </p>
      </div>

      {/* Footer Action */}
      <div className="mt-auto pt-6 border-t border-[var(--border-main)]/50 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-neo-blue opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
          Configure Section
        </span>
        <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-neo-blue group-hover:translate-x-1 transition-all" />
      </div>

      {/* Background Glow on hover */}
      <div className={cn("absolute bottom-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity rounded-full", color)} />
    </motion.button>
  );
}

export default function WebsiteManager() {
  const [activeView, setActiveView] = useState<string>('hub');

  const sections: (Omit<NavCardProps, 'onClick'>)[] = [
    { id: 'hero', title: 'Hero Section', icon: Layout, category: 'CONTENT', color: 'bg-neo-orange', description: 'MANAGE PRIMARY LANDING VISUALS, HEADLINES, AND STRATEGIC CTA TERMINALS.' },
    { id: 'features', title: 'Features Grid', icon: FileText, category: 'CONTENT', color: 'bg-neo-green', description: 'AUDIT AND REFINE CORE PLATFORM COMPETENCIES ACROSS THE SERVICE MATRIX.' },
    { id: 'cases', title: 'Case Studies', icon: Star, category: 'CONTENT', color: 'bg-neo-blue', description: 'TRACK INSTITUTIONAL SUCCESS PROTOCOLS AND PUBLIC-FACING IMPLEMENTATION LOGS.' },
    { id: 'reviews', title: 'Reviews', icon: MessageSquare, category: 'CONTENT', color: 'bg-purple-500', description: 'MONITOR PUBLIC TESTIMONIAL FEEDBACK AND CLIENT SATISFACTION TELEMETRY.' },
    { id: 'updates', title: 'Updates / Changelog', icon: Zap, category: 'CONTENT', color: 'bg-yellow-500', description: 'DEPLOY SYSTEM REVISIONS, PLATFORM PATCHES, AND NEW ARCHITECTURAL LOGS.' },
    { id: 'about', title: 'About Page', icon: Globe, category: 'CONTENT', color: 'bg-teal-500', description: 'CONFIGURE REGISTRY ORIGIN LOGS, MISSION PROTOCOLS, AND CORPORATE HISTORY.' },
    { id: 'careers', title: 'Careers', icon: Briefcase, category: 'CONTENT', color: 'bg-indigo-500', description: 'MANAGE STAFFING FOOTPRINT, INSTITUTIONAL VACANCIES, AND RECRUITMENT NODES.' },
    { id: 'press', title: 'Press Kit', icon: Type, category: 'CONTENT', color: 'bg-rose-500', description: 'PUBLIC RELATIONS ARTIFACTS, BRAND ASSETS, AND COMMUNICATION RELEASES.' },
    { id: 'pricing', title: 'Pricing Plans', icon: Star, category: 'CONTENT', color: 'bg-neo-orange', description: 'CALIBRATE SUBSCRIPTION TIERS, BILLING ARTIFACTS, AND CONSUMPTION LOGIC.' },
    { id: 'footer', title: 'Footer Content', icon: ImageIcon, category: 'CONTENT', color: 'bg-slate-500', description: 'MANAGE INFRASTRUCTURE LINKS, COMPLIANCE FOOTERS, AND SECONDARY NAVIGATION.' },
    { id: 'contact', title: 'Website Inquiries', icon: Mail, category: 'UTILITY', color: 'bg-emerald-500', description: 'PROCESS REGISTRY CONTACT REQUESTS AND INBOUND TELEMETRY TICKETS.' },
    { id: 'settings', title: 'Global Settings', icon: SettingsIcon, category: 'SECURITY', color: 'bg-neo-blue', description: 'SYSTEM-WIDE CONFIGURATION AND CORE PLATFORM INTEGRITY LOCKS.' },
  ];

  const handleBack = () => setActiveView('hub');

  const renderModuleContent = () => {
    switch (activeView) {
      case 'contact': return <Inquiries />;
      case 'settings': return <Settings />;
      default: return <ContentManager initialSection={activeView} onBack={handleBack} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] overflow-hidden transition-all duration-500">
      <AnimatePresence mode="wait">
        {activeView === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            className="flex flex-col h-full overflow-y-auto p-12 scrollbar-hide"
          >
            {/* TredPOS industries logic */}
            <div className="mb-12 border-b border-[var(--border-main)] pb-10">
               <div className="flex items-center justify-between mb-2">
                 <h1 className="text-5xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-none">
                    TREDPOS <span className="text-neo-blue">HQ</span>
                 </h1>
                 <div className="flex items-center gap-4 text-[9px] font-mono text-[var(--text-muted)] opacity-90 dark:opacity-60">
                   <span>TRANSIT_LINK // STABLE</span>
                   <span>SECTOR_07_v2.8</span>
                 </div>
               </div>
               <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[10px]">
                  TREDPOS_INDUSTRIES_HQ // SECTOR_WEB_MANAGEMENT
               </p>
            </div>

            {/* Institutional Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1920px]">
              {sections.map((section) => (
                <InstitutionalCard
                  key={section.id}
                  {...section}
                  onClick={() => setActiveView(section.id)}
                />
              ))}
            </div>

            <div className="h-20" />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full bg-[var(--bg-main)] overflow-hidden"
          >
            {/* Unified Workspace - No Header as per Request */}
            <div className="flex-1 overflow-y-auto">
              {renderModuleContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
