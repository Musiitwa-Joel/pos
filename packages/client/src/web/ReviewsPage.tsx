import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TredPosSEO from '../components/common/TredPosSEO';
import {
  Star,
  Quote,
  ShieldCheck,
  Zap,
  Users,
  Globe,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery } from '@apollo/client';
import Marquee from 'react-fast-marquee';
import { GET_REVIEWS } from '../gql/website';

export default function ReviewsPage() {
  const { data: reviewRes } = useQuery(GET_REVIEWS);
  const registryReviews = reviewRes?.getReviews || [];

  const testimonials = registryReviews.length > 0 ? registryReviews.map((r: any, i: number) => ({
    name: r.name,
    role: r.role + (r.company ? `, ${r.company}` : ''),
    quote: r.content,
    rating: r.rating || 5,
    impact: r.impact || 'Institutional Success',
    image: r.avatar_url || `https://picsum.photos/seed/user${i}/100/100`
  })) : [
    {
      name: "Marcus Thorne",
      role: "CTO, Global Retail Hub",
      quote: "TredPOS is more than a point of sale; it is the institutional nervous system that synchronized 450 locations within 72 hours. Speed is the primary feature.",
      rating: 5,
      impact: "42% Yield Efficiency",
      image: "https://picsum.photos/seed/marcus/100/100"
    },
    {
      name: "Elena Vance",
      role: "Strategy Director, TredPos Logistics",
      quote: "The forensic financial reporting module is unprecedented. Every transaction is a traceable node in a highly resilient distributed ledger system.",
      rating: 5,
      impact: "30% Operational Latency Reduction",
      image: "https://picsum.photos/seed/elena/100/100"
    },
    {
      name: "David Chen",
      role: "Chief Architect, Elite Trading Hub",
      quote: "Absolute reliability across distributed loads. TredPOS handles 1,500 transactions per second with forensic integrity and zero mismatch.",
      rating: 5,
      impact: "Zero Forensic Mismatch Success",
      image: "https://picsum.photos/seed/david/100/100"
    }
  ];

  const architecturalFeedback = [
    { title: "Distributed Sync", rating: 98, label: "Institutional Confidence" },
    { title: "Forensic Integrity", rating: 100, label: "Audit Readiness" },
    { title: "UI Velocity", rating: 95, label: "Operator Speed" },
    { title: "API Response", rating: 99, label: "Core Latency" }
  ];

  const MarqueeComponent = (Marquee as any).default || Marquee;

  return (
    <div className="pt-20 overflow-hidden text-balance">
      <TredPosSEO 
        title="Institutional Success Registry" 
        description="Forensic customer success stories and architectural feedback from global institutions using the TredPos Trading OS."
      />
      {/* Hero Section */}
      <section className="relative py-16 sm:py-32 bg-neo-blue text-white border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="inline-block px-4 py-1 bg-neo-green text-black neo-border mb-8 rotate-[-1deg]">
              <span className="text-xs font-black uppercase tracking-widest italic">Institutional Trust Registry</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-none mb-8 font-display uppercase tracking-tighter italic">
              VERIFIED <br />
              <span className="text-white underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-neo-orange italic">BUSINESSES</span>
            </h1>
            <p className="text-2xl font-bold max-w-2xl leading-tight opacity-70">
              The unfiltered truth about the architectural capabilities and institutional yield of the TredPOS Trading OS.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-96 h-96 border-4 border-white opacity-5 rotate-12 pointer-events-none rounded-full" />
      </section>

      {/* Trust Grid */}
      <section className="py-16 sm:py-20 bg-white border-b-4 border-black text-balance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 text-center">
            {architecturalFeedback.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 neo-border bg-cream hover:bg-neo-blue hover:text-white transition-all group"
              >
                <div className="text-4xl sm:text-6xl font-black font-display text-neo-orange mb-4 group-hover:text-white italic tracking-tighter">{stat.rating}%</div>
                <h4 className="text-lg sm:text-xl font-black font-display uppercase italic mb-2 leading-none">{stat.title}</h4>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32 bg-cream/30 text-balance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="neo-card p-6 sm:p-10 lg:p-12 bg-white flex flex-col justify-between group hover:-translate-y-2 transition-all transition-shadow duration-300 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <div>
                  <Quote size={40} className="text-neo-orange mb-10 opacity-30 group-hover:opacity-100 transition-opacity" />
                  <div className="flex gap-1 mb-8">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={20} className="fill-neo-orange text-neo-orange" />
                    ))}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold italic mb-10 leading-snug group-hover:text-neo-blue transition-colors">"{t.quote}"</p>
                </div>

                <div className="pt-10 border-t-2 border-neo-orange/20">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full neo-border" />
                    <div>
                      <h4 className="text-xl font-black font-display uppercase italic leading-none">{t.name}</h4>
                      <p className="text-xs font-black uppercase tracking-widest opacity-50">{t.role}</p>
                    </div>
                  </div>
                  <div className="inline-block px-3 py-1 bg-neo-blue text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Impact: {t.impact}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact Teaser */}
      <section className="py-20 sm:py-32 bg-white border-y-4 border-black overflow-hidden relative font-display text-balance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-display uppercase italic tracking-tighter leading-none mb-10 text-neo-orange">TRANSFORM <br /> YOUR <span className="text-black italic">ARCHITECTURE</span></h2>
              <p className="text-xl sm:text-2xl font-bold opacity-70 leading-tight">Join the institutional elite and experience forensic-grade retail OS results.</p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-end">
              <button className="neo-button bg-black text-white text-2xl py-6 px-16 italic hover:bg-neo-blue transition-colors shadow-[8px_8px_0px_0px_rgba(255,107,0,1)]">
                Start Discovery
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cream skew-x-[-15deg] pointer-events-none" />
      </section>

      {/* Verified Status Banner */}
      <div className="bg-neo-green py-3 border-b-4 border-black overflow-hidden relative font-display">
        <MarqueeComponent gradient={false} speed={60} pauseOnHover={true}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-8 py-2">
              <ShieldCheck className="text-black" size={18} />
              <span className="text-black text-sm font-black uppercase italic tracking-[0.2em] leading-none">
                VERIFIED_INSTITUTIONAL_FEEDBACK
              </span>
            </div>
          ))}
        </MarqueeComponent>
      </div>
    </div>
  );
}
