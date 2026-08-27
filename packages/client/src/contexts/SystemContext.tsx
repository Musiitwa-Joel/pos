import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apolloClient as client } from '../lib/apollo';
import { observable } from "@legendapp/state";
import {
  GET_SETTINGS,
  UPDATE_SETTING,
  INITIALIZE_SETTINGS_DB,
  GET_SYSTEM_TELEMETRY,
  BACKUP_DATABASE,
  TEST_NOTIFICATION_SETTINGS
} from '../gql/settings';
import { INITIALIZE_INVENTORY_DB, ADD_SYSTEM_LOG } from '../gql/mutations/inventory';
import { GET_AUDIT_LOGS } from '../gql/queries/inventory';
import { useIdentity } from './IdentityContext';

// 🚀 [VANGUARD] System Config Store:
// Managed via observables to ensure system-wide settings updates 
// are propagated instantly with zero-render latency.
export const systemState$ = observable({
  settings: {} as Record<string, string>,
  now: Date.now(),
});

interface SystemContextType {
  settings: Record<string, string>;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  initializeSettingsDB: () => Promise<void>;
  initializeInventoryDB: () => Promise<void>;
  fetchAuditLogs: (start?: string, end?: string) => Promise<any[]>;
  getSystemTelemetry: () => Promise<any>;
  backupDatabase: () => Promise<any>;
  testNotifications: (email: string) => Promise<void>;
  addSystemLog: (log: { action: string; target: string; oldValue?: string; newValue?: string }) => Promise<void>;
  systemState$: any;
}

import { observer } from '@legendapp/state/react';

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { withLoading } = useIdentity();

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_SETTINGS,
        fetchPolicy: 'network-only'
      });
      if (data?.settings) {
        const settingsMap: Record<string, string> = {};
        data.settings.forEach((s: { key: string, value: string }) => {
          settingsMap[s.key] = s.value;
        });
        systemState$.settings.set(settingsMap);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      await withLoading('UPDATING_SETTING', async () => {
        await client.mutate({
          mutation: UPDATE_SETTING,
          variables: { key, value }
        });
        await fetchSettings();
      }, true);
    } catch (err) {
      console.error('[updateSetting] Execution Failed:', err);
    }
  };

  const initializeSettingsDB = async () => {
    try {
      await withLoading('INITIALIZING_SETTINGS', async () => {
        await client.mutate({ mutation: INITIALIZE_SETTINGS_DB });
      }, true);
    } catch (err) {
      console.error('[initializeSettingsDB] Execution Failed:', err);
    }
  };

  const initializeInventoryDB = async () => {
    try {
      await withLoading('INITIALIZING_INVENTORY', async () => {
        await client.mutate({ mutation: INITIALIZE_INVENTORY_DB });
      }, true);
    } catch (err) {
      console.error('[initializeInventoryDB] Execution Failed:', err);
    }
  };

  const fetchAuditLogs = async (start?: string, end?: string) => {
    const { data } = await client.query({
      query: GET_AUDIT_LOGS,
      variables: { startDate: start, endDate: end },
      fetchPolicy: 'network-only'
    });
    return data?.auditLogs || [];
  };

  const getSystemTelemetry = async () => {
    const { data } = await client.query({
      query: GET_SYSTEM_TELEMETRY,
      fetchPolicy: 'network-only'
    });
    return data?.systemTelemetry;
  };

  const backupDatabase = async () => {
    const { data } = await client.mutate({
      mutation: BACKUP_DATABASE
    });
    return data?.backupDatabase;
  };

  const testNotifications = async (email: string) => {
    try {
      await withLoading('TESTING_NOTIFICATIONS', async () => {
        await client.mutate({
          mutation: TEST_NOTIFICATION_SETTINGS,
          variables: { email }
        });
      }, true);
    } catch (err) {
      console.error('[testNotifications] Execution Failed:', err);
    }
  };

  const addSystemLog = async (log: { action: string; target: string; oldValue?: string; newValue?: string }) => {
    try {
      await client.mutate({
        mutation: ADD_SYSTEM_LOG,
        variables: { ...log }
      });
    } catch (err) {
      console.error('[addSystemLog] Failed:', err);
    }
  };

  // ⏱️ [VANGUARD] Global System Pulse
  useEffect(() => {
    const ticker = setInterval(() => systemState$.now.set(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  // Dynamic Browser Title (Reactive to Legend Observable)
  useEffect(() => {
    const bizName = systemState$.settings.COMPANY_NAME.get() || 'Institutional Terminal';
    document.title = bizName.toUpperCase();
  }, [systemState$.settings.COMPANY_NAME.get()]);

  const value: SystemContextType = {
    get settings() { return systemState$.settings.get(); },
    fetchSettings,
    updateSetting,
    initializeSettingsDB,
    initializeInventoryDB,
    fetchAuditLogs,
    getSystemTelemetry,
    backupDatabase,
    testNotifications,
    addSystemLog,
    systemState$
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
});

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};
