import React, { createContext, useContext, useCallback } from 'react';
import { apolloClient as client } from '../lib/apollo';
import { observable } from "@legendapp/state";
import { Employee, AttendanceRecord, Role } from '../types';
import { GET_EMPLOYEES, GET_ATTENDANCE } from '../gql/queries/hr';
import {
  ADD_EMPLOYEE,
  UPDATE_EMPLOYEE,
  RECORD_ATTENDANCE,
  INITIALIZE_HR_DB
} from '../gql/mutations/hr';
import { GET_ROLES, ADD_ROLE, UPDATE_ROLE, DELETE_ROLE } from '../gql/settings';
import { INITIALIZE_USER_DB } from '../gql/mutations/auth';
import { INITIALIZE_LOGS_DB } from '../gql/mutations/logs';
import { useIdentity } from './IdentityContext';

// 🚀 [VANGUARD] HR & Staff Store:
// Legend observables handle institutional personnel data with zero re-render overhead.
export const hrState$ = observable({
  employees: [] as Employee[],
  attendance: [] as AttendanceRecord[],
  roles: [] as Role[],
  empLoading: false,
});

interface HRContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  roles: Role[];
  empLoading: boolean;
  fetchEmployees: (silent?: boolean) => Promise<void>;
  fetchAttendance: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'joinedDate'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  addRole: (role: { name: string; description?: string; authorizedModules?: string[] }) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'date' | 'checkIn'>) => Promise<void>;
  initializeHR: () => Promise<void>;
  initializeUserDB: () => Promise<void>;
  initializeLogsDB: () => Promise<void>;
  hrState$: any;
}

import { observer } from '@legendapp/state/react';

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { withLoading } = useIdentity();

  const fetchEmployees = useCallback(async () => {
    try {
      hrState$.empLoading.set(true);
      const { data } = await client.query({
        query: GET_EMPLOYEES,
        fetchPolicy: 'network-only'
      });
      if (data?.employees) hrState$.employees.set(data.employees);
    } catch (err) {
      console.error('Fetch employees error:', err);
    } finally {
      hrState$.empLoading.set(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_ATTENDANCE,
        fetchPolicy: 'network-only'
      });
      if (data?.attendance) hrState$.attendance.set(data.attendance);
    } catch (err) {
      console.error('Fetch attendance error:', err);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_ROLES,
        fetchPolicy: 'network-only'
      });
      if (data?.roles) hrState$.roles.set(data.roles);
    } catch (err) {
      console.error('Fetch roles error:', err);
    }
  }, []);

  const addEmployee = async (employee: Omit<Employee, 'id' | 'joinedDate'>) => {
    try {
      await withLoading('PROVISIONING_STAFF', async () => {
        await client.mutate({
          mutation: ADD_EMPLOYEE,
          variables: { ...employee }
        });
        await fetchEmployees();
      }, true);
    } catch (err) {
      console.error('[addEmployee] Execution Failed:', err);
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await withLoading('UPDATING_STAFF_IDENTITY', async () => {
        await client.mutate({
          mutation: UPDATE_EMPLOYEE,
          variables: { id, ...updates }
        });
        await fetchEmployees();
      }, true);
    } catch (err) {
      console.error('[updateEmployee] Execution Failed:', err);
    }
  };

  const addRole = async (role: { name: string; description?: string; authorizedModules?: string[] }) => {
    try {
      await withLoading('DEFINING_ROLE', async () => {
        await client.mutate({
          mutation: ADD_ROLE,
          variables: { ...role }
        });
        await fetchRoles();
      }, true);
    } catch (err) {
      console.error('[addRole] Execution Failed:', err);
    }
  };

  const updateRole = async (id: string, updates: Partial<Role>) => {
    try {
      await withLoading('UPDATING_ROLE', async () => {
        await client.mutate({
          mutation: UPDATE_ROLE,
          variables: { id, ...updates }
        });
        await fetchRoles();
      }, true);
    } catch (err) {
      console.error('[updateRole] Execution Failed:', err);
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await withLoading('DELETING_ROLE', async () => {
        await client.mutate({
          mutation: DELETE_ROLE,
          variables: { id }
        });
        await fetchRoles();
      }, true);
    } catch (err) {
      console.error('[deleteRole] Execution Failed:', err);
    }
  };

  const recordAttendance = async (record: Omit<AttendanceRecord, 'id' | 'date' | 'checkIn'>) => {
    try {
      await withLoading('RECORDING_ATTENDANCE', async () => {
        await client.mutate({
          mutation: RECORD_ATTENDANCE,
          variables: { ...record }
        });
        await fetchAttendance();
      }, true);
    } catch (err) {
      console.error('[recordAttendance] Execution Failed:', err);
    }
  };

  const initializeHR = async () => {
    try {
      await withLoading('INITIALIZING_HR', async () => {
        await client.mutate({ mutation: INITIALIZE_HR_DB });
      }, true);
    } catch (err) {
      console.error('[initializeHR] Execution Failed:', err);
    }
  };

  const initializeUserDB = async () => {
    try {
      await withLoading('INITIALIZING_USERS', async () => {
        await client.mutate({ mutation: INITIALIZE_USER_DB });
      }, true);
    } catch (err) {
      console.error('[initializeUserDB] Execution Failed:', err);
    }
  };

  const initializeLogsDB = async () => {
    try {
      await withLoading('INITIALIZING_LOGS', async () => {
        await client.mutate({ mutation: INITIALIZE_LOGS_DB });
      }, true);
    } catch (err) {
      console.error('[initializeLogsDB] Execution Failed:', err);
    }
  };

  const value: HRContextType = {
    get employees() { return hrState$.employees.get(); },
    get attendance() { return hrState$.attendance.get(); },
    get roles() { return hrState$.roles.get(); },
    get empLoading() { return hrState$.empLoading.get(); },
    fetchEmployees,
    fetchAttendance,
    fetchRoles,
    addEmployee,
    updateEmployee,
    addRole,
    updateRole,
    deleteRole,
    recordAttendance,
    initializeHR,
    initializeUserDB,
    initializeLogsDB,
    hrState$
  };

  return (
    <HRContext.Provider value={value}>
      {children}
    </HRContext.Provider>
  );
});

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) throw new Error('useHR must be used within HRProvider');
  return context;
};
