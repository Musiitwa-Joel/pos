import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Search, Filter, Calendar, Package, ArrowRight, UserCheck, ShieldAlert, TrendingUp, History, X, Plus, Minus, Loader2, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { useHardware } from '../HardwareContext';
import { formatCurrency, cn, getLocalDateString, getLocalFirstDayOfMonthString } from '../lib/utils';
import DatePicker from './DatePicker';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import ReceiptComp from './Receipt';
import ReturnsProcessingModal from './ReturnsProcessingModal';

export default function ReturnsManagement() {
  const { fetchSaleReturns, products, loadingStatus, searchSaleByInvoice, recordReturn, isOffline } = useHardware();
  const today = getLocalDateString();
  const firstDayOfMonth = getLocalFirstDayOfMonthString();
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  const [returns, setReturns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<any | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReturnsData = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSaleReturns(startDate, endDate);
      setReturns(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReturnsData();
  }, [startDate, endDate]);

  const filteredReturns = returns.filter(r => {
    const product = products.find(p => p.id === r.productId);
    return (
      r.saleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalRefunded = filteredReturns.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const trendData = useMemo(() => {
    const days: Record<string, number> = {};
    const d = new Date(startDate);
    const end = new Date(endDate);

    // Fill days range
    while (d <= end) {
      days[d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })] = 0;
      d.setDate(d.getDate() + 1);
    }

    filteredReturns.forEach(r => {
      const day = new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (days[day] !== undefined) {
        days[day] += (Number(r.amount) || 0);
      }
    });

    const result = Object.entries(days).map(([name, value]) => ({ name, value }));
    if (result.length === 1) {
      const single = result[0];
      // Pad AreaChart for a single data point so it renders a flat filled area
      return [
        { name: 'START', value: single.value },
        single,
        { name: 'END', value: single.value }
      ];
    }
    return result;
  }, [filteredReturns, startDate, endDate]);

  return (
    <div className="h-full flex flex-col p-3 sm:p-6 gap-6 overflow-hidden bg-[var(--bg-main)]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-black dark:text-[var(--text-main)]">Returns & Refunds Hub</h1>
          <p className="text-xs text-slate-700 dark:text-slate-500 font-mono mt-1 uppercase">
            OPERATIONAL_OVERSIGHT // {returns.length}_LOGGED_RETURNS
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 group bg-brand-steel/10 p-1 sm:bg-transparent sm:p-0">
            <DatePicker value={startDate} onChange={setStartDate} label="FROM" />
            <ArrowRight size={10} className="text-slate-700 dark:text-slate-500 shrink-0" />
            <DatePicker value={endDate} onChange={setEndDate} label="TO" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsReturnModalOpen(true)}
              disabled={isOffline}
              className={cn(
                "btn-industrial btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-2 text-[9px] sm:text-[10px] flex-1 sm:flex-none",
                isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <RotateCcw size={14} className="shrink-0" />
              <span>{isOffline ? 'OFFLINE_LOCKED' : 'PROCESS_NEW_RETURN'}</span>
            </button>
            <button
              onClick={fetchReturnsData}
              disabled={isRefreshing || isOffline}
              className={cn(
                "p-2.5 sm:p-2 rounded hover:bg-brand-steel/20 transition-colors text-slate-700 dark:text-slate-500 border border-brand-steel sm:border-none shrink-0",
                isRefreshing && "animate-spin",
                isOffline && "opacity-30 cursor-not-allowed"
              )}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0">
        {/* LEFT: Stats & Chart */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          <div className="flex flex-col gap-4">
            {[
              { label: 'TOTAL_REVENUE_REFUNDED', value: formatCurrency(totalRefunded), color: 'text-orange-600', icon: RotateCcw },
              { label: 'TRANSACTION_VOLUME', value: `${filteredReturns.length} RETURNS`, color: 'text-black dark:text-slate-300', icon: History },
              { label: 'AVERAGE_RETURN_VALUE', value: formatCurrency(totalRefunded / (filteredReturns.length || 1)), color: 'text-black dark:text-slate-300', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="industrial-panel p-4 bg-brand-dark/20 flex flex-col gap-1 border-brand-steel/30 relative overflow-hidden group">
                <div className="flex justify-between items-start z-10 relative">
                  <span className="text-[8px] sm:text-[9px] font-display text-slate-900 dark:text-slate-500 tracking-[0.2em]">{stat.label}</span>
                  <stat.icon size={14} className="text-brand-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className={`text-xl sm:text-2xl font-display font-bold ${stat.color} z-10 relative truncate tracking-tighter`}>{stat.value}</div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-24 sm:h-24 bg-brand-accent/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-all" />
              </div>
            ))}
          </div>

          <div className="industrial-panel p-5 flex flex-col gap-4 border-brand-accent/10">
            <h3 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={12} className="text-brand-accent" /> Temporal_Refund_Metrics
            </h3>
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="h-[200px] min-w-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} stroke="#64748b" style={{ fontFamily: 'Michroma' }} />
                    <YAxis fontSize={8} axisLine={false} tickLine={false} stroke="#64748b" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} style={{ fontFamily: 'Michroma' }} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: '9px', fontFamily: 'Michroma', color: '#f8fafc' }}
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#returnGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Detailed Logs Table */}
        <div className="col-span-1 lg:col-span-8 flex flex-col min-h-[500px] lg:min-h-0 overflow-hidden">
          <div className="flex-1 industrial-panel flex flex-col overflow-hidden border-orange-500/10">
            <div className="industrial-panel-header px-4 py-3 border-b border-brand-steel flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--bg-inset)] gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="SEARCH_BY_INVOICE_OR_PRODUCT..."
                  className="terminal-input w-full pl-10 py-1.5 text-[10px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/5 border border-orange-500/20 rounded whitespace-nowrap">
                <ShieldAlert size={12} className="text-orange-500" />
                <span className="text-[9px] font-display text-orange-500 uppercase">Authorized_Only_Records</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <div className="min-w-[800px]">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-[120px]">TIMESTAMP</th>
                      <th className="w-[100px]">INVOICE_REF</th>
                      <th>PRODUCT_PARTICULARS</th>
                      <th className="text-center w-[60px]">QTY</th>
                      <th className="w-[100px]">REASON</th>
                      <th className="text-right w-[100px]">REFUNDED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.map((ret) => {
                      const product = products.find(p => p.id === ret.productId);
                      const stamp = new Date(ret.createdAt);
                      return (
                        <tr key={ret.id} className="group">
                          <td>
                            <div className="flex flex-col">
                              <span className="text-xs text-[var(--text-main)] opacity-80">{stamp.toLocaleDateString()}</span>
                              <span className="text-[9px] text-slate-900 dark:text-slate-500 font-mono">{stamp.toLocaleTimeString()}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-[10px] font-mono text-brand-accent uppercase">{ret.saleId.slice(0, 8)}...</span>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[var(--text-main)]">{product?.name || 'Unknown Product'}</span>
                              <div className="flex items-center gap-1 text-[9px] text-slate-900 dark:text-slate-500 font-mono uppercase">
                                <Package size={10} /> STOCK_ADJUSTED
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="text-xs font-mono font-bold">x{ret.quantity}</span>
                          </td>
                          <td>
                            <span className="text-[9px] font-display bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest whitespace-nowrap">
                              {ret.reason}
                            </span>
                          </td>
                          <td className="text-right font-mono font-bold text-orange-500">
                            {formatCurrency(ret.amount)}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredReturns.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-20 opacity-30">
                          <RotateCcw size={48} className="mx-auto mb-4" />
                          <p className="text-[10px] uppercase tracking-widest">No matching return records found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Processing Overlay & Modal */}
      {isReturnModalOpen && (
        <ReturnsProcessingModal
          initialSale={selectedSaleForReturn}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedSaleForReturn(null);
          }}
          onSuccess={fetchReturnsData}
        />
      )}
    </div>
  );
}
