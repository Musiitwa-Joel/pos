import React from 'react';
import { Percent, TrendingUp, BarChart3, Layers } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell 
} from 'recharts';
import { formatCurrency, cn } from '../../lib/utils';

interface ProfitMarginReportProps {
  profitStats: {
    totalRevenue: number;
    totalCOGS: number;
    totalProfit: number;
    avgMargin: number;
    products: any[];
    dailyTrend: any[];
  };
}

export default function ProfitMarginReport({ profitStats }: ProfitMarginReportProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-visible pr-2 custom-scrollbar pb-10">
      {/* Summary Cards */}
      <div className="industrial-alert-v2 flex-shrink-0 mx-2">
        <div className="alert-label">MARGIN_CALCULATION_LOGIC</div>
        <p className="font-mono leading-relaxed text-sm font-medium">
          Profit is derived by subtracting the <span className="text-orange-500 font-bold decoration-orange-500/30 underline underline-offset-4">[Cost of Goods Sold]</span> from net <span className="text-success font-bold decoration-success/30 underline underline-offset-4">[Revenue]</span>. 
          Average margin reflects the overall profitability percentage across all selected transactions.
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[300px] flex-shrink-0 no-print px-2">
        <div className="md:col-span-2 industrial-panel p-4 md:p-5 flex flex-col gap-4 border-brand-steel/30 bg-brand-dark/10 min-h-[250px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-display text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-accent" />
              PROFITABILITY_TREND_ANALYSIS
            </span>
            <div className="flex flex-col sm:flex-row sm:gap-4 items-end sm:items-center text-[7px] md:text-[8px] font-mono text-slate-900 dark:text-slate-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> REVENUE</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"></div> PROFIT</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {profitStats.dailyTrend.length === 1 ? (
                <BarChart data={profitStats.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.3} vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-main)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-main)" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(v) => `USh ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '10px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              ) : (
                <AreaChart data={profitStats.dailyTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="var(--text-main)" fontSize={8} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-main)" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(v) => `USh ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '4px', fontSize: '10px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="industrial-panel p-4 md:p-5 flex flex-col gap-4 border-brand-steel/30 bg-brand-dark/10 min-h-[250px]">
          <span className="text-[10px] font-display text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
            <BarChart3 size={14} className="text-brand-accent" />
            TOP_PERFORMERS
          </span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitStats.products.slice(0, 5)} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-main)" fontSize={8} width={80} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-main)', fontSize: '9px' }}
                   itemStyle={{ color: 'var(--text-main)' }}
                   labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                   formatter={(v: any) => formatCurrency(v)}
                />
                <Bar dataKey="profit" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                   {profitStats.products.slice(0, 5).map((_, index) => (
                     <Cell key={index} fill="#3b82f6" opacity={1 - index * 0.15} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="industrial-panel flex flex-col border-none bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-steel/50 rounded text-brand-accent">
               <Layers size={16} />
             </div>
             <div>
               <h4 className="text-[10px] font-display text-[var(--text-main)] uppercase tracking-[0.1em]">Product Profitability Matrix</h4>
               <p className="text-[8px] font-mono text-slate-900 dark:text-slate-500 uppercase font-medium">Per unit performance & contribution</p>
             </div>
          </div>
        </div>

        <div className="industrial-panel overflow-x-auto">
          <table className="data-table min-w-[1000px]">
            <thead>
              <tr>
                <th className="text-[var(--text-main)] font-bold sticky left-0 bg-brand-graphite z-10 border-r border-brand-steel/30 w-[180px]">PRODUCT_NAME</th>
                <th className="text-right text-[var(--text-main)] font-bold">UNITS_SOLD</th>
                <th className="text-right text-[var(--text-main)] font-bold">REVENUE</th>
                <th className="text-right text-[var(--text-main)] font-bold">COST</th>
                <th className="text-right text-[var(--text-main)] font-bold">PROFIT</th>
                <th className="text-right text-[var(--text-main)] font-bold">MARGIN_%</th>
              </tr>
            </thead>
            <tbody>
              {profitStats.products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-900 dark:text-slate-500 font-mono text-[10px]">NO_DATA_AGGREGATED_FOR_PERIOD</td></tr>
              ) : profitStats.products.map((p, i) => {
                const margin = (p.profit / (p.revenue || 1)) * 100;
                return (
                  <tr key={p.id || i} className="hover:bg-brand-steel/10 group transition-colors">
                    <td className="sticky left-0 bg-brand-graphite z-10 border-r border-brand-steel/30 group-hover:bg-brand-graphite shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                      <div className="text-[10px] font-display text-black dark:text-[var(--text-main)] uppercase group-hover:text-brand-accent transition-colors truncate font-bold">{p.name}</div>
                      <div className="text-[8px] font-mono text-slate-800 dark:text-slate-900 dark:text-slate-500 uppercase italic hidden sm:block font-bold">ID: {p.id.slice(0, 8)}...</div>
                    </td>
                    <td className="text-right font-mono text-xs text-slate-900 dark:text-slate-800 dark:text-slate-400 font-bold">{p.qty.toLocaleString()}</td>
                    <td className="text-right font-mono text-xs text-black dark:text-[var(--text-main)] font-bold">{formatCurrency(p.revenue)}</td>
                    <td className="text-right font-mono text-xs text-orange-400/80 ">{formatCurrency(p.cost)}</td>
                    <td className="text-right font-mono text-xs text-success font-bold">{formatCurrency(p.profit)}</td>
                    <td className="text-right">
                       <div className="flex flex-col items-end">
                          <span className={cn(
                            "text-[10px] font-mono font-bold",
                            margin >= 20 ? "text-success" : margin >= 10 ? "text-orange-400" : "text-danger"
                          )}>
                            {margin.toFixed(1)}%
                          </span>
                          <div className="w-12 h-1 bg-brand-steel/20 rounded-full mt-1 overflow-hidden">
                             <div className="h-full bg-brand-accent" style={{ width: `${Math.min(margin, 100)}%` }}></div>
                          </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
