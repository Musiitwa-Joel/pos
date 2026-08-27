import React, { useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TredPosSEO from '../components/common/TredPosSEO';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Users,
  Target,
  History,
  Globe,
  Zap,
  Shield,
  Cpu,
  BarChart,
  ArrowRight,
  UserCheck,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../AuthContext';
import { useQuery } from '@apollo/client';
import { GET_ABOUT_SECTIONS } from '../gql/website';

import { observer } from '@legendapp/state/react';
import { webState$ } from './webState';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default observer(function AboutPage() {
  const { openAuth } = useAuth();

  const { data: aboutData } = useQuery(GET_ABOUT_SECTIONS);
  const registrySections = aboutData?.getAboutSections || [];

  // Recalibrate Hero Node (Registry Hub override)
  const heroNode = registrySections.find((s: any) => s.section_type === 'HERO');
  const heroTitle = heroNode?.title || "ARCHITECTS OF TREDPOS OS";
  const heroContent = heroNode?.content || "We don't build software. We engineer the digital infrastructure of modern commerce. Speed, scale, and absolute forensic reliability.";

  // Filter dynamic institutional nodes
  const dynamicMilestones = registrySections
    .filter((s: any) => s.section_type === 'TIMELINE')
    .map((s: any) => ({
      year: s.subtitle || '2026',
      title: s.title,
      desc: s.content
    }));

  const dynamicCouncil = registrySections
    .filter((s: any) => s.section_type === 'TEAM')
    .map((s: any) => ({
      name: s.title,
      role: s.subtitle || 'TredPos Member',
      bio: s.content,
      image: s.image_url || `https://picsum.photos/seed/${s.id}/200/200`
    }));

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Header Animation (Gentle entry)
      gsap.from(".about-hero-title", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      // Timeline Scroll Animation
      gsap.from(".milestone-card", {
        scrollTrigger: {
          trigger: ".milestone-grid",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-0 bg-cream selection:bg-neo-orange selection:text-white" ref={containerRef}>
      <TredPosSEO 
        title="Institutional Identity & Mission" 
        description="The story of TredPos Industries. Engineering the world's most advanced Point-of-Sale ecosystem with forensic precision."
      />
      {/* Hero Section */}
      <section className="relative py-16 sm:py-32 bg-cream border-b-4 border-black overflow-hidden about-hero px-4 sm:px-6 lg:px-8">
        {/* Atmospheric Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neo-blue/5 via-transparent to-transparent opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-block px-4 py-1 bg-neo-orange neo-border mb-8 rotate-[-2deg]">
              <span className="text-xs font-black uppercase tracking-widest text-white italic">The Mission</span>
            </div>
            <h1 className="about-hero-title text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black mb-8 leading-[0.85] uppercase tracking-tighter">
              {heroTitle.includes(' ') ? (
                <>
                  {heroTitle.split(' ').slice(0, -2).join(' ')} <br />
                  <span className="text-neo-blue underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8">
                    {heroTitle.split(' ').slice(-2).join(' ')}
                  </span>
                </>
              ) : heroTitle}
            </h1>
            <p className="text-lg md:text-2xl font-bold max-w-3xl mx-auto leading-tight opacity-70">
              {heroContent}
            </p>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 border-4 border-black rounded-full opacity-5 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neo-green opacity-10 rotate-12 pointer-events-none" />
      </section>

      {/* Values Grid */}
      <section className="py-20 sm:py-32 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-balance">
            {[
              { icon: Zap, title: "Speed First", desc: "Latency is the enemy of profit. Every microsecond is optimized for institutional velocity.", color: "bg-neo-orange" },
              { icon: Shield, title: "Forensic Integrity", desc: "Absolute transparency and auditability in every transaction, automated at the core.", color: "bg-neo-blue" },
              { icon: Cpu, title: "Next-Gen AI", desc: "Intelligent orchestration that predicts demand and automates complex financial flows.", color: "bg-neo-green" }
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card p-6 sm:p-10 lg:p-12 hover:-translate-y-2 transition-transform cursor-default shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <div className={cn("w-14 h-14 sm:w-16 sm:h-16 neo-border flex items-center justify-center mb-6 sm:mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", v.color)}>
                  <v.icon size={28} className="sm:size-[32px]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 font-display uppercase italic">{v.title}</h3>
                <p className="font-bold text-black/60 leading-relaxed text-base sm:text-lg">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 bg-neo-blue text-white border-b-4 border-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-20 font-display text-center uppercase tracking-tighter italic leading-[0.9]">THE TREDPOS PATH</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 milestone-grid">
            {dynamicMilestones.length > 0 ? dynamicMilestones.map((m: any, i: number) => (
              <div
                key={m.year + i}
                className="milestone-card relative p-8 bg-white/10 neo-border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="text-5xl md:text-6xl font-black font-display text-white mb-4 opacity-50 italic">{m.year}</div>
                <h4 className="text-2xl font-black mb-4 font-display uppercase tracking-tight">{m.title}</h4>
                <p className="font-bold opacity-70">{m.desc}</p>
              </div>
            )) : (
              <p className="col-span-full text-center font-black uppercase opacity-40">Awaiting Institutional History Deployment...</p>
            )}
          </div>
        </div>
      </section>

      {/* Council Section (Team) */}
      <section className="py-32 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-20 gap-8">
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black font-display uppercase leading-[0.9] tracking-tighter">THE TREDPOS <br /> <span className="text-neo-orange">COUNCIL</span></h2>
            <p className="text-lg md:text-xl font-bold max-w-md opacity-60">The architects, strategists, and visionaries engineering the next generation of global trading.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 council-grid">
            {dynamicCouncil.length > 0 ? dynamicCouncil.map((member: any, i: number) => (
              <div
                key={member.name + i}
                className="council-card group"
              >
                <div className="relative mb-8 aspect-square overflow-hidden neo-border grayscale hover:grayscale-0 transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] md:shadow-[12px_12px_0px_0px_rgba(255,107,0,1)] group-hover:shadow-none group-hover:translate-x-[8px] group-hover:translate-y-[8px] md:group-hover:translate-x-[12px] md:group-hover:translate-y-[12px]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 font-display uppercase tracking-tight">{member.name}</h3>
                <p className="text-neo-orange font-black uppercase tracking-widest text-[10px] sm:text-xs mb-6 underline decoration-2 underline-offset-4">{member.role}</p>
                <p className="font-bold opacity-60 text-base md:text-lg leading-snug">{member.bio}</p>
              </div>
            )) : (
              <p className="col-span-full text-center font-black uppercase opacity-40">Awaiting Vanguard Council Provisioning...</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neo-orange/10 via-transparent to-transparent opacity-50" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-6xl md:text-[120px] font-black mb-16 leading-[0.8] uppercase tracking-tighter italic">
            <span className="inline-block bg-neo-orange text-white px-6 py-2 mb-2">JOIN THE</span> <br />
            <span className="inline-block bg-neo-orange text-white px-6 py-2">REVOLUTION.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => openAuth('signup')}
              className="neo-button-magnetic neo-button bg-neo-orange text-white text-2xl py-6 px-12 transition-all hover:scale-110 active:scale-95 uppercase font-black"
            >
              Start Free Trial
            </button>
            <button className="neo-button-magnetic neo-button bg-white text-black text-2xl py-6 px-12 transition-all hover:scale-110 active:scale-95 uppercase font-black">
              View Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
});
