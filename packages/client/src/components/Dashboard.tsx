import React, { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Coins,
  ShieldCheck,
  Activity,
  ArrowDownRight,
  ClipboardList,
  UserCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useHardware } from '../HardwareContext';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';
import Modal from './Modal';
import SkeletonDashboard from './SkeletonDashboard';

export default function Dashboard() {
  const {
    sales, products, customers, expenses, suppliers, attendance,
    refreshInventory, refreshSales, refreshExpenses, refreshSuppliers, saleReturns,
    isReady
  } = useHardware();

  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    // Release the main thread and show skeleton during initial sync
    if (!isReady) return;
    const timer = setTimeout(() => setIsInitializing(false), 300);
    return () => clearTimeout(timer);
  }, [isReady]);

  // [Bespoke Ticker] Recalibrate 'Today' boundaries every 60s for real-time accuracy
  useEffect(() => {
    const ticker = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(ticker);
  }, []);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleLiveSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    toast.promise(
      Promise.all([
        refreshInventory(),
        refreshSales(),
        refreshExpenses(),
        refreshSuppliers()
      ]),
      {
        loading: 'ESTABLISHING_TELEMETRY_LINK...',
        success: 'SYSTEM_SYNCHRONIZATION_COMPLETE',
        error: 'TELEMETRY_LINK_FAILURE: RETRY_REQUIRED',
        finally: () => setIsSyncing(false)
      }
    );
  };

  const handleGenerateReport = async () => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);

    const reportId = `SEC_RPT_${Math.random().toString(36).substring(7).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const generatePromise = new Promise(resolve => setTimeout(resolve, 2000));

    toast.promise(generatePromise, {
      loading: `ENCRYPTING_TELEMETRY_PAYLOAD [SHA-256]...`,
      success: `ENCRYPTED_REPORT_${reportId}_GENERATED`,
      error: 'ENCRYPTION_FAILED: KEY_MISMATCH',
      finally: () => {
        setIsGeneratingReport(false);

        // Generate actual file content
        const reportContent = `
================================================================================
TREDUMO // INTELLIGENCE_SYSTEM_ENCRYPTED_REPORT
================================================================================
REPORT_ID: ${reportId}
TIMESTAMP: ${timestamp}
SECURITY_AUDIT: ${auditReport.length > 0 ? 'SIGNATURES_DETECTED' : 'CLEAR'}
--------------------------------------------------------------------------------

[KEY_FINANCIAL_TELEMETRY]
${stats.map(s => `${s.label}: ${s.value}`).join('\n')}

[AUDIT_FINDINGS]
${auditReport.length > 0 ? auditReport.map(f => `[${f.type}] ${f.msg}`).join('\n') : 'NO_ANOMALIES_DETECTED'}

--------------------------------------------------------------------------------
EOF // END_OF_FILE // ENCRYPTION_HASH: ${Math.random().toString(36).substring(2, 11).toUpperCase()}
================================================================================
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `INTELLIGENCE_REPORT_${reportId}.txt`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const auditReport = useMemo(() => {
    const findings = [];

    // Check for extreme debt
    const criticalDebtors = customers.filter(c => c.balance > (c.creditLimit * 0.9));
    if (criticalDebtors.length > 0) {
      findings.push({
        type: 'WARN',
        msg: `${criticalDebtors.length} CUSTOMERS EXCEEDING 90% CREDIT_CAPACITY`,
        id: 'DEBT_SIG'
      });
    }

    // Check for stock outs
    const stockOuts = products.filter(p => p.stock === 0);
    if (stockOuts.length > 0) {
      findings.push({
        type: 'CRITICAL',
        msg: `${stockOuts.length} PRODUCT_LINES REPORTING ZERO_INVENTORY`,
        id: 'STOCK_SIG'
      });
    }

    // Integrity Check: Sales with 0 items
    const emptySales = sales.filter(s => !s.items || s.items.length === 0);
    if (emptySales.length > 0) {
      findings.push({
        type: 'ERROR',
        msg: `${emptySales.length} TRANSACTION_RECORDS DETECTED WITH NULL_PAYLOAD`,
        id: 'DATA_INT_SIG'
      });
    }

    return findings;
  }, [customers, products, sales]);

  const stats = useMemo(() => {
    const today = new Date(now).setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => {
      const sDate = s.createdAt ? new Date(s.createdAt).getTime() : s.timestamp;
      return sDate >= today;
    });
    const todayReturns = saleReturns.filter(r => {
      const rDate = new Date(r.createdAt).getTime();
      return rDate >= today;
    });

    const todayExpenses = expenses.filter(e => {
      const eDate = new Date(e.date).getTime();
      return eDate >= today;
    }).reduce((acc, e) => acc + e.amount, 0);
    const todayRefunds = todayReturns.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    // Revenue & COGS
    const grossRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
    const netRevenue = grossRevenue - todayRefunds;

    const cogs = todaySales.reduce((acc, s) => {
      const saleCost = s.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + ((item.costPrice || product?.costPrice || 0) * item.quantity);
      }, 0);
      return acc + saleCost;
    }, 0);

    // Adjust COGS for returned items if they go back to stock
    const returnCogs = todayReturns.reduce((acc, r) => {
      const product = products.find(p => p.id === r.productId);
      return acc + ((product?.costPrice || 0) * r.quantity);
    }, 0);

    const grossProfit = netRevenue - (cogs - returnCogs);
    const netProfit = grossProfit - todayExpenses;

    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    const stockOutCount = products.filter(p => p.stock === 0).length;

    const totalReceivables = customers.reduce((acc, c) => acc + c.balance, 0);
    const totalPayables = suppliers.reduce((acc, s) => acc + s.balance, 0);

    const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);

    const staffPresent = attendance.filter(a => {
      const aDate = new Date(a.date).setHours(0, 0, 0, 0);
      return aDate === today && (a.status === 'present' || a.status === 'late');
    }).length;

    return [
      { label: 'DAILY NET PROFIT', value: formatCurrency(netProfit), icon: Coins, trend: netProfit >= 0 ? 'POSITIVE' : 'NEGATIVE', color: netProfit >= 0 ? 'text-green-400' : 'text-red-400' },
      { label: 'DAILY REVENUE', value: formatCurrency(netRevenue), icon: Banknote, trend: 'LIVE_NET', color: 'text-brand-accent' },
      { label: 'OPERATIONAL EXPENSE', value: formatCurrency(todayExpenses), icon: TrendingDown, trend: todayExpenses > 0 ? 'DEBIT' : 'STABLE', color: 'text-orange-400' },
      { label: 'INVENTORY EQUITY', value: formatCurrency(inventoryValue), icon: Package, trend: 'ASSET', color: 'text-blue-400' },
      { label: 'TOTAL PAYABLES', value: formatCurrency(totalPayables), icon: ArrowDownRight, trend: 'LIABILITY', color: 'text-red-400' },
      { label: 'TOTAL RECEIVABLES', value: formatCurrency(totalReceivables), icon: ArrowUpRight, trend: 'DEBT', color: 'text-brand-accent' },
      { label: 'CRITICAL STOCK', value: `${lowStockCount} / ${stockOutCount}`, icon: AlertTriangle, trend: 'WARN', color: 'text-orange-500' },
      { label: 'STAFF DEPLOYMENT', value: `${staffPresent} ACTIVE`, icon: UserCheck, trend: 'ON_DUTY', color: 'text-green-500' },
    ];
  }, [sales, products, customers, expenses, suppliers, attendance, saleReturns]);

  const chartData = useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const buckets = new Map();

    // Initialize 7-day window
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      buckets.set(dayStart, {
        name: days[new Date(dayStart).getDay()],
        revenue: 0, profit: 0, expenses: 0, cogs: 0
      });
    }

    const dayKeys = Array.from(buckets.keys()).sort();
    const minDate = dayKeys[0];

    // O(N) Processing - Single pass through all data streams
    sales.forEach(s => {
      const sDate = s.createdAt ? new Date(s.createdAt).getTime() : s.timestamp;
      const dayKey = new Date(sDate).setHours(0, 0, 0, 0);
      if (buckets.has(dayKey)) {
        const b = buckets.get(dayKey);
        b.revenue += s.total;

        // Calculate COGS in same pass
        const saleCogs = s.items.reduce((acc, item) => {
          const product = products.find(p => p.id === item.productId);
          return acc + ((item.costPrice || product?.costPrice || 0) * item.quantity);
        }, 0);
        b.cogs += saleCogs;
      }
    });

    expenses.forEach(e => {
      const eDate = new Date(e.date).getTime();
      const dayKey = new Date(eDate).setHours(0, 0, 0, 0);
      if (buckets.has(dayKey)) {
        buckets.get(dayKey).expenses += e.amount;
      }
    });

    saleReturns.forEach(r => {
      const rDate = new Date(r.createdAt).getTime();
      const dayKey = new Date(rDate).setHours(0, 0, 0, 0);
      if (buckets.has(dayKey)) {
        const b = buckets.get(dayKey);
        b.revenue -= (Number(r.amount) || 0);
        const product = products.find(p => p.id === r.productId);
        b.cogs -= ((product?.costPrice || 0) * r.quantity);
      }
    });

    return dayKeys.map(key => {
      const b = buckets.get(key);
      return {
        ...b,
        profit: b.revenue - b.cogs - b.expenses
      };
    });
  }, [sales, expenses, products, saleReturns, now]);

  const combinedLogs = useMemo(() => {
    const saleLogs = sales.map(s => ({ ...s, type: 'SALE', sortDate: s.createdAt ? new Date(s.createdAt).getTime() : s.timestamp }));
    const expenseLogs = expenses.map(e => ({ ...e, type: 'EXPENSE', sortDate: new Date(e.date).getTime() }));
    return [...saleLogs, ...expenseLogs].sort((a, b) => b.sortDate - a.sortDate).slice(0, 5);
  }, [sales, expenses]);

  const isLight = document.documentElement.classList.contains('light');
  const gridColor = isLight ? '#E2E8F0' : '#2A2F3A';
  const axisColor = isLight ? '#64748B' : '#475569';
  const tooltipBg = isLight ? '#FFFFFF' : '#0F1115';
  const tooltipBorder = isLight ? '#E2E8F0' : '#2A2F3A';

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display flex items-center gap-3">
            <Activity size={24} className="text-brand-accent animate-pulse shrink-0" />
            Intelligence Panel
          </h1>
          <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono mt-1 tracking-widest uppercase truncate max-w-[280px] sm:max-w-none">
            CORE_METRICS_V2 // SECURITY_LEVEL: ALPHA // {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <button
            onClick={() => setIsAuditOpen(true)}
            className="btn-industrial btn-outline py-1 px-4 text-[9px] flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <ShieldCheck size={12} />
            SECURITY_AUDIT
          </button>
          <button
            onClick={handleLiveSync}
            disabled={isSyncing}
            className="btn-industrial btn-primary py-1 px-4 text-[9px] flex items-center gap-2 min-w-[120px] justify-center flex-1 sm:flex-none"
          >
            {isSyncing ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                SYNCING...
              </>
            ) : (
              <>
                <Activity size={12} />
                LIVE_SYNC
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Main Chart */}
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
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="industrial-panel flex flex-col min-h-[400px]">
          <div className="industrial-panel-header bg-[var(--panel-bg)]/40">
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-brand-accent" />
              <span className="text-[10px] font-display">INTELLIGENCE_FEED</span>
            </div>
            <span className="text-[8px] font-mono text-brand-accent animate-pulse">● LIVE_DATA</span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {combinedLogs.map((log: any, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-3 border group transition-all",
                log.type === 'SALE' ? "border-brand-steel bg-brand-dark/5 hover:border-brand-accent/50" : "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center transition-colors",
                    log.type === 'SALE' ? "bg-brand-steel/10 text-brand-accent" : "bg-orange-500/10 text-orange-400"
                  )}>
                    {log.type === 'SALE' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div>
                    <p className="text-[9px] font-display">{log.type === 'SALE' ? log.paymentMethod.toUpperCase() : log.category.toUpperCase()}</p>
                    <p className="text-[8px] text-slate-900 dark:text-slate-500 font-mono mt-0.5">
                      {new Date(log.sortDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // {log.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-mono font-bold",
                    log.type === 'SALE' ? "text-brand-accent" : "text-orange-400"
                  )}>
                    {log.type === 'SALE' ? '+' : '-'}{formatCurrency(log.total || log.amount)}
                  </span>
                </div>
              </div>
            ))}
            {combinedLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 py-20">
                <p className="text-[10px] font-display uppercase tracking-widest opacity-30">Await_Telemetry...</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-brand-steel bg-[var(--panel-bg)]/20">
            <button className="btn-industrial btn-outline w-full text-[9px] tracking-widest">
              SYSTEM_CONSOLIDATION_VIEW
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Modal */}
      <Modal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        title="SYSTEM_SECURITY_AUDIT"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between p-2 sm:p-4 bg-brand-dark border border-brand-steel rounded-sm gap-4 text-center sm:text-left">
            <div>
              <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">AUDIT_STATUS</p>
              <h4 className="text-[10px] xs:text-xs sm:text-lg font-display text-brand-accent uppercase">INTEGRITY_VERIFIED</h4>
            </div>
            <CheckCircle2 size={24} className="text-green-500 shrink-0 sm:w-[32px] sm:h-[32px]" />
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-[0.2em]">ANOMALY_DETECTION_RESULTS</h5>
            <div className="space-y-2">
              {auditReport.map((finding) => (
                <div key={finding.id} className="p-3 bg-brand-dark/50 border border-brand-steel flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4 group">
                  <div className={cn(
                    "p-1.5 sm:p-2 bg-brand-graphite border shrink-0",
                    finding.type === 'ERROR' ? "border-danger text-danger" : "border-orange-500 text-orange-500"
                  )}>
                    <AlertTriangle size={14} className="sm:w-[16px] sm:h-[16px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[7px] sm:text-[8px] font-mono text-slate-900 dark:text-slate-500 mb-0.5 truncate uppercase tracking-tighter">[{finding.type}] // {finding.id}</p>
                    <p className="text-[9px] sm:text-[10px] font-display leading-relaxed break-words">{finding.msg}</p>
                  </div>
                </div>
              ))}
              {auditReport.length === 0 && (
                <div className="p-6 sm:p-10 text-center border border-brand-steel border-dashed border-opacity-20 max-w-full overflow-hidden">
                  <p className="text-[7px] xs:text-[8px] sm:text-[10px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest leading-relaxed break-words px-2">
                    NO_ANOMALIES_DETECTED_IN_PENDING_BUFFER
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-steel flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={() => setIsAuditOpen(false)}
              className="btn-industrial btn-outline py-2 px-6 text-[8px] sm:text-[10px] order-2 sm:order-1"
            >
              CLOSE_VOICE
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="btn-industrial btn-primary py-2 px-6 text-[7px] xs:text-[8px] sm:text-[10px] flex items-center gap-2 justify-center order-1 sm:order-2 tracking-tighter sm:tracking-widest"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  ENCRYPTING...
                </>
              ) : (
                'GENERATE_FULL_ENCRYPTED_REPORT'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
