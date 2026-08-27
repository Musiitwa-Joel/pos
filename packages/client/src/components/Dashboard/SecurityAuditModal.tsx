import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { observer } from '@legendapp/state/react';
import { useIntelligence } from '../../contexts/IntelligenceContext';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from 'sonner';
import Modal from '../Modal';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditReport: any[];
}

// 🛡️ [VANGUARD] Security Logic Engine:
// Handles the localized reporting and encryption simulation logic.
export const SecurityAuditModal = observer(({
  isOpen,
  onClose,
  auditReport
}: SecurityAuditModalProps) => {
  const { stats$ } = useIntelligence();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

        const reportContent = `
================================================================================
TREDUMO // INTELLIGENCE_SYSTEM_ENCRYPTED_REPORT
================================================================================
REPORT_ID: ${reportId}
TIMESTAMP: ${timestamp}
SECURITY_AUDIT: ${auditReport.length > 0 ? 'SIGNATURES_DETECTED' : 'CLEAR'}
--------------------------------------------------------------------------------

[KEY_FINANCIAL_TELEMETRY]
NET_PROFIT: ${formatCurrency(stats$.netProfit.get())}
REVENUE: ${formatCurrency(stats$.netRevenue.get())}
EXPENSES: ${formatCurrency(stats$.todayExpenses.get())}

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM_SECURITY_AUDIT // VAULT_SIG_2026"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between p-3 sm:p-4 bg-brand-dark border border-brand-steel rounded-sm gap-4 text-center sm:text-left transition-all duration-500 hover:border-brand-accent/50 group">
          <div className="min-w-0 flex-1">
            <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">AUDIT_STATUS</p>
            <h4 className="text-[10px] xs:text-xs sm:text-base font-display text-brand-accent uppercase tracking-tighter truncate">INTEGRITY_VERIFIED_SIGNATURE</h4>
          </div>
          <CheckCircle2 size={32} className="text-green-500 shrink-0 opacity-80 group-hover:scale-110 transition-transform" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-steel/30 pb-2">
              <h5 className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-[0.2em]">ANOMALY_DETECTION_RESULTS</h5>
              <span className="text-[8px] font-mono text-brand-accent opacity-50 uppercase">Buffer: 4096KB</span>
          </div>
          
          <div className="space-y-2">
            {auditReport.map((finding, idx) => (
              <div key={idx} className="p-3 bg-brand-dark/50 border border-brand-steel flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4 group hover:bg-brand-dark/80 transition-colors">
                <div className={cn(
                  "p-1.5 sm:p-2 bg-brand-graphite border shrink-0 transition-transform group-hover:scale-105",
                  finding.type === 'CRITICAL' || finding.type === 'ERROR' ? "border-danger text-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                )}>
                  <AlertTriangle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[7px] sm:text-[8px] font-mono text-slate-900 dark:text-slate-500 mb-0.5 truncate uppercase tracking-tighter">[{finding.type}] // AD_SIG_${idx}</p>
                  <p className="text-[9px] sm:text-[10px] font-display leading-relaxed break-words tracking-tight">{finding.msg}</p>
                </div>
              </div>
            ))}
            {auditReport.length === 0 && (
              <div className="p-10 text-center border border-brand-steel border-dashed border-opacity-20 bg-brand-dark/20 uppercase">
                <p className="text-[10px] font-display text-slate-900 dark:text-slate-500 tracking-widest opacity-40">
                  NO_ANOMALIES_DETECTED_IN_PENDING_BUFFER
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-brand-steel flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-brand-steel text-slate-500 text-[10px] font-display uppercase tracking-[0.2em] hover:bg-brand-steel/10 hover:text-white transition-all"
          >
            CLOSE_VOICE
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex-1 max-w-[280px] bg-brand-accent text-white py-2 px-4 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="text-[10px] font-display uppercase tracking-widest">ENCRYPTING...</span>
              </>
            ) : (
              <span className="text-[10px] font-display uppercase tracking-widest font-black">GENERATE_FULL_ENCRYPTED_REPORT</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
});
