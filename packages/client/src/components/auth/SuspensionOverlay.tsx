import React from 'react';
import { AlertOctagon, Mail, ShieldAlert, Lock, ExternalLink } from 'lucide-react';

export default function SuspensionOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="max-w-2xl w-full industrial-panel bg-slate-900 border-red-500/30 overflow-hidden relative shadow-[0_0_100px_rgba(239,68,68,0.15)]">
        {/* Aesthetic Signal Layer */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
        <div className="absolute -right-20 -top-20 opacity-[0.02]">
           <AlertOctagon size={400} className="text-red-500" />
        </div>

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mb-6 relative">
              <Lock size={48} strokeWidth={1} />
              <div className="absolute -top-1 -right-1">
                 <span className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                 </span>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display text-white uppercase tracking-[0.2em] font-black mb-2 italic">
              Platform_Access_Restricted
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <ShieldAlert size={12} className="text-red-500" />
              <span className="text-[10px] font-mono text-red-500 uppercase font-black tracking-widest">Administrative Hold Active</span>
            </div>
          </div>

          <div className="space-y-6 text-slate-300 font-sans leading-relaxed text-sm">
            <div className="bg-slate-950/50 p-6 rounded-xl border border-white/5 space-y-4">
              <p className="font-bold text-white opacity-80 uppercase tracking-widest text-[10px]">Official Notice from Tred Industries HQ:</p>
              <p>Your business account on the <b>TREDPOS Platform</b> has been temporarily suspended due to outstanding payment obligations that remain unresolved at this time.</p>
              <p>This action has been taken in accordance with our service terms to ensure compliance with agreed financial commitments. Platform access is restricted until the matter is addressed.</p>
              <p>Once outstanding obligations are cleared, your account access will be promptly restored by the Vanguard Central Intelligence.</p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <p className="text-[11px] text-slate-900 dark:text-slate-500 uppercase tracking-widest text-center italic">
                Requiring clarification? Contact our support architecture.
              </p>
              <div className="flex gap-3">
                <a 
                  href="mailto:support@tredpos.com" 
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-steel/10 border border-brand-steel text-white text-[11px] font-display font-bold uppercase tracking-widest rounded-lg hover:bg-brand-steel hover:text-white transition-all"
                >
                  <Mail size={14} />
                  Support_Gateway
                </a>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[11px] font-display font-bold uppercase tracking-widest rounded-lg hover:bg-brand-accent hover:text-white transition-all shadow-lg shadow-brand-accent/5"
                >
                  <ExternalLink size={14} />
                  Re-Authenticate
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-500/5 px-8 py-4 border-t border-red-500/10 flex justify-between items-center">
           <span className="text-[9px] font-mono text-red-500/50 uppercase tracking-widest font-bold">Vanguard_Security_Enforcement</span>
           <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Protocol_ID: HMS-552</span>
        </div>
      </div>
    </div>
  );
}
