import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
   CheckCircle2,
   Cpu,
   ShieldCheck,
   TrendingUp,
   Package,
   CreditCard,
   Target,
   ArrowRight,
   Zap,
   Fingerprint,
   Users,
   Heart,
   Layout
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_WEBSITE_PRICING } from '../gql/website';
import { cn } from '../lib/utils';

export default function PricingDetail() {
   const { data } = useQuery(GET_WEBSITE_PRICING);
   const masterPlan = data?.getWebsitePricing;
   const [nodes, setNodes] = useState<number>(1);

   // Dynamic Monthly Rate from Registry Terminal
   const monthlyRate = masterPlan?.calculatorBaseRate || 50000;
   const annualCost = useMemo(() => nodes * monthlyRate * 12, [nodes, monthlyRate]);

   const defaultModules = [
      { title: "Industrial Profit Auditing", desc: "Stop revenue leaks with forensic ledger matching and real-time reconciliation.", icon: ShieldCheck },
      { title: "Global Node Inventory", desc: "Synchronize unlimited warehouses with sub-second stock accuracy.", icon: Package },
      { title: "Customer Loyalty Engine", desc: "Build elite revenue momentum with automated rewards and promotions.", icon: Heart },
      { title: "Military-Grade Security", desc: "FIPS-compliant biometric authentication for every register terminal.", icon: Fingerprint },
      { title: "Multi-Store Command Hub", desc: "Manage your entire retail empire from a single high-innovation dashboard.", icon: Layout },
      { title: "Predictive Yield AI", desc: "Forecast demand and optimize stock with the TredPOS momentum engine.", icon: TrendingUp }
   ];

   const getInstitutionalColor = (name: string) => {
      const colors = [
         '#F97316', // Tred Orange
         '#3B82F6', // Blue
         '#10B981', // Emerald
         '#8B5CF6', // Purple
         '#EF4444', // Red
         '#EC4899', // Pink
         '#06B6D4', // Cyan
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
         hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
   };

   const modules = useMemo(() => {
      if (!masterPlan?.features || masterPlan.features.length === 0) return defaultModules;
      // Map icons to the dynamic features from DB
      return masterPlan.features.map((feat: any, idx: number) => ({
         title: feat.title,
         desc: feat.description,
         icon: defaultModules[idx]?.icon || ShieldCheck
      }));
   }, [masterPlan]);

   return (
      <div className="bg-[#fcfcfc] text-[#1a1a1a] min-h-screen font-sans selection:bg-brand-accent selection:text-white pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 md:px-8 overflow-hidden">
         <div className="max-w-7xl mx-auto space-y-12 sm:space-y-20">

            {/* Header Section */}
            <div className="text-center space-y-6 max-w-4xl mx-auto">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest leading-none">
                  <Zap size={14} className="text-brand-accent" />
                  TredPOS Protocol Active
               </div>
               <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black font-display tracking-tight leading-[0.85] uppercase">
                  TredPOS <br />
                  <span className="text-brand-accent">Industries.</span>
               </h1>
               <p className="hidden sm:block text-lg font-medium text-slate-500 leading-relaxed max-w-2xl mx-auto italic">
                  Zero Complexity. Maximum Velocity. We've eliminated the fragmented licensing of legacy POS systems. One fixed rate of {masterPlan?.basePrice || "20K USH"}—UNLIMITED data, UNLIMITED staff, absolute control.
               </p>
            </div>

            {/* Massive Horizontal Tier Card */}
            <div className="relative group lg:px-10">
               <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white border-[1.5px] border-black rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-[15px_15px_0px_0px_rgba(249,115,22,0.1)] sm:shadow-[30px_30px_0px_0px_rgba(249,115,22,0.1)]"
               >
                  {/* Price Column */}
                  <div className="lg:w-[350px] xl:w-[400px] p-8 sm:p-12 bg-black border-b lg:border-b-0 lg:border-r border-black/10 flex flex-col justify-between items-center text-center">
                     <div className="space-y-4">
                        <div className="w-16 h-16 bg-brand-accent border-[1.5px] border-black rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                           <Cpu size={32} className="text-black" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                           {masterPlan?.planName || "TREDPOS POWER"}
                        </h3>
                        <p className="hidden sm:block text-[10px] font-bold text-brand-accent uppercase tracking-widest uppercase italic">Full Business Node Identity</p>
                     </div>

                     <div className="my-12">
                        <div className="flex items-baseline gap-2 justify-center">
                           <span className="text-8xl font-black font-display tracking-tighter text-white">
                              {masterPlan?.basePrice?.toLowerCase().replace('ush', '').trim() || "50k"}
                           </span>
                           <div className="flex flex-col items-start translate-y-[-10px]">
                              <span className="text-2xl font-black text-brand-accent italic">USH</span>
                              <span className="text-[10px] font-bold text-white opacity-40 uppercase tracking-widest">{masterPlan?.billingInterval || "/month"}</span>
                           </div>
                        </div>
                        <div className="mt-4 inline-block px-4 py-1.5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                           {masterPlan?.subLabel || "Unified License Tier"}
                        </div>
                     </div>

                     <button className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-3 border-[1.5px] border-black">
                        GET STARTED
                        <ArrowRight size={20} className="text-brand-accent" />
                     </button>
                  </div>

                  {/* Expanded Benefits Column (The Horizontal Expansion) */}
                  <div className="flex-1 p-8 sm:p-12 lg:p-14 xl:p-16 grid sm:grid-cols-2 gap-x-8 xl:gap-x-12 gap-y-8 xl:gap-y-10 bg-white">
                     {modules.map((mod, i) => (
                        <div key={mod.title} className="flex gap-6 group/item">
                           <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover/item:border-brand-accent transition-colors">
                              <mod.icon size={22} className="text-slate-400 group-hover/item:text-brand-accent transition-colors" />
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 {mod.title}
                                 <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                              </h4>
                              <p className="hidden md:block text-[11px] font-medium text-slate-500 leading-relaxed tracking-tight">
                                 {mod.desc}
                              </p>
                           </div>
                        </div>
                     ))}

                     {/* Metadata Footer for Benefits */}
                     <div className="md:col-span-2 pt-10 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="flex -space-x-4">
                              {(masterPlan?.onboardedTenants || []).slice(0, 10).map((name: string, i: number) => (
                                 <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center overflow-hidden text-white text-[11px] font-black ring-2 ring-white shadow-lg transition-transform hover:scale-110 cursor-pointer overflow-hidden"
                                    style={{ backgroundColor: getInstitutionalColor(name) }}
                                    title={name}
                                 >
                                    {name.charAt(0).toUpperCase()}
                                 </div>
                              ))}
                              {(masterPlan?.onboardedCount || 0) > 10 && (
                                 <div className="w-10 h-10 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-[10px] font-black ring-2 ring-white">
                                    +{masterPlan.onboardedCount - 10}
                                 </div>
                              )}
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Institutional Trust Matrix Active</p>
                        </div>
                        <div className="flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-[0.2em] italic">
                           <Target size={14} className="text-brand-accent" />
                           Ecosystem Protocol Status: <span className="text-brand-accent uppercase">Nominal</span>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
             {/* Node Calculator Section (Refined for TredPOS) */}
            <section className="bg-slate-50 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 lg:p-20 border-[1.5px] border-black/5 relative overflow-hidden">
               <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  <div className="space-y-12">
                     <h2 className="text-4xl font-black font-display tracking-tight text-slate-900 uppercase">
                        {masterPlan?.calculatorHeadline || "Scale Your Yield."}
                     </h2>

                     <div className="space-y-8">
                        <div className="space-y-6">
                           <div className="flex justify-between items-end">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Enterprise Deployment Nodes</label>
                              <div className="bg-white border-[1.5px] border-black px-6 py-2 rounded-xl flex items-center gap-2">
                                 <span className="text-2xl font-black font-display text-slate-900">{nodes}</span>
                                 <span className="text-[10px] font-bold text-slate-400">NODES</span>
                              </div>
                           </div>
                           <input
                              type="range"
                              min="1"
                              max="20"
                              step="1"
                              value={nodes}
                              onChange={(e) => setNodes(parseInt(e.target.value))}
                              className="w-full h-3 bg-white appearance-none cursor-pointer rounded-full border-[1.5px] border-black accent-brand-accent"
                           />
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                              <span>SYSTEM_START // 01 Node</span>
                              <span>ENTERPRISE_HUB // 20+ Nodes</span>
                           </div>
                        </div>

                        <div className="hidden sm:block p-6 bg-white border border-black shadow-[10px_10px_0px_0px_rgba(249,115,22,0.05)] space-y-4 text-center md:text-left">
                           <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest italic mb-2 block">Enterprise Protocol</span>
                           <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight italic">
                              "Each month will be {masterPlan?.basePrice || "20K USH"}." No complex math. One flat price per institutional node. Unlimited data. Unlimited staff. Pure retail velocity.
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="relative">
                     <motion.div
                        key={nodes}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-[1.5px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative z-10"
                     >
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-4 italic">Commitment Summary</p>
                        <div className="text-center mb-8 border-b border-slate-100 pb-8">
                           <div className="flex items-center justify-center gap-4 text-slate-400 text-sm font-bold uppercase mb-4 italic">
                              <span>{nodes} Node(s)</span>
                              <span className="text-slate-200">|</span>
                              <span>{masterPlan?.basePrice || "50k USH"}/Mo</span>
                           </div>
                           <span className="text-4xl sm:text-5xl md:text-7xl font-black font-display tracking-tighter text-slate-900 leading-none">
                              <span className="text-xl sm:text-2xl mr-2 text-slate-400 italic">USh</span>
                              {annualCost.toLocaleString()}
                           </span>
                           <p className="text-[11px] font-bold text-slate-500 mt-2 italic text-balance">Annual Enterprise Outflow Projection</p>
                        </div>

                        <button className="w-full bg-black text-white py-6 sm:py-8 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-accent hover:text-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 text-lg sm:text-xl font-display">
                           GET STARTED
                           <Zap size={24} className="text-brand-accent" />
                        </button>
                        <p className="hidden sm:block text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-50">
                           Encrypted Transaction Node v.2.4
                        </p>
                     </motion.div>

                     {/* Background decoration for calculator */}
                     <div className="absolute top-10 right-[-20px] w-full h-full bg-brand-accent/5 rounded-[2.5rem] -z-10" />
                  </div>
               </div>
            </section>

            {/* Global Footer */}
            <div className="text-center space-y-4 py-10 opacity-70">
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">A Subsidiary of Tredumo Industries Ltd</p>

            </div>

         </div>
      </div>
   );
}
