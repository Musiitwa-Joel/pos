import React from 'react';
import { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import Marquee from 'react-fast-marquee';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../AuthContext';
import TredPosSEO from '../components/common/TredPosSEO';
import {
  ShoppingCart,
  Package,
  Users,
  Zap,
  Globe,
  BarChart3,
  ArrowRight,
  Mail,
  Lock,
  X,
  Menu,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Receipt,
  Truck,
  UserCog,
  Search,
  ChevronRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_BILLING_PLANS } from '../gql/registry';
import { GET_HERO_SECTION, GET_WEBSITE_PRICING, GET_FEATURES } from '../gql/website';
import { cn } from '../lib/utils';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const { openAuth } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Safe unwrap for CommonJS/ESM interop
  const MarqueeComponent = (Marquee as any).default || Marquee;

  const { data: heroData } = useQuery(GET_HERO_SECTION);
  const hero = heroData?.getHeroSection;

  const systemModules = hero?.marqueeItems || [
    "Forensic Financial Reporting",
    "Client Onboarding Logic",
    "Real-Time Stock Synchronization",
    "HR & Payroll Orchestration",
    "Real-Time Settlement Reports",
    "Secure Multi-Layer Access",
    "Dynamic Ledger Synchronization",
    "Enterprise Hub Architecture",
    "AI-Driven Business Insights",
    "High-Velocity POS Terminal"
  ];

  const categories = ["All", "Operations", "Finance", "Strategy", "Inventory"];

  const ecosystemItems = [
    { title: "CRM Hub", icon: UserCog, category: "Operations", color: "bg-neo-orange" },
    { title: "Front Office", icon: LayoutDashboard, category: "Operations", color: "bg-neo-blue" },
    { title: "User Analytics", icon: Users, category: "Operations", color: "bg-neo-green" },
    { title: "Revenue Hub", icon: CreditCard, category: "Finance", color: "bg-yellow-400" },
    { title: "Yield Reports", icon: Receipt, category: "Strategy", color: "bg-purple-400" },
    { title: "Budget", icon: BarChart3, category: "Finance", color: "bg-pink-400" },
    { title: "Inventory", icon: Package, category: "Inventory", color: "bg-cyan-400" },
    { title: "POS Terminal", icon: ShoppingCart, category: "Finance", color: "bg-orange-400" },
  ];

  const filteredEcosystem = activeCategory === 'All'
    ? ecosystemItems
    : ecosystemItems.filter(item => item.category === activeCategory);

  const { data: pricingData } = useQuery(GET_WEBSITE_PRICING);
  const websitePricing = pricingData?.getWebsitePricing;

  const { data: featureData } = useQuery(GET_FEATURES);
  const registryFeatures = featureData?.getFeatures || [];

  const displayFee = websitePricing?.basePrice || "20K";
  const onboardedCount = websitePricing?.onboardedCount || 10;

  // Price Parsing Engine
  const priceParts = displayFee.toUpperCase().split(' ');
  const priceValue = priceParts[0] || '20K';
  const priceCurrency = priceParts[1] || 'USH';

  const getInstitutionalColor = (name: string) => {
    const colors = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[rev(Math.abs(hash)) % colors.length];
  };

  const rev = (n: number) => n; // Helper to avoid issues with Math.abs being used in indexing

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Headline Animation
      gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        rotate: -2,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1
      });

      gsap.from(".hero-subtext", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.8,
        ease: "power3.out"
      });

      gsap.from(".hero-cta", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: 1,
        ease: "back.out(1.7)",
        stagger: 0.2
      });

      // Hero Parallax
      gsap.to(".hero-parallax-bg", {
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          scrub: true
        },
        y: 100,
        ease: "none"
      });

      gsap.to(".hero-dashboard", {
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          scrub: true
        },
        y: -50,
        rotate: -2,
        ease: "none"
      });

      // Magnetic Buttons Logic
      const buttons = document.querySelectorAll(".neo-button-magnetic");
      buttons.forEach((btn) => {
        btn.addEventListener("mousemove", (e: any) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
          });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
          });
        });
      });

      // Feature Cards ScrollTrigger (with Scrub)
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
          end: "top 20%",
          scrub: 1
        },
        y: 60,
        opacity: 0,
        rotateX: -15,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });


      // Ecosystem Cards ScrollTrigger
      gsap.from(".ecosystem-card", {
        scrollTrigger: {
          trigger: ".ecosystem-section",
          start: "top 80%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "back.out(1.2)"
      });

      // Pricing Card ScrollTrigger
      gsap.from(".pricing-card-elite", {
        scrollTrigger: {
          trigger: ".pricing-section",
          start: "top 85%",
        },
        y: 100,
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen bg-cream overflow-hidden" ref={containerRef}>
      <TredPosSEO />
      <motion.div
        className="fixed top-0 left-0 w-full h-[2px] bg-neo-orange z-[100] origin-left"
        style={{ scaleX }}
      />
      <div className="min-h-screen bg-white text-black font-sans selection:bg-neo-orange selection:text-white">
        {/* Hero Section */}
        <section className="hero-section relative pt-24 lg:pt-[120px] pb-10 md:pb-20 bg-cream border-b-4 border-black overflow-hidden font-display text-balance">
          <div className="hero-parallax-bg absolute top-40 right-10 w-64 h-64 border-4 border-black rounded-full opacity-5 -z-0 hidden lg:block" />
          <div className="hero-parallax-bg absolute bottom-10 left-10 w-32 h-32 bg-neo-orange opacity-10 rotate-12 -z-0 hidden lg:block" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              <div className="lg:col-span-7">
                <div className="text-center lg:text-left">
                  <div className="inline-block px-4 py-1 bg-neo-green neo-border mb-6 rotate-[-2deg]">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{onboardedCount}+ GLOBAL INSTITUTIONS_ON_BOARD</span>
                  </div>
                  <h1 className="hero-title text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-[0.85] mb-8 font-display uppercase tracking-tighter italic">
                    {hero?.blackPart1 || "TRADE"} <br />
                    <span className="text-neo-orange">{hero?.orangePart || "WITHOUT"}</span> <br />
                    {hero?.blackPart2 || "LIMITS."}
                  </h1>
                  <p className="hero-subtext text-lg md:text-2xl font-bold max-w-xl mx-auto lg:mx-0 mb-10 leading-tight opacity-70">
                    {hero?.description || "The most powerful POS system for modern traders. Built for speed, scale, and absolute reliability."}
                  </p>
                  <div className="hero-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <button
                      onClick={() => openAuth('login')}
                      className="neo-button-magnetic neo-button bg-black text-white text-lg sm:text-xl py-4 sm:py-5 px-8 sm:px-10 flex items-center justify-center gap-3 w-full sm:w-auto font-black uppercase italic"
                    >
                      {hero?.primaryCta || "Start Free Trial"}
                      <ArrowRight size={24} />
                    </button>
                    <button className="neo-button-magnetic neo-button bg-white text-black text-lg sm:text-xl py-4 sm:py-5 px-8 sm:px-10 w-full sm:w-auto font-black uppercase italic">
                      {hero?.secondaryCta || "View Demo"}
                    </button>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-black bg-white overflow-hidden">
                          <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="flex justify-center sm:justify-start text-neo-orange">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                      </div>
                      <p className="text-[10px] sm:text-sm font-black uppercase">Trusted by 10,000+ Traders</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-dashboard lg:col-span-5 relative mt-10 lg:mt-0">
                <motion.div
                  initial={{ y: 50, opacity: 0, rotate: 5 }}
                  whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative mx-auto max-w-md lg:max-w-none"
                >
                  <div className="neo-card bg-neo-blue p-2 rotate-1 sm:rotate-3 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-white neo-border p-4 md:p-6">
                      <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div className="flex gap-2">
                          <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500 border-2 border-black" />
                          <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-yellow-500 border-2 border-black" />
                          <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-500 border-2 border-black" />
                        </div>
                        <div className="px-2 py-0.5 md:py-1 bg-black text-white text-[8px] md:text-[10px] font-black uppercase">Live Dashboard</div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="h-32 md:h-40 bg-cream neo-border flex items-end p-2 md:p-4 gap-1 md:gap-2">
                          {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-neo-orange neo-border" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div className="p-3 md:p-4 bg-neo-green/20 neo-border">
                            <p className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Revenue</p>
                            <p className="text-lg md:text-xl font-black">$42.5k</p>
                          </div>
                          <div className="p-3 md:p-4 bg-neo-blue/20 neo-border">
                            <p className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Orders</p>
                            <p className="text-lg md:text-xl font-black">1,284</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-4 md:-top-10 md:-right-10 neo-card bg-yellow-400 rotate-12 py-1 px-3 md:py-2 md:px-4 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Zap size={16} className="fill-black md:w-5 md:h-5" />
                    <span className="font-black uppercase text-[10px] md:text-sm">Real-time</span>
                  </div>
                  <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-10 neo-card bg-neo-green -rotate-6 py-1 px-3 md:py-2 md:px-4 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldCheck size={16} className="md:w-5 md:h-5" />
                    <span className="font-black uppercase text-[10px] md:text-sm">Secure</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Hub */}
        <div className="bg-black py-2 sm:py-3 overflow-hidden border-b-4 border-black font-display italic">
          <MarqueeComponent gradient={false} speed={50} pauseOnHover={true}>
            {systemModules.map((tech, i) => (
              <div key={tech + i} className="flex items-center gap-4 sm:gap-6 mr-10 sm:mr-16 py-2">
                <Star className="text-neo-orange fill-neo-orange size-3 sm:size-4 shrink-0" />
                <span className="text-white text-sm sm:text-xl font-black uppercase tracking-[0.2em] leading-none block">
                  {tech}
                </span>
              </div>
            ))}
          </MarqueeComponent>
        </div>

        {/* Features Grid */}
        <section className="features-section py-20 sm:py-32 bg-white border-b-4 border-black text-balance">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 font-display leading-[0.9] uppercase tracking-tighter italic">Built for the <br /> <span className="underline decoration-neo-orange decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8">Modern Trader</span></h2>
              <p className="text-lg md:text-xl font-bold max-w-2xl opacity-80">We've stripped away the bloat to give you exactly what you need to run your business at light speed.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {registryFeatures.length > 0 ? (
                registryFeatures.map((feature: any, i: number) => (
                  <div key={i} className="feature-card neo-card p-6 sm:p-10 group hover:-translate-y-2 transition-transform shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <div className={cn("w-14 h-14 sm:w-16 sm:h-16 neo-border flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", feature.color || 'bg-neo-orange')}>
                      <Zap className="size-7 sm:size-8" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black mb-4 font-display uppercase italic">{feature.title}</h3>
                    <p className="font-bold text-black/60 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                  </div>
                ))
              ) : (
                [
                  { title: "Lightning Fast Checkout", desc: "Process transactions in milliseconds with our optimized engine.", icon: Zap, color: "bg-neo-orange" },
                  { title: "Smart Inventory", desc: "Real-time tracking across all your locations and warehouses.", icon: Package, color: "bg-neo-blue" },
                  { title: "Deep Analytics", desc: "Understand your business with beautiful, actionable reports.", icon: BarChart3, color: "bg-neo-green" },
                  { title: "Global Payments", desc: "Accept any payment method, from anywhere in the world.", icon: CreditCard, color: "bg-yellow-400" },
                  { title: "Team Management", desc: "Role-based access and performance tracking for your staff.", icon: Users, color: "bg-purple-400" },
                  { title: "Forensic Auditing", desc: "Keep trading and track everything with forensic-level accuracy.", icon: ShieldCheck, color: "bg-pink-400" },
                ].map((feature, i) => (
                  <div key={i} className="feature-card neo-card p-6 sm:p-10 group hover:-translate-y-2 transition-transform shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <div className={cn("w-14 h-14 sm:w-16 sm:h-16 neo-border flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", feature.color)}>
                      <feature.icon className="size-7 sm:size-8" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black mb-4 font-display uppercase italic">{feature.title}</h3>
                    <p className="font-bold text-black/60 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Ecosystem Section */}
        <section className="ecosystem-section py-20 sm:py-32 bg-cream border-b-4 border-black text-balance">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-block px-6 py-2 bg-black text-white neo-border mb-6 rotate-1">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest italic">The Ecosystem</span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 font-display uppercase tracking-tight italic">ONE SYSTEM. <br /> EVERY MODULE.</h2>

              <div className="flex overflow-x-auto lg:flex-wrap lg:justify-center gap-3 mt-10 pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "neo-button text-[10px] sm:text-xs whitespace-nowrap px-6 py-3 font-black uppercase italic",
                      activeCategory === cat ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,107,0,1)]" : "bg-white text-black hover:bg-neo-orange"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredEcosystem.map((item, i) => (
                  <div
                    key={item.title}
                    className="ecosystem-card neo-card p-4 sm:p-6 group hover:bg-white cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    <div className={cn("w-10 h-10 sm:w-14 sm:h-14 neo-border flex items-center justify-center mb-4 sm:mb-6 group-hover:rotate-12 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", item.color)}>
                      <item.icon className="size-5 sm:size-7" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-black mb-1 sm:mb-2 font-display uppercase italic leading-none">{item.title}</h4>
                    <p className="text-[8px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest">{item.category}</p>
                    <div className="mt-4 sm:mt-6 flex items-center gap-2 text-neo-orange font-black text-[10px] group-hover:gap-4 transition-all">
                      LEARN MORE <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing-anchor" className="pricing-section py-20 sm:py-32 bg-white border-b-4 border-black text-balance">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 font-display leading-[0.9] uppercase tracking-tighter italic">One Platform. <br /> <span className="text-neo-orange">One Price.</span></h2>
              <p className="text-lg md:text-xl font-bold max-w-2xl mx-auto opacity-80">Unrestricted access to every module for one simple monthly rate.</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="pricing-card-elite neo-card bg-neo-blue text-white p-6 md:p-12 relative overflow-hidden group shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-colors" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center relative z-10">
                  <div>
                    <div className="inline-block px-4 py-1 bg-white text-black neo-border mb-6 rotate-[-2deg]">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest italic">{websitePricing?.subLabel || "Full Access Tier"}</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black mb-8 font-display uppercase tracking-tighter opacity-90 italic leading-none">{websitePricing?.planName || 'TREDPOS POWER'}</h3>

                    <div className="relative mb-8 md:mb-12 group/price inline-block">
                      {/* Kinetic Mesh Glow */}
                      <div className="absolute inset-0 bg-white/20 blur-[40px] rounded-full scale-110 sm:scale-150 animate-pulse" />

                      <div className="relative flex items-center gap-3 sm:gap-4">
                        <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display text-white tracking-tighter drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)] italic">
                          {priceValue}
                        </span>
                        <div className="flex flex-col justify-center border-l-4 border-white/20 pl-3 sm:pl-4 py-1 sm:py-2 mt-2 md:mt-4">
                          <span className="text-xl sm:text-2xl md:text-3xl font-black font-display text-neo-green italic leading-none">{priceCurrency}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40 mt-1 italic">/{websitePricing?.billingInterval?.replace('/', '') || 'MONTH'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openAuth('login')}
                      className="neo-button-magnetic neo-button w-full bg-black text-white text-lg sm:text-2xl py-5 md:py-6 flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 font-black uppercase italic"
                    >
                      Instant Deployment
                      <Zap size={24} className="fill-neo-orange" />
                    </button>
                  </div>

                  <div className="bg-white/10 neo-border p-6 sm:p-8 backdrop-blur-md border-white/20 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-black uppercase text-[10px] sm:text-xs tracking-widest mb-6 border-b border-white/20 pb-2 italic">Institutional Specs:</h4>
                      <ul className="space-y-4">
                        {(websitePricing?.features || [
                          { title: "All Ecosystem Modules" },
                          { title: "Unlimited Inventory Sync" },
                          { title: "Multi-Warehouse Logic" },
                          { title: "Real-time Dashboard" },
                          { title: "24/7 Elite Support" },
                          { title: "White-label Receipts" }
                        ]).map((f: any) => (
                          <li key={f.title} className="flex items-center gap-3 font-bold text-xs sm:text-sm text-white">
                            <CheckCircle2 size={18} className="text-neo-green shrink-0" />
                            {f.title}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 italic">Institutional Momentum:</p>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          {(websitePricing?.onboardedTenants || []).slice(0, 5).map((name: string, i: number) => (
                            <div
                              key={i}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-neo-blue flex items-center justify-center text-white text-[8px] sm:text-[10px] font-black shadow-lg"
                              style={{ backgroundColor: getInstitutionalColor(name) }}
                              title={name}
                            >
                              {name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {(websitePricing?.onboardedCount || 0) > 5 && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-neo-blue bg-black text-white flex items-center justify-center text-[8px] font-black">
                              +{onboardedCount - 5}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter leading-none italic">
                          Currently Scaling <br /> Business Nodes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



      </div>
    </div>
  );
}
