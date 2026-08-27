import React from 'react';
import { Activity, ShieldCheck, Loader2 } from 'lucide-react';
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonPulseStyle } from './SkeletonUI';

export default function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-8 h-full overflow-hidden bg-transparent">
      <SkeletonPulseStyle />
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-display flex items-center gap-3 text-slate-800 dark:text-slate-400">
            <Activity size={24} className="opacity-80 dark:opacity-50" />
            Intelligence Panel
          </h1>
          <SkeletonText width="w-64" height="h-2" />
        </div>
        <div className="flex gap-4 opacity-80 dark:opacity-50 pointer-events-none">
          <SkeletonBox className="h-10 w-32 rounded-lg border border-slate-800/20" />
          <SkeletonBox className="h-10 w-32 rounded-lg bg-brand-accent/10 border border-brand-accent/20" />
        </div>
      </div>

      {/* 📊 High-Performance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="industrial-panel p-6 bg-[var(--bg-panel)] flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <SkeletonBox className="w-10 h-10 rounded-lg" />
              <SkeletonText width="w-12" height="h-4" />
            </div>
            <div className="space-y-3">
              <SkeletonText width="w-24" />
              <SkeletonText width="w-40" height="h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* 📉 Main Metric Horizon */}
        <div className="lg:col-span-2 industrial-panel p-6 h-[480px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-3">
              <SkeletonText width="w-64" height="h-4" />
              <SkeletonText width="w-96" height="h-2" />
            </div>
            <div className="flex gap-6">
              <SkeletonText width="w-20" height="h-2" />
              <SkeletonText width="w-20" height="h-2" />
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-900/10 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5">
             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin-slow" />
             </div>
             <SkeletonBox className="w-full h-full opacity-5" />
          </div>
        </div>

        {/* 🛰️ Intelligence Feed Matrix */}
        <div className="industrial-panel flex flex-col h-[480px]">
          <div className="p-6 border-b border-brand-steel/30 bg-slate-100/5 flex justify-between items-center">
            <SkeletonText width="w-40" height="h-3" />
            <SkeletonBox className="w-16 h-5 rounded-full" />
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-brand-steel/20 rounded-lg bg-black/5">
                <div className="flex items-center gap-4">
                  <SkeletonCircle size="w-10 h-10" />
                  <div className="space-y-3">
                    <SkeletonText width="w-24" height="h-2" />
                    <SkeletonText width="w-32" height="h-1.5" className="opacity-40" />
                  </div>
                </div>
                <SkeletonText width="w-16" height="h-3" />
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-brand-steel/30 bg-slate-100/5">
            <SkeletonBox className="w-full h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
