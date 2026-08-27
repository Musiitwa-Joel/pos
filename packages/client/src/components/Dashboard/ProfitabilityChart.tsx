import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { observer } from '@legendapp/state/react';
import { useIntelligence } from '../../contexts/IntelligenceContext';
import { formatCurrency } from '../../lib/utils';

// 📈 [VANGUARD] Profitability Analytics Engine:
// Decoupled charting component. Re-renders only when 'chartData$' shifts.
export const ProfitabilityChart = observer(() => {
  const { chartData$ } = useIntelligence();
  const chartData = chartData$.get();

  const isLight = document.documentElement.classList.contains('light');
  const gridColor = isLight ? '#E2E8F0' : '#2A2F3A';
  const axisColor = isLight ? '#64748B' : '#475569';
  const tooltipBg = isLight ? '#FFFFFF' : '#0F1115';
  const tooltipBorder = isLight ? '#E2E8F0' : '#2A2F3A';

  return (
    <div className="lg:col-span-2 industrial-panel p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xs font-display tracking-[0.2em] uppercase">Enterprise Profitability engine</h3>
          <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono">7-DAY PERFORMANCE DELTA // ACTUAL_TELEMETRY</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_#f97316]" />
            <span className="text-[8px] font-display text-slate-800 dark:text-slate-400 uppercase">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-[8px] font-display text-slate-800 dark:text-slate-400 uppercase">Net Profit</span>
          </div>
        </div>
      </div>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke={axisColor}
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dy={10}
              style={{ fontFamily: 'Michroma' }}
            />
            <YAxis
              stroke={axisColor}
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              style={{ fontFamily: 'Michroma' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0' }}
              itemStyle={{ fontSize: '9px', fontFamily: 'Michroma' }}
              labelStyle={{ fontSize: '9px', fontFamily: 'Michroma', marginBottom: '8px', color: '#94a3b8' }}
              formatter={(value: any) => [formatCurrency(value), '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRev)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#f97316' }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#22c55e' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
