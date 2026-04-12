import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Users, 
  Rocket, 
  Code, 
  Terminal, 
  Search,
  ArrowRight,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function CareersPage() {
  const openRoles = [
    { title: "Core Systems Architect", type: "Full-Time", location: "London / Remote", team: "Engineering", color: "bg-neo-orange" },
    { title: "Vanguard UI Engineer", type: "Full-Time", location: "New York / Remote", team: "Design", color: "bg-neo-blue" },
    { title: "Forensic Audit Lead", type: "Full-Time", location: "Singapore", team: "Operations", color: "bg-neo-green" },
    { title: "Distributed Systems Dev", type: "Full-Time", location: "Remote", team: "Engineering", color: "bg-yellow-400" },
    { title: "Institutional Growth Strategist", type: "Full-Time", location: "London", team: "Strategy", color: "bg-purple-400" }
  ];

  const perks = [
    { icon: Globe, title: "Global Command", desc: "Work from anywhere in our decentralized infrastructure." },
    { icon: Zap, title: "High Velocity", desc: "Rapid deployment cycles and institutional impact." },
    { icon: ShieldCheck, title: "Equity & Ownership", desc: "Every vanguard owns a piece of the architecture." },
    { icon: Rocket, title: "Next-Gen Tech", desc: "Pushing the limits of Bun, React 19, and Rust." }
  ];

  return (
     <div className="pt-20 overflow-hidden text-balance">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 lg:py-40 bg-black text-white border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-1 bg-neo-green neo-border mb-8 rotate-[-1deg]">
              <span className="text-xs font-black uppercase tracking-widest text-black">Now Recruiting Vanguards</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[120px] font-black leading-[0.8] mb-12 font-display uppercase tracking-tighter italic">
              ENGINEER <br />
              <span className="text-neo-orange">THE FUTURE</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-tight opacity-70 mb-12">
              Join the team building the world's most advanced Trading OS. We are looking for high-velocity engineers, strategists, and visionaries.
            </p>
            <button className="neo-button bg-white text-black text-2xl py-6 px-12 transition-all hover:bg-neo-orange hover:text-white">
              View Open Roles
            </button>
          </motion.div>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-blue blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-orange blur-[120px] rounded-full animate-pulse delay-700" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

       {/* Culture Section */}
      <section className="py-20 sm:py-32 bg-white border-b-4 border-black text-balance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tighter italic mb-10 leading-none">THE VANGUARD <br /> <span className="text-neo-blue underline underline-offset-8 decoration-8 decoration-neo-orange">ETHOS</span></h2>
              <p className="text-lg sm:text-xl font-bold opacity-60 leading-relaxed mb-10">
                We operate with institutional precision and startup velocity. At TredPOS, every vanguard is an owner. We take absolute responsibility for the code we ship and the impact it has on global markets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {perks.map((perk, i) => (
                  <div key={perk.title} className="p-6 neo-border bg-cream hover:bg-neo-blue hover:text-white transition-all group">
                    <perk.icon size={32} className="mb-4 text-neo-orange group-hover:text-white" />
                    <h4 className="text-lg font-black font-display uppercase mb-2">{perk.title}</h4>
                    <p className="text-sm font-bold opacity-60 group-hover:opacity-100">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mt-20 lg:mt-0">
              <div className="neo-border bg-neo-blue rotate-3 p-2 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                <div className="aspect-[4/3] bg-white neo-border overflow-hidden rotate-[-3deg]">
                  <img src="https://picsum.photos/seed/office-vibes/800/600" alt="Culture" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-neo-green neo-border p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-6">
                <span className="text-2xl font-black font-display uppercase italic">Work From The Future</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="roles" className="py-20 sm:py-32 bg-cream border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 sm:mb-20 gap-8">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-display uppercase tracking-tighter leading-none italic">ACTIVE <br /> <span className="text-neo-orange">SLOTS</span></h2>
            <div className="flex items-center gap-4 p-4 neo-border bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm hidden md:flex">
              <Search size={24} className="opacity-50" />
              <input type="text" placeholder="Filter by team or location..." className="font-bold outline-none flex-1 bg-transparent" />
            </div>
          </div>

          <div className="space-y-6">
            {openRoles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 sm:p-8 lg:p-10 bg-white neo-border hover:bg-black hover:text-white transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    <div className={cn("w-14 h-14 neo-border flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]", role.color)}>
                      <Briefcase size={24} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight">{role.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 font-bold opacity-60 text-xs sm:text-sm italic group-hover:opacity-100 transition-opacity">
                        <span>{role.team}</span>
                        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-neo-orange" />
                        <span>{role.location}</span>
                        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-neo-orange" />
                        <span>{role.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-neo-orange font-black uppercase text-xs tracking-widest group-hover:gap-8 transition-all group-hover:text-white">
                    Apply Now <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Footer */}
      <section className="py-20 bg-black text-white border-t-4 border-neo-orange overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-neo-orange neo-border flex items-center justify-center rotate-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <Terminal size={32} className="text-black" />
              </div>
              <div>
                <h4 className="text-2xl font-black font-display uppercase italic text-white leading-none">Don't see your role?</h4>
                <p className="font-bold opacity-60 mt-2">Send your strategic profile and GitHub to careers@tredpos.com</p>
              </div>
            </div>
            <button className="w-full md:w-auto neo-button bg-white text-black py-6 px-12 text-xl font-black uppercase italic hover:bg-neo-green transition-colors">
              General Application
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
