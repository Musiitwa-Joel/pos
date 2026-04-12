import React from 'react';
import { Layers, TrendingUp, DollarSign } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface CategoryStats {
  category: string;
  revenue: number;
  cost: number;
  profit: number;
  qty: number;
}

interface CategorySalesReportProps {
  categoryStats: CategoryStats[];
}

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'];

export default function CategorySalesReport({ categoryStats }: CategorySalesReportProps) {
  const chartData = categoryStats.map((s, index) => ({
    ...s,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-visible">
      {/* V2 HUD Alert */}
      <div className="industrial-alert-v2 flex-shrink-0">
        <div className="alert-label">DEPARTMENTAL_BREAKDOWN_SCOPE</div>
        <p className="font-mono leading-relaxed ">
          Aggregated performance analysis grouped by product category. 
          Margins are calculated as <span className="text-orange-400 font-bold">[(Revenue - Cost) / Revenue]</span> per bucket.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-visible">
        {/* Chart View */}
        <div className="industrial-panel p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={14} className="text-brand-accent" />
            <h4 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest">Revenue_By_Department</h4>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="var(--text-muted)" 
                  fontSize={9} 
                  tickFormatter={(val) => `UGX ${val/1000}k`}
                />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  stroke="var(--text-muted)" 
                  fontSize={9}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-panel)', 
                    border: '1px solid var(--border-main)',
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono'
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                  labelStyle={{ color: 'var(--text-main)', marginBottom: '4px', fontWeight: 'bold' }}
                  formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.6} stroke={entry.fill} strokeWidth={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="industrial-panel flex flex-col overflow-visible h-full">
          <div className="p-4 border-b border-brand-steel flex justify-between bg-brand-dark/20 items-center">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-brand-accent" />
              <span className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest">Aggregation_Ledger</span>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="data-table min-w-[600px]">
              <thead>
                <tr>
                  <th>CATEGORY_NAME</th>
                  <th className="text-right">ITEMS_SOLD</th>
                  <th className="text-right">REVENUE</th>
                  <th className="text-right">MARGIN_%</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((stat, i) => {
                  const margin = stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-brand-steel/5 transition-colors">
                      <td className="font-display text-[10px] text-[var(--text-main)] uppercase">{stat.category}</td>
                      <td className="text-right font-mono text-[10px] text-slate-700 dark:text-slate-800 dark:text-slate-400 font-medium">{stat.qty}</td>
                      <td className="text-right font-mono text-[10px] text-brand-accent font-bold">{formatCurrency(stat.revenue)}</td>
                      <td className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          margin > 20 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          margin > 10 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
