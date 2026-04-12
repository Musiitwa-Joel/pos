import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShoppingCart, 
  RotateCcw, 
  Banknote, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Package, 
  Truck, 
  DollarSign, 
  Settings,
  ArrowRight,
  ChevronRight,
  Cpu,
  Lock,
  History,
  Smartphone,
  Receipt,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../AuthContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductFeatures() {
  const { openAuth } = useAuth();

  const featureModules = [
    {
      id: "terminal",
      title: "High-Velocity Terminal",
      icon: ShoppingCart,
      color: "bg-neo-blue",
      specs: [
        "Real-time Barcode Orchestration",
        "Universal Product Caching",
        "Instant Dynamic Pricing Overrides",
        "Multi-Unit Scale Support"
      ]
    },
    {
      id: "cashier",
      title: "Daily Cashier Audit",
      icon: Banknote,
      color: "bg-neo-orange",
      specs: [
        "Register Locking (Shift Thresholds)",
        "Mandatory Cash Float Verification",
        "Physical Re-conciliation Logs",
        "Discrepancy Reporting Engine"
      ]
    },
    {
      id: "returns",
      title: "Returns Management Hub",
      icon: RotateCcw,
      color: "bg-neo-green",
      specs: [
        "Historical Sale Verification",
        "Reason-Coded Return Logic",
        "Automated Stock Restoration",
        "Partial Return Credit Cycles"
      ]
    },
    {
      id: "inventory",
      title: "Forensic Inventory",
      icon: Package,
      color: "bg-yellow-400",
      specs: [
        "Real-time Multi-Warehouse Sync",
        "Automated Procurement Triggers",
        "Low-Stock Threshold Alerts",
        "Batch & Expiry Ledger Tracking"
      ]
    },
    {
      id: "discounts",
      title: "Revenue Optimization",
      icon: DollarSign,
      color: "bg-purple-400",
      specs: [
        "Dynamic Promo Orchestration",
        "Percentage & Fixed Overrides",
        "Institutional Loyalty Integration",
        "Manager-Only Auth Support"
      ]
    },
    {
      id: "analytics",
      title: "Strategic Intelligence",
      icon: BarChart3,
      color: "bg-pink-400",
      specs: [
        "Forensic Financial Reporting",
        "Employee Performance Telemetry",
        "Yield Curve Analysis",
        "Custom SQL Data Exports"
      ]
    }
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.from(".features-hero-title", {
        y: 80,
        opacity: 0,
        rotate: -2,
        duration: 1,
        ease: "power4.out"
      });

      // Feature Cards Staggered Entry
      gsap.from(".feature-ledger-card", {
        scrollTrigger: {
          trigger: ".feature-ledger-grid",
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out"
      });

      // Hardware Dashboard Parallax
      gsap.from(".hardware-dashboard", {
        scrollTrigger: {
          trigger: ".hardware-section",
          start: "top 85%",
          scrub: 1
        },
        y: 100,
        rotate: 10,
        opacity: 0.5
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
     <div className="pt-20 overflow-hidden text-balance" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-32 bg-neo-blue text-white border-b-4 border-black overflow-hidden features-hero px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div>
            <div className="inline-block px-4 py-1 bg-neo-orange text-white neo-border mb-8 rotate-[-1deg]">
              <span className="text-xs font-black uppercase tracking-widest italic">Institutional Spec Ledger</span>
            </div>
             <h1 className="features-hero-title text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 font-display uppercase tracking-tighter italic">
              ENGINEERED <br />
              <span className="text-white underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-neo-green italic">MODULES</span>
            </h1>
            <p className="text-lg md:text-2xl font-bold max-w-2xl leading-tight opacity-70">
              A deep-dive analysis of the TredPOS functional landscape—from forensic cashier auditing to high-velocity terminal orchestration.
            </p>
          </div>
        </div>
        
        {/* Kinetic Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-15deg] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neo-orange/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Feature Ledger Grid */}
      <section className="py-20 sm:py-32 bg-white border-b-4 border-black feature-ledger-grid text-balance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
            {featureModules.map((module, i) => (
              <div
                key={module.id}
                className="feature-ledger-card neo-card p-6 sm:p-10 lg:p-12 bg-cream/30 hover:bg-white transition-all group border-b-[8px] sm:border-b-[12px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                style={{ borderBottomColor: i % 2 === 0 ? "var(--neo-orange)" : "var(--neo-blue)" }}
              >
                <div className={cn("w-14 h-14 sm:w-16 sm:h-16 neo-border flex items-center justify-center mb-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", module.color)}>
                  <module.icon size={28} className="sm:size-[32px]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tighter mb-8 leading-none italic">{module.title}</h3>
                
                <ul className="space-y-4 mb-10">
                  {module.specs.map((spec, j) => (
                    <li key={j} className="flex items-start gap-3 font-bold opacity-60 text-sm group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={18} className="text-neo-orange shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>

                <div className="pt-8 border-t-2 border-black/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-neo-orange transition-all">
                  Module Status: Active <Zap size={14} className="fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Deep Dive */}
      <section className="py-20 sm:py-32 bg-cream overflow-hidden border-b-4 border-black hardware-section text-balance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-5xl md:text-8xl font-black font-display uppercase italic tracking-tighter leading-[0.9] mb-12">THE <span className="text-neo-orange italic underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8">TERMINAL</span> ENGINE</h2>
              <p className="text-lg sm:text-2xl font-bold opacity-70 mb-12 max-w-2xl leading-snug">
                Engineered for 1,500 transactions per second. Our High-Velocity Terminal integrates hardware-level orchestration with forensic transactional security.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="p-6 sm:p-8 bg-white neo-border shadow-[10px_10px_0px_0px_rgba(249,115,22,1)]">
                  <Smartphone size={32} className="text-neo-orange mb-4" />
                  <h4 className="text-xl font-black font-display uppercase mb-2">Omni-Channel Sync</h4>
                  <p className="text-sm font-bold opacity-50">Seamlessly coordinate between physical POS terminals and mobile-first hubs.</p>
                </div>
                <div className="p-6 sm:p-8 bg-black text-white neo-border shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
                  <Receipt size={32} className="text-white mb-4" />
                  <h4 className="text-xl font-black font-display uppercase mb-2">Forensic Receipts</h4>
                  <p className="text-sm font-bold opacity-50 text-white/50">Audit-ready digital and physical receipts with zero-mismatch ledger keys.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative mt-12 lg:mt-0 px-4 sm:px-0">
              <div className="neo-border bg-neo-blue p-2 rotate-1 sm:rotate-3 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                <div className="aspect-[4/5] bg-white neo-border overflow-hidden rotate-[-1deg] sm:rotate-[-3deg] relative">
                  <div className="absolute inset-x-0 top-0 h-1 bg-neo-orange animate-[loading_2s_infinite]" />
                  <div className="p-8 space-y-6">
                    <div className="h-4 w-1/3 bg-slate-100 neo-border" />
                    <div className="space-y-2">
                       <div className="h-10 w-full bg-slate-200" />
                       <div className="h-10 w-full bg-slate-200" />
                    </div>
                    <div className="h-px bg-slate-400 opacity-20" />
                    <div className="flex justify-between items-center">
                       <div className="h-6 w-20 bg-neo-orange" />
                       <div className="h-8 w-32 bg-black" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 bg-neo-green neo-border p-4 sm:p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rotate-6">
                <span className="text-xl sm:text-2xl font-black font-display uppercase italic text-white">RELIABILITY SECURED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional CTA */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-8xl font-black mb-12 font-display leading-none uppercase italic">EXPERIENCE THE <br /> <span className="text-neo-orange">ORCHESTRATION</span>.</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => openAuth('signup')}
              className="neo-button-magnetic neo-button bg-neo-orange text-white text-2xl py-6 px-16 transition-all hover:scale-110 active:scale-95"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
