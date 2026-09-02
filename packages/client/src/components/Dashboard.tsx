import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ShieldCheck, Loader2 } from 'lucide-react';
import { useHardware } from '../HardwareContext';
import { useIntelligence } from '../contexts/IntelligenceContext';
import { toast } from 'sonner';

// ⚛️ Atomic Vanguard Components
import { IntelligenceStats } from './Dashboard/IntelligenceStats';
import { IntelligenceFeed } from './Dashboard/IntelligenceFeed';
import { SecurityAuditModal } from './Dashboard/SecurityAuditModal';
import SkeletonDashboard from './SkeletonDashboard';

// 🛰️ [VANGUARD] Optimized Dashboard Shell:
// This component is now a static 'layout rack'. It does NOT re-render 
// when metrics, sales, or chart data change. Reactivity is handled 
// by the autonomous sub-components.
export default function Dashboard() {
  const {
    refreshInventory, refreshSales, refreshExpenses, refreshSuppliers,
    sales, isReady
  } = useHardware();

  const { stats$ } = useIntelligence();

  const [isInitializing, setIsInitializing] = useState(!isReady);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // 🛡️ Sync Skeleton visibility with Global Readiness
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setIsInitializing(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsInitializing(true);
    }
  }, [isReady]);

  // 🛰️ Internal Signal Audit Cache (Computed only when modal is accessed)
  const auditReport = useMemo(() => {
    const findings = [];
    // Accessing through the context directly via the sub-component is better,
    // but we'll prepare the telemetry here for the modal.
    const currentStats = stats$.get();
    const rawSales = sales || [];

    const nullVoids = rawSales.filter(s => s.total <= 0);
    if (nullVoids.length > 0) findings.push({ type: 'ERROR', msg: `${nullVoids.length} NULL_PAYLOAD_TRANSACTIONS DETECTED`, id: 'NULL_SIG' });
    if (currentStats.lowStockCount > 3) findings.push({ type: 'CRITICAL', msg: `${currentStats.lowStockCount} PRODUCT_LINES AT CRITICAL_STOCK`, id: 'STOCK_SIG' });
    if (currentStats.totalReceivables > 500000) findings.push({ type: 'WARN', msg: `CREDIT_EXP_PEAK: EXCEEDING BUFFER`, id: 'DEBT_SIG' });
    
    return findings;
  }, [isAuditOpen, sales, stats$]);

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

  if (isInitializing) return <SkeletonDashboard />;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 h-full overflow-y-auto custom-scrollbar">
      {/* 🚀 Header Horizon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display flex items-center gap-3">
            <Activity size={24} className="text-brand-accent shrink-0" />
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

      <IntelligenceStats />

      <div className="grid grid-cols-1 gap-6 pb-6">
        {/* <ProfitabilityChart /> */}
        <IntelligenceFeed />
      </div>

      <SecurityAuditModal 
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditReport={auditReport}
      />
    </div>
  );
}
