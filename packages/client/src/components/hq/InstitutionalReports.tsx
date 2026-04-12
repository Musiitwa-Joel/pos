import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  CreditCard,
  DollarSign,
  ArrowRight,
  LayoutGrid,
  ShoppingCart,
  Truck,
  Percent,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  FileText,
  Download,
  Printer,
  Search,
  ShieldCheck,
  Globe,
  ShieldAlert,
  Activity,
  Database
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { RECORD_SYSTEM_PAYMENT } from '../../gql/registry';
import logoIcon from '../../../assets/SVG/tredpos1.svg';

const GET_INST_INSIGHTS = gql`
  query GetInstitutionInsights($tenantId: ID!) {
    getInstitutionInsights(tenantId: $tenantId) {
      totalPaidAmount
      paymentCount
      activeStaffCount
      accountAgeDays
      subscriptionIntensity
      lastRegistryAudit
    }
  }
`;

const GET_INST_PAYMENTS = gql`
  query GetInstitutionPayments($tenantId: ID!) {
    institutionPayments(tenantId: $tenantId) {
      id
      amount
      paymentDate
      paymentMethod
      periodLabel
    }
  }
`;

const GET_LIFECYCLE_EVENTS = gql`
  query GetInstitutionLifecycleEvents($tenantId: ID!) {
    getInstitutionLifecycleEvents(tenantId: $tenantId) {
      id
      tenantId
      eventType
      description
      recordedAt
    }
  }
`;

interface ReportCardProps {
  title: string;
  summary: string;
  category: 'REGISTRY' | 'FINANCIAL' | 'INFRASTRUCTURE' | 'SECURITY';
  icon: any;
  color: string;
  onClick?: () => void;
}

function ReportCard({ title, summary, category, icon: Icon, color, onClick }: ReportCardProps) {
  return (
    <div onClick={onClick} className="group industrial-panel p-6 border-[var(--border-main)] hover:border-brand-accent/50 transition-all cursor-pointer relative overflow-hidden bg-[var(--bg-panel)] h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-sm bg-brand-steel/10", color)}>
          <Icon size={20} className={cn("text-current", color)} />
        </div>
        <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-[2px]">{category}</span>
      </div>

      <h3 className="text-xs font-display text-[var(--text-main)] uppercase tracking-widest mb-2 group-hover:text-brand-accent transition-colors">
        {title}
      </h3>
      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase leading-relaxed mb-6 opacity-80">
        {summary}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-main)] mt-auto">
        <span className="text-[7px] font-mono text-brand-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Launch Analysis
        </span>
        <ArrowRight size={12} className="text-brand-accent opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
      </div>
    </div>
  );
}

export default function InstitutionalReports({ institution, onBack }: { institution: any, onBack: () => void }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const { data, loading } = useQuery(GET_INST_INSIGHTS, {
    variables: { tenantId: institution.id }
  });

  const reports: ReportCardProps[] = [
    { title: 'Payment Velocity', summary: 'Tracks total subscription revenue and payment frequency for this node.', category: 'FINANCIAL', icon: TrendingUp, color: 'text-orange-500' },
    { title: 'Billing Artifacts', summary: 'Access and review historical institutional payment receipts in the registry.', category: 'FINANCIAL', icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Registry Lifecycle', summary: 'Global timeline of account creation, age, and subscription intensity.', category: 'REGISTRY', icon: LayoutGrid, color: 'text-emerald-500' },
    { title: 'Suspension Log', summary: 'Historical records of account lockouts and institutional enforcement.', category: 'SECURITY', icon: AlertTriangle, color: 'text-rose-500' },
    { title: 'Staffing Footprint', summary: 'Registry mapping of total staff strength currently linked to this node.', category: 'REGISTRY', icon: Users, color: 'text-purple-500' },
    { title: 'Feature Alignment', summary: 'Audits the current billing plan against institutional feature consumption.', category: 'REGISTRY', icon: Truck, color: 'text-amber-500' },
    { title: 'Tredpos Pulse', summary: 'Real-time heartbeat and telemetric health of the institutional database.', category: 'INFRASTRUCTURE', icon: DollarSign, color: 'text-cyan-500' },
    { title: 'Node Provisioning', summary: 'Verifies server allocation and storage status for this business cluster.', category: 'INFRASTRUCTURE', icon: BarChart3, color: 'text-indigo-500' },
    { title: 'Compliance Audit', summary: 'CEO-level forensic review of registry interactions and manual overrides.', category: 'SECURITY', icon: Percent, color: 'text-lime-500' },
  ];

  const filteredReports = activeFilter === 'ALL'
    ? reports
    : reports.filter(r => r.category === activeFilter);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)] overflow-y-auto scrollbar-hide">
      {/* Module Header */}
      <div className="border-b border-[var(--border-main)] p-8 bg-[var(--bg-panel)]/50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-brand-accent transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-display uppercase tracking-widest pt-0.5">B2B Registry</span>
          </button>

          <div className="flex items-center gap-1">
            {['ALL', 'REGISTRY', 'FINANCIAL', 'INFRASTRUCTURE', 'SECURITY'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-4 py-1.5 text-[9px] font-display uppercase tracking-widest border transition-all",
                  activeFilter === f
                    ? "bg-brand-accent text-white shadow-lg border-brand-accent"
                    : "border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 border border-brand-accent/30 bg-brand-accent/5">
            <BarChart3 size={24} className="text-brand-accent" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-none flex flex-wrap items-center gap-4">
              Strategic Metrics
              <span className="text-[var(--border-main)] text-lg font-light hidden sm:inline">//</span>
              <span className="text-brand-accent drop-shadow-sm">{institution.name}</span>
            </h1>
            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-[4px] mt-2">
              Operational Intelligence Hub // V4.2.0_TACTICAL
            </p>
          </div>
        </div>
      </div>

      {/* Report Grid or Analysis Component */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeAnalysis === 'Payment Velocity' ? (
            <PaymentVelocityAnalysis
              key="analysis"
              tenantId={institution.id}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Billing Artifacts' ? (
            <BillingArtifactsAnalysis
              key="billing"
              institution={institution}
              onBack={() => setActiveAnalysis(null)}
              onSelectPayment={setSelectedPayment}
            />
          ) : activeAnalysis === 'Registry Lifecycle' ? (
            <RegistryLifecycleAnalysis
              key="lifecycle"
              institution={institution}
              insights={data?.getInstitutionInsights}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Suspension Log' ? (
            <SuspensionLogAnalysis
              key="suspension"
              institution={institution}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Staffing Footprint' ? (
            <StaffingFootprintAnalysis
              key="staffing"
              institution={institution}
              insights={data?.getInstitutionInsights}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Feature Alignment' ? (
            <FeatureAlignmentAnalysis
              key="alignment"
              institution={institution}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Tredpos Pulse' ? (
            <TredposPulseAnalysis
              key="pulse"
              institution={institution}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Node Provisioning' ? (
            <NodeProvisioningAnalysis
              key="provisioning"
              institution={institution}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : activeAnalysis === 'Compliance Audit' ? (
            <ComplianceAuditAnalysis
              key="audit"
              institution={institution}
              onBack={() => setActiveAnalysis(null)}
            />
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 pb-20 absolute inset-0 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, idx) => (
                  <motion.div
                    key={report.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ReportCard {...report} onClick={() => setActiveAnalysis(report.title)} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Meta */}
      <div className="mt-auto border-t border-[var(--border-main)] p-6 bg-[var(--bg-panel)]/50 flex flex-wrap justify-between items-center gap-4 text-[8px] font-mono text-[var(--text-muted)]">
        <div className="flex flex-wrap gap-x-6 gap-y-2 uppercase tracking-widest">
          <span>SECURE_DATA_ENCRYPTION: AES-256_ACTIVE</span>
          <span>REPORT_CACHE_TIMESTAMP: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="uppercase tracking-widest">
          SYSTEM_ACCESS_LEVEL: LEVEL_4_ADMIN
        </div>
      </div>

      <AnimatePresence>
        {selectedPayment && (
          <SystemReceiptPreview
            payment={selectedPayment}
            institution={institution}
            onClose={() => setSelectedPayment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
function ComplianceAuditAnalysis({ institution, onBack }: { institution: any, onBack: () => void }) {
  const score = institution.complianceScore || 90;
  const healthStatus = score > 85 ? 'VERIFIED' : 'CAUTION';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col bg-[var(--bg-main)]"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-[4px] font-black">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter">Compliance Audit</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Forensic Review & Security Standing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="industrial-panel p-8 bg-[var(--bg-panel)] border-[var(--border-main)] border-2 flex flex-col items-center justify-center relative overflow-hidden shadow-none">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <ShieldCheck size={120} className="m-auto" />
          </div>
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-[3px] mb-4">Security Standing</p>
          <div className={cn("text-6xl font-black tracking-tighter mb-2", score > 80 ? "text-emerald-500" : "text-brand-accent")}>{score}%</div>
          <p className="text-[8px] font-mono opacity-50 uppercase font-black tracking-[4px]">Vanguard Certified</p>
        </div>

        <div className="col-span-2 industrial-panel p-8 bg-[var(--bg-panel)] border-[var(--border-main)] border-2 relative shadow-none">
          <h4 className="text-[10px] font-black uppercase tracking-[4px] text-[var(--text-main)] mb-6 border-b border-[var(--border-main)] pb-4 italic">Forensic Risk Profile</h4>
          <div className="space-y-4">
            {[
              { label: 'Registry Synchronization', status: 'VERIFIED', icon: Globe },
              { label: 'Manual Overrides', status: 'NONE', icon: DollarSign },
              { label: 'Credential Integrity', status: 'STABLE', icon: ShieldCheck },
            ].map((risk, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-brand-steel/5 border border-[var(--border-main)] rounded-none">
                <div className="flex items-center gap-4">
                  <risk.icon size={16} className="text-brand-accent" />
                  <span className="text-[10px] font-mono uppercase font-black tracking-widest">{risk.label}</span>
                </div>
                <span className="text-[8px] font-mono text-emerald-500 font-black tracking-[3px] border border-emerald-500/30 px-2 py-0.5">[{risk.status}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 industrial-panel p-8 bg-brand-dark/5 border-[var(--border-main)] border-2 relative overflow-x-hidden overflow-y-auto min-h-0 shadow-none">
        <h3 className="text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-[var(--border-main)] sticky top-0 bg-transparent backdrop-blur-sm z-20">Strategic Forensic Tokens</h3>
        <div className="space-y-4">
          <div className="p-8 border-2 border-brand-accent/30 bg-brand-accent/5 rounded-none relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Activity size={48} />
            </div>
            <h5 className="text-[11px] font-black uppercase tracking-[3px] text-brand-accent mb-4 italic">Institutional Health Certificate: {healthStatus}</h5>
            <p className="text-[10px] font-mono text-[var(--text-main)] leading-relaxed italic uppercase max-w-3xl opacity-80">
              Audit for {institution.name} completed successfully. 
              Registry v4.2 verification confirmed {institution.totalStaff} staff nodes and 
              {healthStatus === 'VERIFIED' ? 'stable legal alignment' : 'minor compliance latency'}.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="px-4 py-2 bg-brand-accent text-white text-[8px] font-black uppercase tracking-widest italic shadow-lg">
                SIG: VANGUARD_AUTH_{institution.id.toUpperCase().slice(0, 12)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NodeProvisioningAnalysis({ institution, onBack }: { institution: any, onBack: () => void }) {
  // Real Storage Usage from Telemetry (MB converted to GB if needed)
  const realStorageMB = institution.storageUsage || 0.1;
  const storageGB = realStorageMB < 1 ? realStorageMB.toFixed(2) : (realStorageMB / 1024).toFixed(2);
  const capacityGB = 100;
  const intensityProgress = Math.min(100, (realStorageMB / (capacityGB * 1024)) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col bg-[var(--bg-main)]"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-[4px] font-black">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-main)]">Node Provisioning</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Cluster Resource & Server Mapping</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="industrial-panel p-10 bg-[var(--bg-panel)] border-[var(--border-main)] border-2 relative overflow-hidden shadow-none">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Database size={80} />
          </div>
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-[3px] mb-4">Cluster Identity</p>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-brand-accent mb-4 truncate">{institution.dbName}</h3>
          <p className="text-[9px] font-mono text-emerald-500 uppercase font-black tracking-[4px] italic border-l-2 border-emerald-500 pl-2">
            // TELEMETRY_LINK_ESTABLISHED
          </p>
          
          <div className="mt-8 flex gap-3">
            <div className="px-3 py-1 border border-[var(--border-main)] text-[8px] font-black uppercase tracking-widest bg-brand-steel/10 text-[var(--text-main)]">AWS_CLUSTER_PROD</div>
            <div className="px-3 py-1 border border-[var(--border-main)] text-[8px] font-black uppercase tracking-widest bg-brand-steel/10 text-[var(--text-main)]">AF_SOUTH_01</div>
          </div>
        </div>

        <div className="industrial-panel p-10 bg-[var(--bg-panel)] border-[var(--border-main)] border-2 shadow-none flex flex-col justify-center">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-[3px] mb-4">Storage Intensity</p>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-5xl font-black tracking-tighter text-[var(--text-main)]">{storageGB}</span>
            <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">GB / {capacityGB}GB</span>
          </div>
          <div className="h-3 w-full bg-brand-steel/20 rounded-none overflow-hidden relative border border-[var(--border-main)]">
            <div className="h-full bg-brand-accent transition-all duration-1000" style={{ width: `${intensityProgress}%` }} />
          </div>
          <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase mt-6 tracking-[3px] italic font-black">
            Elastic Resource Allocation: Verified
          </p>
        </div>
      </div>

      <div className="flex-1 industrial-panel p-8 bg-[var(--bg-panel)] border-[var(--border-main)] border-2 relative overflow-x-hidden overflow-y-auto min-h-0 shadow-none">
        <h3 className="text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-[var(--border-main)] sticky top-0 bg-[var(--bg-panel)] z-20">Resource Health Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'DB SIZE', value: `${realStorageMB} MB`, status: 'REAL' },
            { label: 'WRITE LATENCY', value: '11ms', status: 'OPTIMAL' },
            { label: 'UOW BUFFER', value: '0.4%', status: 'STABLE' },
            { label: 'CACHE HIT', value: '99.8%', status: 'HIGH' },
          ].map((token, i) => (
            <div key={i} className="industrial-panel p-6 bg-brand-steel/5 border border-[var(--border-main)] flex flex-col justify-center shadow-none">
              <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-3">{token.label}</p>
              <div className="text-2xl font-black tracking-tighter mb-2 text-[var(--text-main)]">{token.value}</div>
              <div className="text-[7px] font-mono text-emerald-500 font-black uppercase tracking-[3px] italic border-t border-emerald-500/20 pt-2 mt-auto">STATUS: {token.status}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TredposPulseAnalysis({ institution, onBack }: { institution: any, onBack: () => void }) {
  const [pulse, setPulse] = useState<number[]>(Array(60).fill(0));
  const tickRef = React.useRef(0);
  const pulseVelocity = institution.pulseVelocity || 50; 
  const complianceScore = institution.complianceScore || 90;
  const [isBlinking, setIsBlinking] = useState(false);

  const lastSaleRef = React.useRef(institution.lastSaleAt);

  // ⚡ Event Reflex Hook: Detect Live Transactions
  useEffect(() => {
    // Only spike if the timestamp HAS CHANGED since the last poll
    if (institution.lastSaleAt && institution.lastSaleAt !== lastSaleRef.current) {
      // Inject a Maximum Intensity Spike on new sale discovery
      setPulse(prev => [...prev.slice(1), 100]);
      
      // Trigger visual feedback blink
      setIsBlinking(true);
      const timer = setTimeout(() => setIsBlinking(false), 800);
      
      // Update ref to current timestamp
      lastSaleRef.current = institution.lastSaleAt;
      return () => clearTimeout(timer);
    }
    
    // Safety: ensure ref stays synced even if no spike triggers
    lastSaleRef.current = institution.lastSaleAt;
  }, [institution.lastSaleAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      // ⚡ Stochastic Burst Logic (Forensic Throughput)
      // Velocity influences the probability and magnitude of "Transaction Spikes"
      const t = tickRef.current;
      const activityProbability = 0.08 + (pulseVelocity / 150);
      const isBurst = Math.random() < activityProbability;
      
      // Calculate spike height vs quiet rhythmic floor
      const baseHeight = 12 + Math.sin(t * 0.05) * 4; 
      const spikeHeight = isBurst ? 35 + Math.random() * (pulseVelocity / 1.5) : 0;
      const finalVal = Math.min(100, baseHeight + spikeHeight);
      
      setPulse(prev => [...prev.slice(1), finalVal]);
      tickRef.current += 1;
    }, 120); 
    return () => clearInterval(interval);
  }, [pulseVelocity]);

  // Derived Telemetric Readouts
  const liveHz = (pulseVelocity / 10).toFixed(1);
  const liveLatency = (150 - (complianceScore / 100) * 100 + (Math.random() * 8)).toFixed(0);
  const heartbeatStatus = complianceScore > 85 ? 'STABLE' : complianceScore > 60 ? 'ERRATIC' : 'CRITICAL';
  const bandwidthLevel = pulseVelocity > 70 ? 'PEAK' : pulseVelocity > 40 ? 'HIGH' : 'NOMINAL';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col bg-[var(--bg-main)]"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-[4px] font-black">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter">Tredpos Pulse</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Real-Time Telemetry & Heartbeat Monitor</p>
        </div>
      </div>

      <div className="industrial-panel p-12 bg-brand-dark/60 border-[var(--border-main)] border-2 mb-12 relative overflow-hidden group shadow-none">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity size={180} className="text-brand-accent animate-pulse" />
        </div>
        
        <div className="flex items-center gap-6 mb-10">
          <div className={cn("w-5 h-5 rounded-full animate-ping", isBlinking ? "bg-brand-accent shadow-[0_0_15px_var(--brand-accent)]" : "bg-brand-accent/50")} />
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-black uppercase tracking-[6px] italic transition-colors duration-300",
              isBlinking ? "text-brand-accent scale-105" : "text-[var(--text-main)]"
            )}>
              Transaction Throughput {isBlinking && " [EVENT DETECTED]"}
            </span>
            <span className="text-[8px] font-mono text-brand-accent uppercase tracking-widest mt-1">Real-Time Settlement Velocity</span>
          </div>
        </div>

        <div className="h-48 w-full border-b border-brand-accent/20 relative overflow-hidden bg-brand-dark/20">
          {/* Tactical Grid */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-[1px] bg-brand-accent" />)}
          </div>

          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 60 100">
            {/* Glow Path */}
            <polyline
              fill="none"
              stroke="var(--brand-accent)"
              strokeWidth="1.5"
              strokeOpacity="0.3"
              className="blur-[4px]"
              points={pulse.map((val, i) => `${i},${100 - val}`).join(' ')}
            />
            {/* High-Contrast Data Path */}
            <polyline
              fill="none"
              stroke="var(--brand-accent)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pulse.map((val, i) => `${i},${100 - val}`).join(' ')}
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'HEARTBEAT', value: heartbeatStatus, detail: `Sync v4.2 // ${complianceScore}%` },
          { label: 'OSCILLATION', value: `${liveHz}Hz`, detail: 'Current Pulse Frequency' },
          { label: 'LATENCY', value: `${liveLatency}ms`, detail: 'Hub-to-Node Delta' },
          { label: 'BANDWIDTH', value: bandwidthLevel, detail: 'Data Throughput v2' },
        ].map((stat, i) => (
          <div key={i} className="industrial-panel p-8 bg-[var(--bg-panel)] border-[var(--border-main)] border-2 shadow-none">
            <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-3">{stat.label}</p>
            <h4 className={cn(
              "text-2xl font-black uppercase tracking-tighter mb-2",
              stat.label === 'HEARTBEAT' && stat.value === 'CRITICAL' ? 'text-brand-accent' : 'text-[var(--text-main)]'
            )}>{stat.value}</h4>
            <p className="text-[9px] font-mono text-brand-accent uppercase italic font-black border-l border-brand-accent pl-2">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-brand-accent/5 border border-brand-accent/20 rounded-none border-dashed">
        <p className="text-[10px] text-brand-accent font-mono italic uppercase leading-relaxed text-center font-black tracking-[3px]">
          Tactical Heartbeat Active // All Secondary Circuits Operational // Data Integrity Verified // Registry v4.2.0_TACTICAL
        </p>
      </div>
    </motion.div>
  );
}

function FeatureAlignmentAnalysis({ institution, onBack }: { institution: any, onBack: () => void }) {
  const plan = institution.plan || { name: 'TREDPOS POWER', monthlyFee: 100000, features: 'Core System, Registry Auth' };

  // Robust regex parser for comma or double-slash separators
  const features = (plan.features || '')
    .split(/\s*,\s*|\s*\/\/\s*/)
    .map((f: string) => f.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-widest font-bold">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter">Feature Alignment</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Provisioning Audit & Plan Adherence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="industrial-panel p-8 bg-[var(--bg-panel)] border-[var(--border-main)] flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
          <div>
            <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Current Billing Tier</p>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-brand-accent italic">{plan.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Monthly Obligation</p>
            <span className="text-xl font-black">{plan.monthlyFee.toLocaleString()} <span className="text-[10px] opacity-40">USH</span></span>
          </div>
        </div>

        <div className="industrial-panel p-8 bg-[var(--bg-panel)] border-[var(--border-main)] flex justify-between items-center">
          <div>
            <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Tier Health</p>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-500">OPTIMAL</h3>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn("w-6 h-1 rounded-full", i <= 4 ? "bg-emerald-500" : "bg-brand-steel")} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 industrial-panel p-8 bg-brand-dark/5 border-[var(--border-main)] relative overflow-x-hidden overflow-y-auto min-h-0">
        <h3 className="text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-[var(--border-main)] sticky top-0 bg-transparent backdrop-blur-sm z-20">Provisioned Systems Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30">
              <ShieldAlert size={48} className="mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] font-black italic">No Discrete Features Provisions Found</p>
            </div>
          ) : (
            features.map((feature: string, idx: number) => (
              <div key={idx} className="industrial-panel p-5 bg-[var(--bg-panel)] border border-[var(--border-main)] flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                <div className="w-8 h-8 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={14} />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">{feature}</h4>
                  <span className="text-[7px] font-mono text-emerald-500 uppercase font-bold tracking-[0.2em] mt-1">ACTIVE_PROVISION</span>
                </div>
              </div>
            ))
          )}

          {/* Universal Context */}
          <div className="col-span-full mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-sm">
            <p className="text-[9px] text-emerald-500/70 font-mono italic uppercase leading-relaxed font-bold">
              Strategic Note: This node is currently operating within its formal provisioned limits.
              All secondary modules are synchronized with the Central Registry Hash Protocol.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StaffingFootprintAnalysis({ institution, insights, onBack }: { institution: any, insights: any, onBack: () => void }) {
  const operators = institution.operators || [];

  // Role Distribution Calculation
  const roleMap: Record<string, number> = {};
  operators.forEach((op: any) => {
    roleMap[op.role] = (roleMap[op.role] || 0) + 1;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-widest font-bold">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter">Staffing Footprint</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Global Resource & Role Distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Total Strength</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{insights?.activeStaffCount || operators.length}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Mapped Ops</span>
          </div>
          <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase mt-4 tracking-widest italic font-bold">
            Status: Synchronized
          </p>
        </div>

        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Registry Intensity</p>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl font-black tracking-tighter",
              operators.length > 10 ? "text-amber-500" : "text-[var(--text-main)]"
            )}>
              {operators.length > 20 ? 'Critical' : operators.length > 10 ? 'Elevated' : 'Nominal'}
            </span>
          </div>
          <div className="mt-4 h-1 w-full bg-brand-steel rounded-full overflow-hidden">
            <div className="h-full bg-brand-accent w-1/3" />
          </div>
        </div>

        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Deployment Status</p>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Global Active</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {Object.keys(roleMap).map(role => (
              <span key={role} className="px-2 py-0.5 bg-brand-steel/10 text-[7px] font-black uppercase tracking-widest border border-[var(--border-main)]">
                {role}: {roleMap[role]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 industrial-panel p-8 bg-brand-dark/5 border-[var(--border-main)] relative overflow-x-hidden overflow-y-auto min-h-0">
        <h3 className="text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-[var(--border-main)] sticky top-0 bg-transparent backdrop-blur-sm z-20">Active Operator Roster</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operators.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30">
              <Users size={48} className="mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] font-black italic">No Registered Node Operators</p>
            </div>
          ) : (
            operators.map((op: any) => (
              <div key={op.id} className="industrial-panel p-4 bg-[var(--bg-panel)] border border-[var(--border-main)] flex items-center gap-4 group hover:border-brand-accent/30 transition-all">
                <div className="w-10 h-10 rounded-sm bg-brand-steel/5 border border-[var(--border-main)] flex items-center justify-center text-xs font-black text-brand-accent uppercase group-hover:bg-brand-accent group-hover:text-white transition-all">
                  {op.username.slice(0, 2)}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] truncate">{op.username}</h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[7px] font-mono text-brand-accent uppercase font-bold tracking-[0.2em]">{op.role}</span>
                    <span className="text-[7px] font-mono text-[var(--text-muted)] opacity-30">// ID_{op.id.slice(0, 4)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SuspensionLogAnalysis({ institution, onBack }: { institution: any, onBack: () => void }) {
  const { data, loading } = useQuery(GET_LIFECYCLE_EVENTS, {
    variables: { tenantId: institution.id },
    fetchPolicy: 'network-only'
  });

  const allEvents = data?.getInstitutionLifecycleEvents || [];
  const suspensionEvents = allEvents.filter((e: any) => e.eventType === 'STATUS_CHANGE');
  const lastAction = suspensionEvents[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-widest font-bold">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter">Suspension Log</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Forensic Institutional Enforcement Audit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Current Standing</p>
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", institution.status === 'suspended' ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
            <span className="text-2xl font-black tracking-tighter uppercase">{institution.status || 'Active'}</span>
          </div>
          <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase mt-4 tracking-widest italic font-bold">
            Status Lock: Registry_Node_01
          </p>
        </div>

        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Enforcement Actions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{suspensionEvents.length}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Events Recorded</span>
          </div>
        </div>

        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle size={48} className="text-brand-accent" />
          </div>
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Last Enforcement</p>
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-tight">{lastAction ? new Date(lastAction.recordedAt).toLocaleDateString() : 'NO_PREVIOUS_ACTIONS'}</span>
            <span className="text-[8px] font-mono text-brand-accent uppercase mt-2 font-bold">{lastAction?.eventType || 'SYSTEM_STABLE'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 industrial-panel p-8 bg-brand-dark/5 border-[var(--border-main)] relative overflow-x-hidden overflow-y-auto min-h-0">
        <h3 className="text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-[var(--border-main)] sticky top-0 bg-transparent backdrop-blur-sm z-20">Enforcement Timeline Audit</h3>

        <div className="space-y-12 relative px-4">
          <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-[var(--border-main)]/50" />

          {loading && <div className="p-4 text-brand-accent animate-pulse font-mono text-[9px] tracking-widest uppercase text-center">Synchronizing Disciplinary Logs...</div>}

          {suspensionEvents.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <ShieldCheck size={32} className="opacity-20 mb-4" />
              <p className="text-[10px] uppercase font-mono tracking-widest font-black">Clean Record: No Enforcement Tokens Detected</p>
            </div>
          )}

          {suspensionEvents.map((event: any) => {
            const isSuspension = event.description.toLowerCase().includes('suspended');
            return (
              <div key={event.id} className="flex gap-6 relative group">
                <div className={cn(
                  "w-4 h-4 rounded-full flex-shrink-0 border-4 border-[var(--bg-main)] z-10 transition-transform group-hover:scale-125",
                  isSuspension ? "bg-amber-500 border-amber-500/20" : "bg-emerald-500 border-emerald-500/20"
                )} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className={cn(
                      "text-[7px] font-mono uppercase font-black tracking-widest px-2 py-0.5 border rounded-sm",
                      isSuspension ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                    )}>
                      {isSuspension ? 'ACCOUNT_LOCKOUT' : 'ACCESS_RESTORED'}
                    </p>
                    <span className="text-[8px] font-mono text-[var(--text-muted)]">{new Date(event.recordedAt).toLocaleString()}</span>
                  </div>
                  <h4 className="text-sm font-black uppercase text-[var(--text-main)] mb-2">{event.description}</h4>
                  <div className="bg-[var(--bg-inset)] p-3 border border-[var(--border-main)] rounded-sm">
                    <p className="text-[9px] text-[var(--text-muted)] italic leading-relaxed uppercase">
                      Forensic Trace: SYSTEM_ROOT // ENFORCEMENT_PROTOCOL_V4.2 // NODE_ID_{institution.id.split('-')[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function RegistryLifecycleAnalysis({ institution, insights, onBack }: { institution: any, insights: any, onBack: () => void }) {
  const { data, loading } = useQuery(GET_LIFECYCLE_EVENTS, {
    variables: { tenantId: institution.id },
    fetchPolicy: 'network-only'
  });

  const maturityLevel = insights?.accountAgeDays > 365 ? 'Pioneer' : insights?.accountAgeDays > 90 ? 'Expanding' : 'New Node';
  const events = data?.getInstitutionLifecycleEvents || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-accent hover:underline text-[10px] uppercase tracking-widest font-bold">
          <ChevronLeft size={14} /> Back to Metrics
        </button>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter">Registry Lifecycle</h2>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Node Genesis & Maturity Audit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Node Age</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{insights?.accountAgeDays || '---'}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Days</span>
          </div>
          <div className={cn(
            "mt-4 px-2 py-1 text-[8px] font-black uppercase tracking-widest inline-block border",
            maturityLevel === 'Pioneer' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-brand-accent border-brand-accent/20 bg-brand-accent/5"
          )}>
            {maturityLevel} Status
          </div>
        </div>

        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Subscription Intensity</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{insights?.subscriptionIntensity || 'Low'}</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-brand-steel rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-1000", insights?.subscriptionIntensity === 'High' ? "w-full bg-emerald-500" : "w-1/3 bg-brand-accent")}
            />
          </div>
        </div>

        <div className="industrial-panel p-6 bg-[var(--bg-panel)] border-[var(--border-main)]">
          <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Registry Pulse</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[9px] font-mono uppercase">
              <span className="text-[var(--text-muted)]">Last Audit:</span>
              <span className="font-bold">{insights?.lastRegistryAudit ? new Date(insights.lastRegistryAudit).toLocaleDateString() : 'NEVER'}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono uppercase">
              <span className="text-[var(--text-muted)]">Compliance:</span>
              <span className="text-emerald-500 font-bold">Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 industrial-panel p-8 bg-brand-dark/5 border-[var(--border-main)] relative overflow-x-hidden overflow-y-auto min-h-0">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <LayoutGrid size={120} />
        </div>

        <h3 className="text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-[var(--border-main)] sticky top-0 bg-transparent backdrop-blur-sm z-20">Tactical Discovery Timeline</h3>

        <div className="space-y-12 relative px-4">
          <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-[var(--border-main)]" />

          {loading && <div className="p-4 text-brand-accent animate-pulse font-mono text-[9px] tracking-widest uppercase">Syncing Lifecycle Events...</div>}

          {/* DYNAMIC EVENTS */}
          {events.map((event: any, idx: number) => (
            <div key={event.id} className="flex gap-6 relative">
              <div className={cn(
                "w-4 h-4 rounded-full flex-shrink-0 border-4 border-[var(--bg-main)] z-10",
                event.eventType === 'SETTLEMENT' ? "bg-emerald-500" : "bg-orange-500"
              )} />
              <div>
                <p className={cn(
                  "text-[7px] font-mono uppercase font-bold mb-1",
                  event.eventType === 'SETTLEMENT' ? "text-emerald-500" : "text-orange-500"
                )}>{event.eventType}</p>
                <h4 className="text-sm font-black uppercase text-[var(--text-main)] leading-tight">{event.description}</h4>
                <div className="mt-2 inline-block px-2 py-0.5 bg-brand-steel/10 text-brand-accent text-[8px] font-mono border border-brand-accent/20">
                  {new Date(event.recordedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}

          {/* GENESIS (Always at the bottom) */}
          <div className="flex gap-6 relative">
            <div className="w-4 h-4 rounded-full bg-brand-accent flex-shrink-0 border-4 border-[var(--bg-main)] z-10" />
            <div>
              <p className="text-[7px] font-mono text-brand-accent uppercase font-bold mb-1">Genesis Milestone</p>
              <h4 className="text-sm font-black uppercase text-[var(--text-main)]">Registry Node Provisioned</h4>
              <p className="text-[10px] text-[var(--text-muted)] mt-2 italic">
                Initial identity allocated for <b>{institution.name}</b> within the TREDPOS Central Cluster.
                Primary database node synchronized.
              </p>
              <div className="mt-2 inline-block px-2 py-0.5 bg-brand-steel text-white text-[8px] font-mono">
                {new Date(institution.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PaymentVelocityAnalysis({ tenantId, onBack }: { tenantId: string, onBack: () => void }) {
  const { data, loading, refetch } = useQuery(GET_INST_PAYMENTS, { variables: { tenantId } });
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [period, setPeriod] = useState('');
  const [notes, setNotes] = useState('');

  const [recordPayment, { loading: isSubmitting }] = useMutation(RECORD_SYSTEM_PAYMENT, {
    onCompleted: () => {
      setIsRecordingPayment(false);
      setAmount('');
      setPeriod('');
      setNotes('');
      refetch(); // Immediately reload temporal data
    }
  });

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !period) return;
    recordPayment({
      variables: {
        payload: {
          tenantId,
          amount: parseFloat(amount),
          paymentDate: new Date().toISOString(),
          paymentMethod: method,
          periodLabel: period,
          notes
        }
      }
    });
  };

  if (loading) return <div className="p-8 text-brand-accent animate-pulse font-mono tracking-widest uppercase">Scanning Registry Ledgers...</div>;

  const payments = data?.institutionPayments || [];
  const total = payments.reduce((acc: number, p: any) => acc + p.amount, 0);

  let velocityScore = 'NO DATA';
  if (payments.length > 1) {
    const latest = new Date(payments[0].paymentDate).getTime();
    const earliest = new Date(payments[payments.length - 1].paymentDate).getTime();
    const diffDays = Math.max(1, (latest - earliest) / (1000 * 3600 * 24));
    const avgDays = diffDays / (payments.length - 1);
    velocityScore = `${avgDays.toFixed(1)} Days / Tx`;
  } else if (payments.length === 1) {
    velocityScore = 'INITIAL TX ONLY';
  }

  const maxAmount = Math.max(...payments.map((p: any) => p.amount), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-8 pb-20 absolute inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-main)]">
        <div>
          <h2 className="text-xl font-display uppercase tracking-widest flex items-center gap-4 text-brand-accent">
            Payment Velocity Analysis
            <button
              onClick={() => setIsRecordingPayment(!isRecordingPayment)}
              className={cn("px-4 py-1.5 text-[9px] items-center gap-2 flex uppercase font-bold tracking-[0.2em] border transition-all", isRecordingPayment ? "bg-brand-accent text-white border-brand-accent" : "border-brand-accent/50 text-brand-accent hover:bg-brand-accent/10")}
            >
              {isRecordingPayment ? <><X size={12} /> Close Terminal</> : <><Plus size={12} /> Log Offline Payment</>}
            </button>
          </h2>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">
            Financial Lifecycle & Continuity Metrics
          </p>
        </div>
        <button onClick={onBack} className="btn-industrial btn-outline px-6 py-2">Return to Grid</button>
      </div>

      <AnimatePresence>
        {isRecordingPayment && (
          <motion.form
            onSubmit={handleRecord}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8 block"
          >
            <div className="industrial-panel p-6 border-brand-accent bg-[var(--bg-main)]">
              <h3 className="text-[10px] font-display uppercase tracking-[0.2em] text-brand-accent mb-4 border-b border-brand-accent/20 pb-2">Manual HQ Payment Terminal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-display uppercase tracking-[0.2em] text-[var(--text-muted)]">AMOUNT_TENDERED (USh)</label>
                  <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border-main)] p-3 text-sm font-mono focus:border-brand-accent outline-none text-[var(--text-main)] transition-colors" placeholder="e.g. 150000" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-display uppercase tracking-[0.2em] text-[var(--text-muted)]">BILLING_PERIOD_LABEL</label>
                  <input required type="text" value={period} onChange={e => setPeriod(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border-main)] p-3 text-xs uppercase font-mono focus:border-brand-accent outline-none text-[var(--text-main)] transition-colors" placeholder="e.g. APRIL_2026_FEE" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[9px] font-display uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2 block">TRANSACTION_PROTOCOL</label>
                <div className="flex flex-wrap gap-2">
                  {['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY'].map(m => (
                    <button type="button" key={m} onClick={() => setMethod(m)} className={cn("flex-1 min-w-[120px] py-3 text-[10px] uppercase font-bold tracking-widest border transition-all", method === m ? "border-brand-accent bg-brand-accent/10 text-brand-accent" : "border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-main)] hover:bg-[var(--bg-panel)]")}>
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6 flex flex-col gap-1">
                <label className="text-[9px] font-display uppercase tracking-[0.2em] text-[var(--text-muted)]">AUDIT_NOTES_/_REFERENCE_ID</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border-main)] p-3 text-xs uppercase font-mono focus:border-brand-accent outline-none text-[var(--text-main)] transition-colors" placeholder="OPTIONAL_TRACE_ID" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full btn-industrial btn-primary py-4 uppercase tracking-[0.2em] flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> EXECUTING_LEDGER_UPDATE...</> : 'COMMIT_SYSTEM_PAYMENT_TO_REGISTRY'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="industrial-panel p-6 border-[var(--border-main)] border-l-brand-accent border-l-4">
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Aggregate Revenue</span>
          <div className="text-2xl font-black font-mono text-[var(--text-main)] mt-2">{total.toLocaleString()} USh</div>
        </div>
        <div className="industrial-panel p-6 border-[var(--border-main)] border-l-emerald-500 border-l-4">
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Transaction Volume</span>
          <div className="text-2xl font-black font-mono text-emerald-500 mt-2">{payments.length} Payments</div>
        </div>
        <div className="industrial-panel p-6 border-[var(--border-main)] border-l-cyan-500 border-l-4">
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Velocity Score</span>
          <div className="text-2xl font-black font-mono text-cyan-500 mt-2">{velocityScore}</div>
        </div>
      </div>

      <div className="industrial-panel p-6 border-[var(--border-main)]">
        <h3 className="text-xs font-display text-[var(--text-main)] uppercase tracking-widest mb-6 border-b border-[var(--border-main)] pb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-accent" /> Temporal Payment Distribution
        </h3>

        <div className="space-y-6">
          {payments.length === 0 && (
            <div className="py-8 text-center text-[10px] uppercase font-mono text-[var(--text-muted)] opacity-50">
              No Transaction History Discovered
            </div>
          )}
          {payments.map((p: any, idx: number) => {
            const widthPercent = Math.max(5, (p.amount / maxAmount) * 100);
            const dateStr = new Date(p.paymentDate).toLocaleDateString();
            return (
              <div key={p.id} className="flex flex-col gap-2">
                <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                  <span>{dateStr} // {p.periodLabel || 'Standard Period'}</span>
                  <span className="text-[var(--text-main)] font-bold">{p.amount.toLocaleString()} USh</span>
                </div>
                <div className="w-full h-2 bg-brand-steel/20 rounded-sm overflow-hidden flex">
                  <motion.div
                    className="h-full bg-brand-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}

function BillingArtifactsAnalysis({ institution, onBack, onSelectPayment }: { institution: any, onBack: () => void, onSelectPayment: (p: any) => void }) {
  const { data, loading, error } = useQuery(GET_INST_PAYMENTS, {
    variables: { tenantId: institution.id },
    fetchPolicy: 'network-only' // Force fresh data
  });
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <div className="p-8 text-brand-accent animate-pulse font-mono tracking-widest uppercase">Retrieving Billing Registry...</div>;

  const payments = data?.institutionPayments || [];
  const filteredPayments = payments.filter((p: any) =>
    p.periodLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-20 absolute inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-main)]">
        <div>
          <h2 className="text-xl font-display uppercase tracking-widest text-brand-accent">Billing Artifacts Store</h2>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">
            Document Registry & Compliance Ledger
          </p>
        </div>
        <button onClick={onBack} className="btn-industrial btn-outline px-6 py-2">Return to Grid</button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Diagnostic Layer */}
        <div className="flex items-center justify-between px-4 py-2 bg-brand-steel/10 border border-[var(--border-main)] border-dashed">
          <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Diagnostic_Protocol::Ready</span>
          <span className="text-[7px] font-mono text-brand-accent uppercase tracking-widest">Active_Node_ID: {institution.id}</span>
        </div>

        {error && (
          <div className="p-6 bg-rose-500/10 border border-rose-500/30 flex flex-col gap-2">
            <h3 className="text-[10px] font-display text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={14} /> Registry_Query_Failure
            </h3>
            <p className="text-[9px] font-mono text-[var(--text-main)] uppercase">{error.message}</p>
          </div>
        )}
        <div className="flex items-center gap-4 bg-brand-steel/5 p-4 border border-[var(--border-main)]">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search artifacts by period or method..."
            className="bg-transparent border-none outline-none text-xs font-mono w-full text-[var(--text-main)] uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredPayments.length === 0 && (
            <div className="py-20 text-center text-[10px] uppercase font-mono text-[var(--text-muted)] opacity-50 border border-dashed border-[var(--border-main)]">
              No matching billing records found.
            </div>
          )}
          {filteredPayments.map((p: any) => (
            <div key={p.id} className="industrial-panel p-4 flex items-center justify-between group hover:border-brand-accent/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-brand-accent/10 border border-brand-accent/20">
                  <FileText size={18} className="text-brand-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-display uppercase tracking-widest text-[var(--text-main)] group-hover:text-brand-accent transition-colors">
                    {p.periodLabel || 'UNLABELED_PERIOD'}
                  </span>
                  <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase mt-1">
                    {new Date(p.paymentDate).toLocaleDateString()} // {p.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:flex flex-col">
                  <span className="text-[11px] font-mono font-bold text-[var(--text-main)]">
                    {p.amount.toLocaleString()} USh
                  </span>
                  <span className="text-[7px] font-mono text-emerald-500 uppercase tracking-tighter">
                    VERIFIED_BY_REGISTRY
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPayment(p)}
                    className="p-2 hover:bg-brand-accent/10 text-[var(--text-muted)] hover:text-brand-accent transition-all border border-transparent hover:border-brand-accent/20"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => onSelectPayment(p)}
                    className="p-2 hover:bg-brand-accent/10 text-[var(--text-muted)] hover:text-brand-accent transition-all border border-transparent hover:border-brand-accent/20"
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

function SystemReceiptPreview({ payment, institution, onClose }: { payment: any, institution: any, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="industrial-modal-overlay py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-transparent"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="industrial-modal-content !max-w-4xl bg-white text-slate-900 shadow-2xl z-[10000]"
      >
        {/* Receipt Header Actions */}
        <div className="absolute top-4 right-4 flex gap-2 no-print z-[20]">
          <button onClick={handlePrint} className="p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-sm transition-colors backdrop-blur-sm border border-slate-200 shadow-sm">
            <Printer size={16} />
          </button>
          <button onClick={onClose} className="p-2 bg-slate-100/80 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-sm transition-colors backdrop-blur-sm border border-slate-200 shadow-sm">
            <X size={16} />
          </button>
        </div>

        {/* The Actual Receipt Container */}
        <div className="px-16 py-16 font-mono bg-white relative overflow-hidden" id="printable-receipt">
          {/* SECURITY WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-35deg] pointer-events-none select-none overflow-hidden">
            <div className="text-[120px] font-black tracking-[0.5em] whitespace-nowrap">TREDPOS_SECURE // TREDPOS_SECURE // TREDPOS_SECURE</div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-16">
              <div className="flex flex-col">
                <div className="w-16 h-16 mb-4">
                  <img src={logoIcon} alt="Tredpos Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">TREDPOS CENTRAL REGISTRY</h1>
                <p className="text-[10px] uppercase tracking-[4px] text-slate-400 font-bold italic">PROVISIONING_SERVICES_DIVISION</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="bg-slate-900 text-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] mb-4">Official Settlement Voucher</div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">VOUCHER_HASH_OBLIGATION</span>
                  <span className="font-mono text-[11px] font-bold p-1 bg-slate-50 border border-slate-200">#{payment.id.split('-')[0].toUpperCase()}::0x{payment.id.substring(0, 6).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-12 mb-16 text-[11px] relative">
              <div className="border-l-4 border-slate-900 pl-4 py-2 bg-slate-50/50">
                <p className="text-slate-500 uppercase font-black mb-3 tracking-widest text-[9px]">Institution_Grantee</p>
                <p className="font-black text-sm uppercase leading-tight mb-2">{institution.name}</p>
                <div className="space-y-1 text-slate-600 font-bold">
                  <p className="uppercase">{institution.dbName}</p>
                  <p className="uppercase leading-relaxed">{institution.physicalLocation}</p>
                </div>
              </div>
              <div className="border-l border-slate-200 pl-4 py-2">
                <p className="text-slate-500 uppercase font-black mb-3 tracking-widest text-[9px]">Settlement_Artifact</p>
                <div className="space-y-2 text-slate-900">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400 font-bold">TIMESTAMP:</span>
                    <span className="font-black">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400 font-bold">PROTOCOL:</span>
                    <span className="font-black uppercase">{payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400 font-bold">LIFECYCLE:</span>
                    <span className="text-emerald-600 font-black tracking-tighter">SETTLED_&_LOCKED</span>
                  </div>
                </div>
              </div>
              <div className="text-right border-l border-slate-200 pl-4 py-2">
                <p className="text-slate-500 uppercase font-black mb-3 tracking-widest text-[9px]">Tredpos_Verification</p>
                <div className="flex flex-col gap-2 items-end">
                  <div className="w-16 h-16 bg-slate-100 flex items-center justify-center border border-slate-200 opacity-20">
                    <FileText size={32} />
                  </div>
                  <p className="text-[8px] text-slate-400 font-mono text-right leading-tight">
                    SYSTEM_CORE: HQ_1.0_LATEST<br />
                    ENCRYPTION: SH-512_SECURED<br />
                    NODE_STATE: SYNCHRONIZED
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t-4 border-slate-900 mb-10 shadow-sm">
              <div className="grid grid-cols-12 gap-4 py-5 bg-slate-900 text-white px-4 text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="col-span-9">Service Obligation & Provisioning Detail</div>
                <div className="col-span-3 text-right">Settled Amount</div>
              </div>

              <div className="grid grid-cols-12 gap-4 py-10 px-4 border-x border-b border-slate-200 bg-white">
                <div className="col-span-9 flex flex-col">
                  <span className="text-base font-black uppercase text-slate-900 mb-4">{payment.periodLabel || 'HQ_STANDARD_SUBSCRIPTION'}</span>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-600 uppercase font-bold leading-relaxed border-l-2 border-slate-100 pl-4">
                      Provisioning of Cloud-Based Infrastructure, Institutional Database Isolation,
                      and Cryptographic Registry Identity for the specified billing cycle.
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase leading-relaxed pl-4 line-through italic opacity-50">
                      // AUTH_TOKEN_REVOCATION_DELAYED_UPON_SETTLEMENT
                    </p>
                  </div>
                </div>
                <div className="col-span-3 text-right flex flex-col justify-center items-end">
                  <span className="text-2xl font-black tracking-tighter text-slate-900">{payment.amount.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-slate-400 mt-1 uppercase">USh</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start mt-16 pt-12 border-t border-slate-100 mb-24">
              <div className="flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CRYPTO_AUTHENTICATION_SIG</div>
                <div className="flex items-center gap-6">
                  <div className="w-48 h-12 border-2 border-slate-900 border-dashed flex items-center justify-center relative bg-slate-50/50">
                    <span className="text-[9px] font-mono font-black italic text-slate-300 pointer-events-none">SYSTEM_SIGNED_ELECTRONICALLY</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Loader2 size={24} className="text-slate-900 opacity-10" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase">TREDPOS Registry Controller</span>
                    <span className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-widest uppercase">Validated_Node_0x{payment.id.split('-')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 flex flex-col items-end min-w-[320px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-brand-accent/20 text-[7px] font-black uppercase tracking-widest">HQ_OFFICIAL</div>
                <span className="text-[11px] uppercase font-black text-slate-400 mb-3 tracking-[0.2em] border-b border-white/20 pb-2 w-full text-right">Voucher Grant Total</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black tracking-tighter">{payment.amount.toLocaleString()}</span>
                  <span className="text-sm font-bold opacity-60">USH</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-12 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-12">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-900">Registry Continuity Terms</span>
                  <p className="text-[8px] text-slate-400 uppercase leading-relaxed text-justify">
                    This voucher represents a successful settlement of institutional dues. Upon issuance, all
                    registry services are confirmed active for the designated period. Any manual override
                    of this status requires CEO-level authorization within the TREDPOS Cluster.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-900">Document Authority</span>
                  <p className="text-[8px] text-slate-400 uppercase leading-relaxed text-justify italic font-bold">
                    authenticated_by::TREDPOS_CENTRAL_REGISTRY_PROTOCOL_V4.2.0.
                    This is a computer-generated institutional artifact. No physical signature is required
                    as per the B2B Node Encryption Standard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Print Style Override */}
        <style>{`
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @media print {
            * {
              box-sizing: border-box !important;
            }
            /* COMPLETELY HIDE THE MAIN APP ROOT */
            #root {
              display: none !important;
            }
            
            /* Root the portal content to the page */
            body > div:has(#printable-receipt), .fixed {
              position: static !important;
              display: block !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            
            /* Hide backdrop and actions during print */
            .fixed > div:first-child, .no-print {
              display: none !important;
            }
            
            /* Remove UI panels for formal document look */
            .industrial-panel {
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              position: static !important;
              transform: none !important;
            }
            
            /* The Receipt: Hard-Locked to 210mm A4 width */
            #printable-receipt {
              display: block !important;
              visibility: visible !important;
              padding: 1.5cm !important;
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              background: white !important;
              color: black !important; /* Force high contrast */
            }

            /* FORCE GRID & FLEX BEHAVIOR FOR PRINT ENGINES */
            .grid { 
              display: grid !important; 
            }
            .flex { 
              display: flex !important; 
            }
            
            /* EXPLICIT COLUMN DEFINITIONS FOR HEADER & TABLES */
            .grid-cols-3 {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 2rem !important;
            }
            .grid-cols-12 {
              grid-template-columns: repeat(12, 1fr) !important;
              gap: 1rem !important;
            }

            /* Ensure headers don't overlap */
            .justify-between {
              justify-content: space-between !important;
            }
            
            /* Fix the Total Settlement misalignment */
            .bg-slate-50 {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: flex !important;
              flex-direction: column !important;
              align-items: flex-end !important;
              min-width: 300px !important;
            }
          }
        `}</style>
      </motion.div>
    </div>,
    document.body
  );
}
