import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Database, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  Terminal,
  Activity,
  Server,
  Lock,
  Globe,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_REGISTRY_SETTINGS, UPDATE_REGISTRY_SETTING, FORCE_REGISTRY_SYNC } from '../../gql/registry';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface SettingRowProps {
  label: string;
  configKey: string;
  initialValue: string;
  description: string;
  type?: 'text' | 'password';
  onSave: (val: string) => Promise<void>;
}

function SettingField({ label, configKey, initialValue, description, type = 'text', onSave }: SettingRowProps) {
  const [value, setValue] = useState(initialValue);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = value !== initialValue;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(value);
      toast.success(`${configKey} sync complete.`);
    } catch (err) {
      toast.error(`Failed to sync ${configKey}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group bg-[var(--bg-panel)] border border-[var(--border-main)] hover:border-brand-accent/30 transition-all p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-brand-accent font-bold uppercase tracking-widest">{label}</span>
            {isDirty && <span className="text-[8px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded animate-pulse">MODIFIED_UNSAVED</span>}
          </div>
          <h4 className="text-sm font-display font-black text-[var(--text-main)] uppercase tracking-tight">{configKey}</h4>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider leading-relaxed max-w-2xl">{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <input 
              type={type === 'password' && !showPassword ? 'password' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="terminal-input w-full py-2.5 px-4 pr-10 bg-[var(--bg-inset)] border-[var(--border-main)] text-[11px] font-mono text-[var(--text-main)]"
            />
            {type === 'password' && (
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-brand-accent transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-sm text-[10px] font-display uppercase tracking-widest transition-all",
              isDirty 
                ? "bg-brand-accent text-white shadow-lg hover:bg-brand-accent/90" 
                : "bg-[var(--bg-inset)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-main)]"
            )}
          >
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            {isSaving ? 'SYNCING...' : 'COMMIT_DATA'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InfrastructureHub() {
  const { data, loading, refetch } = useQuery(GET_REGISTRY_SETTINGS);
  const [updateSetting] = useMutation(UPDATE_REGISTRY_SETTING);
  const [forceSync] = useMutation(FORCE_REGISTRY_SYNC);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const settings = data?.getRegistrySettings || [];
  
  const getVal = (key: string) => settings.find((s: any) => s.key === key)?.value || '';

  const handleGlobalSave = async (key: string, value: string) => {
    await updateSetting({ variables: { key, value } });
    refetch();
  };

  const handleFullRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceSync();
      await refetch();
      toast.success("Physical .env recreated & In-memory cache refreshed.");
    } catch (err) {
      toast.error("Force sync failed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="h-full overflow-y-auto p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[var(--bg-main)]">
      {/* CEO Governance Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 border-b border-[var(--border-main)] pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Lock className="text-brand-accent" size={24} />
            <h2 className="text-[10px] font-display text-brand-accent uppercase tracking-[0.4em] font-black">Architecture Governance</h2>
          </div>
          <h1 className="text-4xl font-display text-[var(--text-main)] uppercase tracking-tighter font-black flex items-center gap-4">
            System Infrastructure Hub
          </h1>
          <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} className="text-green-500" />
            VANGUARD_CORE_NODE // OPERATIONAL_STABLE
          </p>
        </div>

        <button 
          onClick={handleFullRefresh}
          className={cn(
            "flex items-center gap-3 px-8 py-3 bg-[var(--bg-panel)] border border-[var(--border-main)] text-[10px] font-display text-[var(--text-main)] uppercase tracking-widest hover:border-brand-accent transition-all group",
            isRefreshing && "opacity-50 pointer-events-none"
          )}
        >
          <RefreshCw size={14} className={cn("text-brand-accent transition-transform duration-500", isRefreshing && "animate-spin")} />
          Hard Refresh In-Memory Cache
        </button>
      </div>

      {/* Security Alert Matrix */}
      <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-sm flex items-start gap-5">
        <div className="p-3 bg-amber-500/10 rounded-full shrink-0">
          <ShieldAlert className="text-amber-500" size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-[11px] font-display font-black text-amber-500 uppercase tracking-widest">Master Identity Warning</h4>
          <p className="text-[10px] text-amber-500/80 uppercase font-medium leading-relaxed max-w-4xl">
            Modifying architectural settings will force an immediate synchronization to the physical <span className="font-mono bg-amber-500/20 px-1">.env</span> file on the host terminal. 
            Ensure credentials are correct to prevent service termination or mail delivery failure across all institutional branches.
          </p>
        </div>
      </div>

      {/* Configuration Matrix */}
      <div className="grid grid-cols-1 gap-6">
        {/* Authentication Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Key size={16} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-display text-[var(--text-muted)] uppercase tracking-[0.3em] font-black">Identity Protocol Logic</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <SettingField 
              label="Master Security Core"
              configKey="PRIVATE_KEY"
              initialValue={getVal('PRIVATE_KEY') || 'tredpos_standard_node@2025'}
              description="THE PRIMARY ENCRYPTION SEED USED FOR JWT SESSION GENERATION AND CROSS-CLIENT AUTHENTICATION. CHANGING THIS WILL LOG OUT ALL ACTIVE USERS."
              type="password"
              onSave={(v) => handleGlobalSave('PRIVATE_KEY', v)}
            />
            <SettingField 
              label="Federated Auth Node"
              configKey="GOOGLE_CLIENT_ID"
              initialValue={getVal('GOOGLE_CLIENT_ID')}
              description="THE OAUTH 2.0 CLIENT IDENTIFIER FOR GOOGLE GLOBAL IDENTITY DISCOVERY. REQUIRED FOR MASTER STAFF SINGLE SIGN-ON."
              onSave={(v) => handleGlobalSave('GOOGLE_CLIENT_ID', v)}
            />
          </div>
        </div>

        {/* Communication Infrastructure */}
        <div className="space-y-4 pt-8">
          <div className="flex items-center gap-3 px-2">
            <Mail size={16} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-display text-[var(--text-muted)] uppercase tracking-[0.3em] font-black">Notification Transport Hub</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <SettingField 
              label="SMTP Carrier Account"
              configKey="SMTP_USER"
              initialValue={getVal('SMTP_USER')}
              description="THE EMAIL ADDRESS USED BY THE SYSTEM MAIL DISPATCHER TO SEND BILLING REMINDERS, RECEIPYS, AND SECURITY ALERTS."
              onSave={(v) => handleGlobalSave('SMTP_USER', v)}
            />
             <SettingField 
              label="Carrier Authentication"
              configKey="SMTP_PASS"
              initialValue={getVal('SMTP_PASS')}
              description="THE APP-SPECIFIC PASSWORD FOR THE SMTP CARRIER ACCOUNT. THIS KEY IS USED TO ESTABLISH A SECURE HANDSHAKE WITH THE MAIL SERVER."
              type="password"
              onSave={(v) => handleGlobalSave('SMTP_PASS', v)}
            />
             <SettingField 
              label="Global Identity Sender"
              configKey="FROM_EMAIL"
              initialValue={getVal('FROM_EMAIL')}
              description="THE PUBLIC-FACING EMAIL ADDRESS THAT APPEARS IN THE 'FROM' FIELD OF ALL INSTITUTIONAL SYSTEM CORRESPONDENCE."
              onSave={(v) => handleGlobalSave('FROM_EMAIL', v)}
            />
             <SettingField 
              label="SMTP Carrier Host"
              configKey="SMTP_HOST"
              initialValue={getVal('SMTP_HOST') || 'smtp.gmail.com'}
              description="THE OUTGOING MAIL SERVER ADDRESS (E.G. SMTP.GMAIL.COM). REQUIRED FOR SYSTEM NOTIFICATIONS."
              onSave={(v) => handleGlobalSave('SMTP_HOST', v)}
            />
             <SettingField 
              label="Identity Port"
              configKey="SMTP_PORT"
              initialValue={getVal('SMTP_PORT') || '465'}
              description="THE SECURITY PORT USED BY THE CARRIER (USUALS: 465 FOR SSL, 587 FOR TLS). 465 IS RECOMMENDED FOR SECURE SMTP."
              onSave={(v) => handleGlobalSave('SMTP_PORT', v)}
            />
          </div>
        </div>

        {/* Database Architecture */}
        <div className="space-y-4 pt-8 pb-12">
          <div className="flex items-center gap-3 px-2">
            <Database size={16} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-display text-[var(--text-muted)] uppercase tracking-[0.3em] font-black">Storage Logic Configuration</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <SettingField 
              label="Primary Host Node"
              configKey="DB_HOST"
              initialValue={getVal('DB_HOST') || '127.0.0.1'}
              description="THE PHYSICAL IP ADDRESS OR HOSTNAME OF THE MYSQL ARCHITECTURE. DO NOT CHANGE UNLESS MIGRATING HARDWARE."
              onSave={(v) => handleGlobalSave('DB_HOST', v)}
            />
             <SettingField 
              label="Master Node Account"
              configKey="DB_USER"
              initialValue={getVal('DB_USER') || 'root'}
              description="THE ADMINISTRATIVE ACCOUNT PERMITTED TO ACCESS THE REGISTRY AND INSTITUTIONAL SUB-CLUSTER DATABASES."
              onSave={(v) => handleGlobalSave('DB_USER', v)}
            />
             <SettingField 
              label="Nucleus Password"
              configKey="DB_PASSWORD"
              initialValue={getVal('DB_PASSWORD') || ''}
              description="THE MASTER PASSWORD FOR THE ROOT DATABASE SERVICE. CRITICAL: MISYNCING THIS KEY WILL TERMINATE THE ENTIRE PLATFORM CONNECTIVITY."
              type="password"
              onSave={(v) => handleGlobalSave('DB_PASSWORD', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
