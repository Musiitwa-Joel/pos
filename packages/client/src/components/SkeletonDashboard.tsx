import React from 'react';
import { Activity, ShieldCheck, Loader2 } from 'lucide-react';

export default function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-8 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display flex items-center gap-3 text-slate-800 dark:text-slate-400">
            <Activity size={24} className="opacity-80 dark:opacity-50" />
            Intelligence Panel
          </h1>
          <div className="h-3 w-64 bg-slate-800 rounded mt-2 animate-pulse" />
        </div>
        <div className="flex gap-2 opacity-80 dark:opacity-50 pointer-events-none">
          <div className="btn-industrial btn-outline py-1 px-4 text-[9px] flex flex-col h-8 w-32 animate-pulse bg-slate-800 border-slate-700" />
          <div className="btn-industrial btn-primary py-1 px-4 text-[9px] flex flex-col h-8 w-32 animate-pulse bg-brand-accent/20 border-brand-accent/20" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="industrial-panel p-5 bg-[var(--bg-panel)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 bg-slate-800 rounded-sm" />
              <div className="w-12 h-4 bg-slate-800 rounded-sm" />
            </div>
            <div className="w-24 h-3 bg-slate-800 rounded-sm mb-2" />
            <div className="w-32 h-6 bg-slate-700 rounded-sm" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Main Chart Skeleton */}
        <div className="lg:col-span-2 industrial-panel p-6 animate-[pulse_2s_ease-in-out_infinite]">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="w-48 h-4 bg-slate-800 rounded-sm" />
              <div className="w-64 h-2 bg-slate-800 rounded-sm" />
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-2 bg-slate-800 rounded-sm" />
              <div className="w-16 h-2 bg-slate-800 rounded-sm" />
            </div>
          </div>
          <div className="h-80 w-full bg-slate-800/50 rounded flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-900 dark:text-slate-500 animate-spin" />
          </div>
        </div>

        {/* Intelligence Feed Skeleton */}
        <div className="industrial-panel flex flex-col min-h-[400px] animate-[pulse_2.5s_ease-in-out_infinite]">
          <div className="industrial-panel-header bg-[var(--panel-bg)]/40 flex justify-between">
            <div className="w-32 h-3 bg-slate-800 rounded-sm" />
            <div className="w-16 h-2 bg-slate-800 rounded-sm" />
          </div>
          <div className="p-4 space-y-3 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-brand-steel bg-brand-dark/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-sm" />
                  <div className="space-y-2">
                    <div className="w-16 h-2 bg-slate-800 rounded-sm" />
                    <div className="w-24 h-2 bg-slate-800/50 rounded-sm" />
                  </div>
                </div>
                <div className="w-12 h-3 bg-slate-700 rounded-sm" />
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-brand-steel bg-[var(--panel-bg)]/20">
            <div className="w-full h-8 bg-slate-800 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
