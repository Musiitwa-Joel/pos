import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Database, Bell, Monitor, Terminal, Save, CheckCircle2, Loader2, Plus, Download, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { useHardware } from '../HardwareContext';
import { Role } from '../types';
import Select from './Select';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

type SettingsSection = 'GENERAL' | 'ROLES' | 'SECURITY' | 'DATABASE' | 'ADVANCED';

export default function SettingsView() {
  const {
    settings, updateSetting, roles, addRole, updateRole, deleteRole, isOffline,
    backupDatabase, testNotifications, getSystemTelemetry,
    initializeSettingsDB, initializeUserDB
  } = useHardware();
  const [activeSection, setActiveSection] = useState<SettingsSection>('GENERAL');
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [telemetry, setTelemetry] = useState<any>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const MODULES = [
    { id: 'dashboard', label: 'INTELLIGENCE (DASHBOARD)' },
    { id: 'pos', label: 'TERMINAL (POS)' },
    { id: 'inventory', label: 'INVENTORY' },
    { id: 'credit', label: 'CUSTOMER_CREDIT' },
    { id: 'hr', label: 'HUMAN_RESOURCES' },
    { id: 'sales', label: 'AUDIT_LOGS' },
    { id: 'reports', label: 'FINANCIAL_ANALYTICS' },
    { id: 'suppliers', label: 'SUPPLIERS' },
    { id: 'expenses', label: 'EXPENSES' },
    { id: 'returns', label: 'RETURNS_HUB' },
    { id: 'settings', label: 'SYSTEM_SETTINGS' }
  ];

  useEffect(() => {
    if (settings) {
      setLocalSettings(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  useEffect(() => {
    if (activeSection === 'ADVANCED') {
      const fetchTele = async () => {
        const data = await getSystemTelemetry();
        setTelemetry(data);
      };
      fetchTele();
      const interval = setInterval(fetchTele, 10000);
      return () => clearInterval(interval);
    }
  }, [activeSection, getSystemTelemetry]);

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Only update what changed
      const updates = Object.entries(localSettings).filter(([key, val]) => settings[key] !== val);
      for (const [key, val] of updates) {
        await updateSetting(key, val);
      }
      toast.success('System Configuration Committed Successfully');
    } catch (err) {
      toast.error('Failed to commit system changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await backupDatabase();
      if (result.success) {
        toast.success(`SYSTEM_BACKUP_SUCCESS: ${result.filename} (${result.size.toFixed(2)} KB)`);

        // Automated Handshake: Trigger browser download
        const downloadUrl = `${window.location.origin.replace(':3000', ':9000')}/backups/${result.filename}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', result.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('DATABASE_BACKUP_CRITICAL_FAILURE');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleTestMail = async () => {
    if (!localSettings.CONTACT_EMAIL) return toast.error('Please configure CONTACT_EMAIL first');
    setIsTestingMail(true);
    try {
      await testNotifications(localSettings.CONTACT_EMAIL);
    } catch (err) {
      // toast handled in context
    } finally {
      setIsTestingMail(false);
    }
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display text-[var(--text-main)] tracking-tight">System Configuration</h2>
          <p className="text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-1">TRED_OS_V1.1.0 // CORE_SETTINGS</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isOffline}
          className={cn(
            "btn-industrial bg-brand-accent text-brand-dark flex items-center justify-center gap-2 hover:bg-brand-accent/90 min-w-[140px]",
            (isSaving || isOffline) && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed"
          )}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isOffline ? 'OFFLINE_LOCKED' : (isSaving ? 'COMMITTING...' : 'COMMIT_CHANGES')}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Navigation */}
        <div className="col-span-3 space-y-1">
          <SettingsNavItem
            icon={<SettingsIcon size={14} />}
            label="GENERAL"
            active={activeSection === 'GENERAL'}
            onClick={() => setActiveSection('GENERAL')}
          />
          <SettingsNavItem
            icon={<Shield size={14} />}
            label="ROLES"
            active={activeSection === 'ROLES'}
            onClick={() => setActiveSection('ROLES')}
          />
          <SettingsNavItem
            icon={<Shield size={14} />}
            label="SECURITY"
            active={activeSection === 'SECURITY'}
            onClick={() => setActiveSection('SECURITY')}
          />
          <SettingsNavItem
            icon={<Database size={14} />}
            label="DATABASE"
            active={activeSection === 'DATABASE'}
            onClick={() => setActiveSection('DATABASE')}
          />
          <SettingsNavItem
            icon={<Terminal size={14} />}
            label="ADVANCED"
            active={activeSection === 'ADVANCED'}
            onClick={() => setActiveSection('ADVANCED')}
          />
        </div>

        {/* Content */}
        <div className="col-span-9 industrial-panel overflow-y-auto p-8 space-y-10">
          {activeSection === 'GENERAL' && (
            <section className="space-y-8">
              <h3 className="text-[10px] font-display text-brand-accent border-b border-brand-accent/20 pb-2">COMPANY_PROFILE</h3>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-display text-slate-800 dark:text-slate-400 block">COMPANY_NAME</label>
                  <input
                    type="text"
                    className="terminal-input w-full py-2 px-3 text-[10px]"
                    placeholder="E.G. GLOBAL HARDWARE INDUSTRIES"
                    value={localSettings.COMPANY_NAME || ''}
                    onChange={e => handleChange('COMPANY_NAME', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-display text-slate-800 dark:text-slate-400 block">PHYSICAL_LOCATION</label>
                <textarea
                  className="terminal-input w-full py-2 px-3 text-[10px] h-20"
                  placeholder="ENTER FULL BUSINESS ADDRESS..."
                  value={localSettings.LOCATION || ''}
                  onChange={e => handleChange('LOCATION', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-display text-slate-800 dark:text-slate-400 block">CONTACT_EMAIL</label>
                  <input
                    type="email"
                    className="terminal-input w-full py-2 px-3 text-[10px]"
                    placeholder="ADMIN@INSTITUTION.COM"
                    value={localSettings.CONTACT_EMAIL || ''}
                    onChange={e => handleChange('CONTACT_EMAIL', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-display text-slate-800 dark:text-slate-400 block">SUPPORT_PHONE</label>
                  <input
                    type="tel"
                    className="terminal-input w-full py-2 px-3 text-[10px]"
                    placeholder="+256..."
                    value={localSettings.SUPPORT_PHONE || ''}
                    onChange={e => handleChange('SUPPORT_PHONE', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Select
                  label="CURRENCY_SYMBOL"
                  options={[
                    { label: 'UGX (UGANDAN SHILLING)', value: 'UGX' },
                    { label: 'USD (US DOLLAR)', value: 'USD' },
                    { label: 'KES (KENYAN SHILLING)', value: 'KES' }
                  ]}
                  value={localSettings.CURRENCY || 'UGX'}
                  onChange={val => handleChange('CURRENCY', val)}
                />
              </div>
            </section>
          )}

          {activeSection === 'ROLES' && (
            <section className="space-y-6">
              <h3 className="text-[10px] font-display text-brand-accent border-b border-brand-accent/20 pb-2">STAFF_ROLE_MANAGEMENT</h3>

              <div className={cn("grid gap-6 transition-all duration-300", editingRole ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 mt-4")}>
                {!editingRole && (
                  <div className="p-4 bg-[var(--panel-bg)]/50 border border-brand-steel space-y-4">
                    <h4 className="text-[9px] font-display text-slate-800 dark:text-slate-400">ADD_NEW_ROLE</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="ROLE_NAME (E.G. SALES_MANAGER)"
                        className="terminal-input w-full py-2 px-3 text-[10px]"
                        value={newRoleName}
                        onChange={e => setNewRoleName(e.target.value)}
                      />
                      <textarea
                        placeholder="ROLE_DESCRIPTION..."
                        className="terminal-input w-full py-2 px-3 text-[10px] h-20"
                        value={newRoleDesc}
                        onChange={e => setNewRoleDesc(e.target.value)}
                      />
                      <button
                        onClick={async () => {
                          if (!newRoleName) return toast.error('Role name is required');
                          setIsSubmittingRole(true);
                          try {
                            await addRole({ name: newRoleName, description: newRoleDesc });
                            setNewRoleName('');
                            setNewRoleDesc('');
                          } finally {
                            setIsSubmittingRole(false);
                          }
                        }}
                        disabled={isSubmittingRole || isOffline}
                        className={cn(
                          "btn-industrial btn-primary w-full py-2 text-[9px] flex items-center justify-center gap-2",
                          (isSubmittingRole || isOffline) && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed"
                        )}
                      >
                        {isSubmittingRole ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        {isOffline ? 'SYNC_PAUSED' : (isSubmittingRole ? 'REGISTERING...' : 'REGISTER_ROLE')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="industrial-panel bg-[var(--panel-bg)]/30 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h4 className="text-[9px] font-display text-slate-800 dark:text-slate-400 uppercase">Registered Roles</h4>
                    {editingRole && (
                      <button
                        onClick={() => setEditingRole(null)}
                        className="text-[9px] font-display text-brand-accent hover:underline flex items-center gap-2"
                      >
                         <LayoutGrid size={12} />
                         EXIT_CONSOLE
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {!editingRole ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-[10px] text-left">
                          <thead className="text-[8px] text-slate-900 dark:text-slate-500 font-display border-b border-white/5">
                            <tr>
                              <th className="px-4 py-2">ROLE</th>
                              <th className="px-4 py-2">DESC</th>
                              <th className="px-4 py-2 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roles.map(role => (
                              <tr key={role.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-medium text-brand-accent">{role.name}</td>
                                <td className="px-4 py-3 text-slate-800 dark:text-slate-400 truncate max-w-[150px]">{role.description || '-'}</td>
                                <td className="px-4 py-3 text-right space-x-3">
                                  {role.name.toUpperCase() !== 'ADMIN' && role.id !== 'admin' ? (
                                    <>
                                      <button
                                        onClick={() => setEditingRole(role)}
                                        className="text-brand-accent hover:underline text-[8px] font-display"
                                      >
                                        MANAGE
                                      </button>
                                      <button
                                        onClick={() => setConfirmConfig({
                                          isOpen: true,
                                          title: "AUTHORIZE_ROLE_DELETION",
                                          message: `Are you absolutely sure you want to decommission the '${role.name}' institutional identity? This action will immediately invalidate all security mappings for users assigned to this role.`,
                                          onConfirm: () => deleteRole(role.id),
                                          confirmText: "DECOMMISSION_ROLE",
                                          type: "danger"
                                        })}
                                        className="text-danger hover:underline text-[8px] font-display"
                                      >
                                        REMOVE
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[7px] font-mono text-brand-accent/50 uppercase tracking-tighter italic">PROTECTED_SYSTEM_ROLE</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {roles.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-900 dark:text-slate-500 font-mono italic">
                                  NO_ROLES_DEFINED
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 space-y-6 overflow-y-auto max-h-[600px] scrollbar-industrial">
                        <div className="flex justify-between items-center border-b border-brand-steel/30 pb-4">
                             <h5 className="text-[10px] font-display text-brand-accent uppercase tracking-widest leading-none">
                              ROLE_IDENTITY_CONSOLE // {editingRole.name}
                            </h5>
                            <p className="text-[7px] text-slate-500 mt-1 uppercase tracking-tighter">Modify institutional role properties and security protocols.</p>
                          </div>
                          <button 
                            onClick={() => setEditingRole(null)}
                            className="text-[9px] font-display text-slate-500 hover:text-brand-accent transition-colors flex items-center gap-2 border border-brand-steel/30 px-3 py-1.5 bg-brand-accent/5 hover:border-brand-accent/50"
                          >
                            <LayoutGrid size={12} />
                            EXIT_CONSOLE
                          </button>

                        {/* Force-Sync Identity Modification Pane */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-sm">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[8px] font-display text-brand-accent uppercase mb-1.5 tracking-widest">Target_Role_Name</p>
                              <input 
                                className="w-full bg-[var(--bg-panel)] border border-brand-steel/30 p-2.5 text-[10px] uppercase font-display text-[var(--text-main)] outline-none focus:border-brand-accent transition-all ring-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"
                                value={editingRole.name || ""} 
                                onChange={(e) => setEditingRole({...editingRole, name: e.target.value.toUpperCase()})}
                              />
                            </div>
                            <div>
                              <p className="text-[8px] font-display text-brand-accent uppercase mb-1.5 tracking-widest">Access_Description</p>
                              <textarea 
                                key={`desc-${editingRole.id}`}
                                className="w-full bg-[var(--bg-panel)] border border-brand-steel/30 p-2.5 text-[10px] font-display text-[var(--text-main)] outline-none focus:border-brand-accent transition-all min-h-[80px] shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"
                                value={editingRole.description || ""} 
                                onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                              />
                            </div>
                            <button 
                              onClick={async () => {
                                try {
                                  await updateRole(editingRole.id, { 
                                    name: editingRole.name, 
                                    description: editingRole.description 
                                  });
                                  toast.success("Identity synchronisation successful.");
                                } catch (err) {
                                  toast.error("Handshake failed.");
                                }
                              }}
                              className="btn-industrial btn-primary py-3 px-6 text-[9px] w-full font-display tracking-widest"
                            >
                              SAVE_IDENTITY_MODIFICATIONS
                            </button>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[8px] font-display text-brand-accent uppercase border-b border-brand-accent/20 pb-1.5 tracking-widest">Authorization_Matrix</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-industrial">
                              {MODULES.map(module => {
                                const isAuthorized = editingRole.authorizedModules?.includes(module.id);
                                return (
                                  <button
                                    key={module.id}
                                    className={cn(
                                      "flex items-center justify-between p-3 border transition-all text-[9px] font-display h-12 uppercase",
                                      isAuthorized 
                                        ? "bg-brand-accent/10 border-brand-accent text-brand-accent shadow-[inset_0_0_15px_rgba(255,107,0,0.05)]" 
                                        : "bg-[var(--bg-panel)] border-brand-steel/30 text-slate-500 hover:border-brand-accent/50"
                                    )}
                                    onClick={async () => {
                                      const current = editingRole.authorizedModules || [];
                                      const updatedModules = isAuthorized 
                                        ? current.filter(id => id !== module.id)
                                        : [...current, module.id];
                                      
                                      await updateRole(editingRole.id, { authorizedModules: updatedModules });
                                      setEditingRole(prev => prev ? { ...prev, authorizedModules: updatedModules } : null);
                                    }}
                                  >
                                    <span className="truncate">{module.label}</span>
                                    {isAuthorized ? <CheckCircle2 size={12} className="flex-shrink-0" /> : <Shield size={10} className="opacity-10" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'SECURITY' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[10px] font-display text-brand-accent border-b border-brand-accent/20 pb-2 uppercase tracking-widest">Security_Protocols</h3>
              <div className="space-y-4">
                <div className="p-6 bg-[var(--panel-bg)]/50 border border-brand-steel rounded-sm space-y-6">
                  <div className="flex justify-between items-center group">
                    <div>
                      <p className="text-[10px] font-display text-[var(--text-main)] group-hover:text-brand-accent transition-colors">TWO_FACTOR_AUTHENTICATION</p>
                      <p className="text-[8px] text-slate-900 dark:text-slate-500 font-mono mt-1 uppercase tracking-tighter opacity-90 dark:opacity-60">Requires app verification for all administrative logins.</p>
                    </div>
                    <button
                      onClick={() => handleChange('ENABLE_2FA', localSettings.ENABLE_2FA === 'true' ? 'false' : 'true')}
                      className={cn(
                        "btn-industrial py-1 px-4 text-[8px] tracking-[0.2em] transition-all",
                        localSettings.ENABLE_2FA === 'true' ? "bg-brand-accent text-brand-dark" : "btn-outline"
                      )}
                    >
                      {localSettings.ENABLE_2FA === 'true' ? 'ENABLED_SHIELD' : 'ENABLE_PROTOCOL'}
                    </button>
                  </div>

                  <div className="border-t border-brand-steel/30 pt-6 flex justify-between items-center group">
                    <div>
                      <p className="text-[10px] font-display text-[var(--text-main)] group-hover:text-brand-accent transition-colors">SESSION_TIMEOUT</p>
                      <p className="text-[8px] text-slate-900 dark:text-slate-500 font-mono mt-1 uppercase tracking-tighter opacity-90 dark:opacity-60">Automatically logs out inactive terminals after specified interval.</p>
                    </div>
                    <Select
                      className="w-48"
                      options={[
                        { label: '5 MINUTES (STRICT)', value: '5' },
                        { label: '15 MINUTES (STANDARD)', value: '15' },
                        { label: '30 MINUTES (RELAXED)', value: '30' },
                        { label: '1 HOUR (CAUTION)', value: '60' }
                      ]}
                      value={localSettings.SESSION_TIMEOUT || '30'}
                      onChange={val => handleChange('SESSION_TIMEOUT', val)}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'DATABASE' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[10px] font-display text-brand-accent border-b border-brand-accent/20 pb-2 uppercase tracking-widest">Database_Management_Console</h3>
              <div className="space-y-4">
                <div className="p-6 bg-[var(--panel-bg)]/50 border border-brand-steel rounded-sm flex justify-between items-center group hover:border-brand-accent/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">
                      <Database size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-display text-[var(--text-main)] group-hover:text-brand-accent transition-colors">PHYSICAL_SNAPSHOT_BACKUP</p>
                      <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono mt-1 tracking-tight italic">Generates a complete SQL archive of the current operational state.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackup}
                    disabled={isBackingUp || isOffline}
                    className={cn(
                      "btn-industrial btn-primary py-2 px-6 text-[9px] flex items-center gap-2",
                      (isBackingUp || isOffline) && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    {isBackingUp ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    {isOffline ? 'SYNC_ERROR' : (isBackingUp ? 'GENERATING_SNAPSHOT...' : 'TRIGGER_BACKUP_v7')}
                  </button>
                </div>
              </div>
            </section>
          )}


          {activeSection === 'ADVANCED' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-[10px] font-display text-brand-accent border-b border-brand-accent/20 pb-2 uppercase tracking-widest italic opacity-90 dark:opacity-60">Strategic_Telemetry_Dashboard</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Uptime', value: telemetry?.uptime || '0h 0m', icon: <Monitor size={14} /> },
                  { label: 'CPU_Load', value: telemetry ? `${telemetry.cpuUsage.toFixed(1)}%` : '0%', icon: <Terminal size={14} />, color: (telemetry?.cpuUsage || 0) > 80 ? 'text-danger' : 'text-success' },
                  { label: 'RAM_Util', value: telemetry ? `${telemetry.memoryUsed.toFixed(2)}GB` : '0GB', icon: <Database size={14} />, detail: `/ ${telemetry?.memoryTotal?.toFixed(0) || 0}GB` },
                  { label: 'DB_Status', value: telemetry?.dbStatus || 'OFFLINE', icon: <Database size={14} />, color: 'text-brand-accent' },
                ].map((stat, i) => (
                  <div key={i} className="industrial-panel p-4 bg-brand-graphite/40 border-brand-steel/50 flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <div className="text-slate-900 dark:text-slate-500">{stat.icon}</div>
                    </div>
                    <div>
                      <div className={cn("text-lg font-mono font-black tracking-tighter leading-none", stat.color || "text-[var(--text-main)]")}>
                        {stat.value}
                      </div>
                      {stat.detail && <span className="text-[8px] font-mono text-slate-900 dark:text-slate-500 uppercase italic">{stat.detail}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-[var(--bg-main)] border border-brand-steel rounded-sm space-y-6">
                <h4 className="text-[9px] font-display text-brand-accent uppercase italic opacity-90 dark:opacity-60 tracking-widest">System_Maintenance_Utilities</h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setConfirmConfig({
                      isOpen: true,
                      title: "AUTHORIZE_SCHEMA_REBUILD",
                      message: "WARNING: You are about to rebuild the system settings schema. This is a low-level operation that should only be performed during institutional recovery or maintenance. Proceed with caution.",
                      onConfirm: () => initializeSettingsDB(),
                      confirmText: "REBUILD_SCHEMA",
                      type: "warning"
                    })}
                    className="btn-industrial btn-outline py-2 px-6 text-[8px] border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 transition-all font-display uppercase tracking-widest"
                  >
                    REBUILD_SETTINGS_SCHEMA
                  </button>
                  <button
                    onClick={() => setConfirmConfig({
                      isOpen: true,
                      title: "AUTHORIZE_AUTH_NODE_RESET",
                      message: "WARNING: This protocol will reset the authentication node residency. This is a high-risk operational reset. Are you absolutely certain you wish to proceed?",
                      onConfirm: () => initializeUserDB(),
                      confirmText: "RESET_AUTH_NODE",
                      type: "danger"
                    })}
                    className="btn-industrial btn-outline py-2 px-6 text-[8px] border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 transition-all font-display uppercase tracking-widest"
                  >
                    RESET_AUTH_NODE
                  </button>
                  <button
                    disabled
                    className="btn-industrial py-2 px-6 text-[8px] bg-slate-800 text-slate-900 dark:text-slate-500 border-slate-700 cursor-not-allowed font-display uppercase tracking-widest"
                  >
                    PURGE_AUDIT_LOGS_v7 (DECOMMISSIONED)
                  </button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
      
      {/* 🛡️ Institutional Confirmation Handshake Area */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />
    </div>
  );
}

function SettingsNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-display transition-all ${active
        ? 'bg-brand-accent/10 text-brand-accent border-r-2 border-brand-accent'
        : 'text-slate-900 dark:text-slate-500 hover:bg-[var(--panel-bg)] hover:text-slate-300'
        }`}>
      {icon}
      {label}
    </button>
  );
}
