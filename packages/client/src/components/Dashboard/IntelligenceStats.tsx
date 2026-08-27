import React from 'react';
import { 
  Coins, 
  Banknote, 
  TrendingDown, 
  Package, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  UserCheck 
} from 'lucide-react';
import { observer } from '@legendapp/state/react';
import { useIntelligence } from '../../contexts/IntelligenceContext';
import { formatCurrency, cn } from '../../lib/utils';

// 📊 [VANGUARD] Isolated Stats Grid:
// Self-contained reactive component. Re-renders ONLY when the 
// analytical 'stats$' observable updates.
export const IntelligenceStats = observer(() => {
  const { stats$ } = useIntelligence();
  const statsData = stats$.get();

  const cards = [
    { label: 'DAILY NET PROFIT', value: formatCurrency(statsData.netProfit), icon: Coins, trend: statsData.netProfit >= 0 ? 'POSITIVE' : 'NEGATIVE', color: statsData.netProfit >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'DAILY REVENUE', value: formatCurrency(statsData.netRevenue), icon: Banknote, trend: 'LIVE_NET', color: 'text-brand-accent' },
    { label: 'OPERATIONAL EXPENSE', value: formatCurrency(statsData.todayExpenses), icon: TrendingDown, trend: statsData.todayExpenses > 0 ? 'DEBIT' : 'STABLE', color: 'text-orange-400' },
    { label: 'INVENTORY EQUITY', value: formatCurrency(statsData.inventoryValue), icon: Package, trend: 'ASSET', color: 'text-blue-400' },
    { label: 'TOTAL PAYABLES', value: formatCurrency(statsData.totalPayables), icon: ArrowDownRight, trend: 'LIABILITY', color: 'text-red-400' },
    { label: 'TOTAL RECEIVABLES', value: formatCurrency(statsData.totalReceivables), icon: ArrowUpRight, trend: 'DEBT', color: 'text-brand-accent' },
    { label: 'CRITICAL STOCK', value: `${statsData.lowStockCount} / ${statsData.stockOutCount}`, icon: AlertTriangle, trend: 'WARN', color: 'text-orange-500' },
    { label: 'STAFF DEPLOYMENT', value: `${statsData.staffPresent} ACTIVE`, icon: UserCheck, trend: 'ON_DUTY', color: 'text-green-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <div key={i} className="industrial-panel p-3 sm:p-5 group hover:border-brand-accent/30 transition-all cursor-default bg-[var(--bg-panel)]">
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-[var(--bg-inset)] border border-brand-steel text-[var(--text-main)] group-hover:text-brand-accent group-hover:bg-brand-accent/5 transition-all">
              <stat.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className={cn("text-[7px] sm:text-[8px] font-mono font-bold px-1.5 sm:px-2 py-0.5 border border-current rounded-sm", stat.color)}>
              {stat.trend}
            </span>
          </div>
          <p className="text-[8px] sm:text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
          <h3 className="text-sm sm:text-xl font-display text-[var(--text-main)] truncate">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
});
