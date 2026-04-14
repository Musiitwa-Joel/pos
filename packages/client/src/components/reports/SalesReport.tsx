import React, { useMemo } from 'react';
import { TrendingUp, ShoppingCart, Search, BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts';
import { formatCurrency, cn } from '../../lib/utils';

interface SalesReportProps {
  type: 'SALES_SUMMARY' | 'PRODUCT_PERFORMANCE';
  salesSummary: {
    totalRevenue: number;
    grossRevenue: number;
    totalRefunds: number;
    txCount: number;
    avgValue: number;
    byMethod: Record<string, number>;
  };
  productStats: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default React.memo(function SalesReport({ type, salesSummary, productStats, searchQuery, onSearchChange }: SalesReportProps) {
  const byMethodData = useMemo(() => 
    Object.entries(salesSummary.byMethod).map(([k, v]) => ({ name: k.toUpperCase(), value: v })),
    [salesSummary.byMethod]
  );

  const filteredStats = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return searchQuery 
      ? productStats.filter((item: any) => item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query))
      : productStats;
  }, [productStats, searchQuery]);

  const maxRevenue = useMemo(() => 
    Math.max(1, (productStats[0] as any)?.revenue || 0),
    [productStats]
  );

  if (type === 'SALES_SUMMARY') {
    return (
      <div className="flex-1 flex flex-col gap-6 overflow-hidden h-full">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 no-print">
          {[
            { label: 'NET_SALES_VOLUME', value: formatCurrency(salesSummary.totalRevenue), color: 'text-success' },
            { label: 'GROSS_REVENUE', value: formatCurrency(salesSummary.grossRevenue), color: 'text-[var(--text-main)]' },
            { label: 'TOTAL_TX_COUNT', value: `${salesSummary.txCount} SALES`, color: 'text-brand-accent' },
            { label: 'AVG_SALES_VALUE', value: formatCurrency(salesSummary.avgValue), color: 'text-orange-400' },
          ].map((stat, i) => (
            <div key={i} className="industrial-panel p-4 flex flex-col gap-1 bg-brand-dark/20 border-brand-steel/30">
              <span className="text-[8px] md:text-[9px] font-display text-slate-900 dark:text-slate-500 tracking-widest">{stat.label}</span>
              <div className={`text-sm md:text-xl font-mono font-bold ${stat.color} truncate`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 no-print overflow-hidden pr-0 md:pr-2">
          {/* Chart Section */}
          <div className="industrial-panel p-6 flex flex-col border-brand-steel/30 bg-brand-dark/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-display text-slate-800 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp size={12} className="text-brand-accent" />
                REVENUE_BY_PAYMENT_METHOD
              </h3>
            </div>
            
            <div className="industrial-alert-v2 flex-shrink-0 mb-6 hidden sm:block">
              <div className="alert-label">PERIOD_ANALYSIS_PARAMETERS</div>
              <p className="font-mono leading-relaxed ">
                Metric aggregation is strictly limited to the currently selected time window. 
                Change the <span className="text-orange-400 font-bold">[From/To]</span> filters to adjust the data range.
              </p>
            </div>
            <div className="flex-1 min-h-[250px] md:min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMethodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="var(--text-muted)" />
                  <YAxis fontSize={9} axisLine={false} tickLine={false} stroke="var(--text-muted)" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', fontSize: '10px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {byMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : index === 1 ? '#22c55e' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="industrial-panel p-6 overflow-visible flex flex-col border-brand-steel/30 bg-brand-dark/10">
            <h3 className="text-[10px] font-display text-slate-800 dark:text-slate-400 mb-6 flex items-center gap-2">
              <ShoppingCart size={12} className="text-brand-accent" />
              TRANSACTION_DISTRIBUTION
            </h3>
            <div className="flex-1 overflow-y-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>METHOD</th>
                    <th className="text-right">VOLUME</th>
                    <th className="text-right">PERCENTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {byMethodData.map(({ name, value }) => (
                    <tr key={name} className="hover:bg-brand-steel/5">
                      <td className="text-[10px] uppercase font-display">{name}</td>
                      <td className="text-right font-mono text-xs text-[var(--text-main)] font-bold">{formatCurrency(value)}</td>
                      <td className="text-right font-mono text-xs text-slate-800 dark:text-slate-400">
                        {((value / (salesSummary.totalRevenue || 1)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRODUCT_PERFORMANCE
  return (
    <div className="industrial-panel flex-1 flex flex-col overflow-visible">
      <div className="p-4 border-b border-brand-steel flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-brand-dark/30">
        <div className="relative w-full sm:max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-500" size={14} />
           <input 
            type="text" 
            placeholder="FILTER_BY_IDENTITY_OR_SKU..." 
            className="terminal-input w-full pl-10 py-1.5 text-[10px] uppercase tracking-wider" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
           />
        </div>
        <div className="flex flex-col gap-2 hidden sm:flex">
           <div className="industrial-alert industrial-alert-info py-1 px-2 border-none bg-brand-accent/5">
              <div className="shrink-0 pt-0.5">
                <BarChart3 size={10} />
              </div>
              <span className="leading-tight">RANKINGS_BY_PERIOD_ACTIVITY</span>
           </div>
        </div>
      </div>
    <div className="flex-1 overflow-y-auto px-1">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12 md:w-16">RANK</th>
              <th className="text-left">PRODUCT_IDENTITY</th>
              <th className="text-right">QTY</th>
              <th className="text-right">REVENUE</th>
              <th className="text-right hidden sm:table-cell">CONTRIBUTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-900 dark:text-slate-500 font-mono text-[10px]">NO_SALES_RECORDS_FOR_THIS_PERIOD</td></tr>
             ) : filteredStats.map((item: any, i: number) => (
               <tr key={i} className="group hover:bg-brand-accent/5 transition-colors">
                 <td className="font-mono text-slate-900 dark:text-slate-500 text-[10px]">#{(i+1).toString().padStart(2, '0')}</td>
                 <td>
                   <div className="font-display text-[9px] md:text-[10px] text-[var(--text-main)] group-hover:text-brand-accent transition-colors uppercase truncate max-w-[140px] md:max-w-[300px]">{item.name}</div>
                   <div className="text-[7px] md:text-[8px] font-mono text-slate-900 dark:text-slate-500 mt-0.5 uppercase tracking-tighter italic block md:hidden">ID: {item.id.slice(0, 4)}...</div>
                   <div className="text-[8px] font-mono text-slate-900 dark:text-slate-500 mt-0.5 uppercase tracking-tighter italic hidden md:block">ID: {item.id.slice(0, 8)}...</div>
                 </td>
                 <td className="text-right font-mono text-[9px] md:text-xs text-brand-accent whitespace-nowrap font-bold">{item.qty} UNITS</td>
                 <td className="text-right font-mono text-[9px] md:text-xs whitespace-nowrap">{formatCurrency(item.revenue)}</td>
                 <td className="text-right min-w-[200px] hidden sm:table-cell">
                   <div className="flex items-center justify-end gap-2 md:gap-3">
                     <div className="flex-1 h-1 bg-brand-steel/30 rounded-full overflow-hidden max-w-[40px] md:max-w-[100px]">
                       <div 
                         className="h-full bg-brand-accent" 
                         style={{ width: `${Math.min(100, (item.revenue / maxRevenue) * 100)}%` }} 
                       />
                     </div>
                     <span className="text-[9px] md:text-[10px] font-mono text-slate-800 dark:text-slate-400 w-10 md:w-12 text-right">{((item.revenue / (salesSummary.totalRevenue || 1)) * 100).toFixed(0)}%</span>
                   </div>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
})
