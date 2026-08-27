import React, { createContext, useContext, useCallback } from 'react';
import { apolloClient as client } from '../lib/apollo';
import { observable } from "@legendapp/state";
import { Customer, Expense } from '../types';
import { GET_CUSTOMERS, GET_CUSTOMER_PAYMENTS, GET_ALL_CUSTOMER_PAYMENTS, GET_DAILY_DEBT_RECOVERED, GET_EXPENSES } from '../gql/queries/inventory';
import {
  ADD_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  RECORD_PAYMENT,
  DELETE_CUSTOMER_PAYMENT,
  ADD_EXPENSE,
  UPDATE_EXPENSE,
  DELETE_EXPENSE
} from '../gql/mutations/inventory';
import { useIdentity } from './IdentityContext';

// 🚀 [VANGUARD] Finance & Ledger Store:
// Using observables to manage heavy-duty list operations for customers 
// and expenses without React's typical diffing lag.
export const financeState$ = observable({
  customers: [] as Customer[],
  expenses: [] as Expense[],
  customerPayments: [] as any[],
});

interface FinanceContextType {
  customers: Customer[];
  expenses: Expense[];
  customerPayments: any[];
  fetchCustomers: (silent?: boolean) => Promise<void>;
  fetchExpenses: (startDate?: string, endDate?: string, search?: string) => Promise<void>;
  refreshAllCustomerPayments: (startDate?: string, endDate?: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  recordPayment: (customerId: string, amount: number, paymentMethod: string, reference?: string, notes?: string, shiftId?: string) => Promise<void>;
  deleteCustomerPayment: (id: string) => Promise<void>;
  addExpense: (expense: { category: string, amount: number, description?: string, date?: string }) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getCustomerPayments: (customerId: string) => Promise<any[]>;
  getDailyDebtRecovered: () => Promise<number>;
  financeState$: any;
}

import { observer } from '@legendapp/state/react';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { withLoading } = useIdentity();

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_CUSTOMERS,
        fetchPolicy: 'network-only'
      });
      if (data?.customers) financeState$.customers.set(data.customers);
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  }, []);

  const fetchExpenses = useCallback(async (startDate?: string, endDate?: string, search?: string) => {
    try {
      const { data } = await client.query({
        query: GET_EXPENSES,
        variables: { startDate, endDate, search },
        fetchPolicy: 'network-only'
      });
      if (data?.expenses) financeState$.expenses.set(data.expenses);
    } catch (err) {
      console.error('Fetch expenses error:', err);
    }
  }, []);

  const refreshAllCustomerPayments = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const { data } = await client.query({
        query: GET_ALL_CUSTOMER_PAYMENTS,
        variables: { startDate, endDate },
        fetchPolicy: 'network-only'
      });
      if (data?.allCustomerPayments) financeState$.customerPayments.set(data.allCustomerPayments);
    } catch (err) {
      console.error('Fetch all customer payments error:', err);
    }
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => {
    try {
      await withLoading('REGISTERING_CUSTOMER', async () => {
        await client.mutate({
          mutation: ADD_CUSTOMER,
          variables: { ...customer }
        });
        await fetchCustomers();
      }, true);
    } catch (err) {
      console.error('[addCustomer] Execution Failed:', err);
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      await withLoading('UPDATING_CUSTOMER', async () => {
        await client.mutate({
          mutation: UPDATE_CUSTOMER,
          variables: { id, ...updates }
        });
        await fetchCustomers();
      }, true);
    } catch (err) {
      console.error('[updateCustomer] Execution Failed:', err);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await withLoading('DELETING_CUSTOMER', async () => {
        await client.mutate({
          mutation: DELETE_CUSTOMER,
          variables: { id }
        });
        await fetchCustomers();
      }, true);
    } catch (err) {
      console.error('[deleteCustomer] Execution Failed:', err);
    }
  };

  const recordPayment = async (customerId: string, amount: number, paymentMethod: string, reference?: string, notes?: string, shiftId?: string) => {
    try {
      await withLoading('RECORDING_PAYMENT', async () => {
        await client.mutate({
          mutation: RECORD_PAYMENT,
          variables: { customerId, amount, paymentMethod, reference, notes, shiftId }
        });
        await fetchCustomers();
        await refreshAllCustomerPayments();
      }, true);
    } catch (err) {
      console.error('[recordPayment] Execution Failed:', err);
    }
  };

  const deleteCustomerPayment = async (id: string) => {
    try {
      await withLoading('DELETING_PAYMENT', async () => {
        await client.mutate({
          mutation: DELETE_CUSTOMER_PAYMENT,
          variables: { id }
        });
        await refreshAllCustomerPayments();
        await fetchCustomers();
      }, true);
    } catch (err) {
      console.error('[deleteCustomerPayment] Execution Failed:', err);
    }
  };

  const addExpense = async (expense: { category: string, amount: number, description?: string, date?: string }) => {
    try {
      await withLoading('RECORDING_EXPENSE', async () => {
        await client.mutate({
          mutation: ADD_EXPENSE,
          variables: { ...expense }
        });
        await fetchExpenses();
      }, true);
    } catch (err) {
      console.error('[addExpense] Execution Failed:', err);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      await withLoading('UPDATING_EXPENSE', async () => {
        await client.mutate({
          mutation: UPDATE_EXPENSE,
          variables: { id, ...updates }
        });
        await fetchExpenses();
      }, true);
    } catch (err) {
      console.error('[updateExpense] Execution Failed:', err);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await withLoading('DELETING_EXPENSE', async () => {
        await client.mutate({
          mutation: DELETE_EXPENSE,
          variables: { id }
        });
        await fetchExpenses();
      }, true);
    } catch (err) {
      console.error('[deleteExpense] Execution Failed:', err);
    }
  };

  const getCustomerPayments = async (customerId: string) => {
    const { data } = await client.query({
      query: GET_CUSTOMER_PAYMENTS,
      variables: { customerId },
      fetchPolicy: 'network-only'
    });
    return data?.customerPayments || [];
  };

  const getDailyDebtRecovered = async () => {
    const { data } = await client.query({
      query: GET_DAILY_DEBT_RECOVERED,
      fetchPolicy: 'network-only'
    });
    return data?.dailyDebtRecovered || 0;
  };

  const value: FinanceContextType = {
    get customers() { return financeState$.customers.get(); },
    get expenses() { return financeState$.expenses.get(); },
    get customerPayments() { return financeState$.customerPayments.get(); },
    fetchCustomers,
    fetchExpenses,
    refreshAllCustomerPayments,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordPayment,
    deleteCustomerPayment,
    addExpense,
    updateExpense,
    deleteExpense,
    getCustomerPayments,
    getDailyDebtRecovered,
    financeState$
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
});

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
