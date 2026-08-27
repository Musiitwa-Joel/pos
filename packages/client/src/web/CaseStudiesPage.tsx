import React from 'react';
import { observer } from '@legendapp/state/react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Globe, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery } from '@apollo/client';
import { GET_CASE_STUDIES } from '../gql/website';

export default observer(function CaseStudiesPage() {
  const { data: caseRes } = useQuery(GET_CASE_STUDIES);
  const registryCases = caseRes?.getCaseStudies || [];

  const cases = registryCases.length > 0 ? registryCases.map((cs: any, i: number) => ({
    title: cs.title,
    industry: cs.industry,
    impact: cs.results || 'Institutional Success',
    desc: cs.summary || cs.content.substring(0, 150) + '...',
    metric: cs.metric || '0',
    metricLabel: cs.metric_label || 'Data Node',
    image: cs.image_url || `https://picsum.photos/seed/case${i}/800/600`,
    color: i % 3 === 0 ? "bg-neo-blue" : i % 3 === 1 ? "bg-neo-orange" : "bg-neo-green"
  })) : [
    {
      title: "Global Retail Corp",
      industry: "Enterprise Commerce",
      impact: "+42% Yield Efficiency",
      desc: "Revolutionizing inventory orchestration across 400+ international locations with real-time distributed ledgers.",
      metric: "400m+",
      metricLabel: "Annual Transactions",
      image: "https://picsum.photos/seed/retail/800/600",
      color: "bg-neo-blue"
    },
    {
      title: "Vanguard Logistics",
      industry: "Supply Chain",
      impact: "-30% Latency Reduction",
      desc: "Optimizing multi-warehouse synchronization via forensic predictive analytics and institutional AI.",
      metric: "12ms",
      metricLabel: "Sync Latency",
      image: "https://picsum.photos/seed/logistics/800/600",
      color: "bg-neo-orange"
    },
    {
      title: "Elite Trading Hub",
      industry: "Financial Services",
      impact: "Zero Forensic Mismatch",
      desc: "Hardening financial auditing with automated compliance protocols and absolute ledger transparency.",
      metric: "100%",
      metricLabel: "Audit Success",
      image: "https://picsum.photos/seed/trading/800/600",
      color: "bg-neo-green"
    }
  ];

  return (
    <div className="pt-20 overflow-hidden text-balance font-display">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-32 bg-neo-orange text-white border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="inline-block px-4 py-1 bg-white text-black neo-border mb-8 rotate-[-1deg]">
              <span className="text-xs font-black uppercase tracking-widest italic">Institutional ROI Proof</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-none mb-8 font-display uppercase tracking-tighter italic">
              ENGINEERED <br />
              <span className="text-white underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-black italic">SUCCESS</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-bold max-w-2xl leading-tight opacity-90">
              Forensic analysis of how the TredPOS architecture drives institutional yield and operational velocity across global markets.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-black/10 skew-x-[-15deg] pointer-events-none" />
      </section>

      {/* Stats Overview */}
      <section className="py-12 sm:py-20 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { val: "$4.2B", label: "Managed Volume" },
              { val: "99.99%", label: "Uptime Protocol" },
              { val: "15min", label: "Response SLA" },
              { val: "50+", label: "Regional Hubs" }
            ].map((stat, i) => (
              <div key={stat.label}>
                <div className="text-4xl sm:text-6xl font-black font-display text-neo-orange mb-2 italic tracking-tighter">{stat.val}</div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Grid */}
      <section className="py-20 sm:py-32 bg-cream/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20 sm:space-y-32">
            {cases.map((cs, i) => (
              <motion.div
                key={cs.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className={cn("grid lg:grid-cols-2 gap-12 lg:gap-20 items-center", i % 2 === 1 && "lg:flex-row-reverse")}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative neo-border overflow-hidden rotate-[-2deg] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] hover:rotate-0 transition-transform duration-500 group">
                    <img src={cs.image} alt={cs.title} className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className={cn("absolute bottom-4 right-4 sm:bottom-8 sm:right-8 p-4 sm:p-8 neo-border text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", cs.color)}>
                      <div className="text-3xl sm:text-5xl font-black font-display italic tracking-tighter">{cs.metric}</div>
                      <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-70">{cs.metricLabel}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1 bg-black text-white neo-border text-[10px] font-black uppercase tracking-widest">{cs.industry}</div>
                    <div className="text-neo-orange font-black uppercase tracking-widest text-[10px] sm:text-xs italic">{cs.impact}</div>
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-display uppercase tracking-tighter leading-tight italic">{cs.title}</h2>
                  <p className="text-lg sm:text-2xl font-bold opacity-60 leading-snug">{cs.desc}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-4 sm:pt-8">
                    <div className="p-6 bg-white neo-border hover:bg-cream transition-colors group cursor-default">
                      <BarChart3 size={28} className="mb-4 text-neo-orange" />
                      <h4 className="text-lg font-black font-display uppercase mb-2">Yield Analysis</h4>
                      <p className="text-sm font-bold opacity-40">Forensic breakdown of institutional growth.</p>
                    </div>
                    <div className="p-6 bg-white neo-border hover:bg-neo-blue hover:text-white transition-all group cursor-default">
                      <ShieldCheck size={28} className="mb-4 text-neo-green group-hover:text-white" />
                      <h4 className="text-lg font-black font-display uppercase mb-2">Compliance</h4>
                      <p className="text-sm font-bold opacity-40 group-hover:opacity-100">Zero-trust security verification.</p>
                    </div>
                  </div>

                  <button className="w-full sm:w-auto neo-button bg-black text-white text-lg sm:text-xl py-6 px-12 flex items-center justify-center gap-4 hover:gap-8 transition-all italic tracking-tight font-black uppercase">
                    Read the Full Blueprint <ExternalLink size={24} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Reviews Teaser */}
      <section className="py-32 bg-black text-white border-t-4 border-black text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black font-display uppercase italic tracking-tighter mb-12">VERIFIED INSTITUTIONAL <br /> <span className="text-neo-orange">REVIEWS</span></h2>
          <p className="text-xl font-bold opacity-70 mb-12">See what global traders and architects are saying about the TredPOS ecosystem.</p>
          <button className="neo-button-magnetic neo-button bg-white text-black text-2xl py-6 px-16 italic hover:bg-neo-green transition-transform">
            View Testimonials
          </button>
        </div>
      </section>
    </div>
  );
});
