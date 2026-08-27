import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { apolloClient as client } from '../lib/apollo';
import { observable } from "@legendapp/state";
import { Sale, CashierShift } from '../types';
import { GET_SALES, GET_ACTIVE_SHIFT, GET_SHIFT_EXPECTED, GET_CASHIER_SHIFTS, GET_SALE_RETURNS, GET_PROFIT_REPORT, GET_HELD_SALES } from '../gql/queries/inventory';
import {
  ADD_SALE,
  RECORD_RETURN,
  OPEN_SHIFT,
  CLOSE_SHIFT,
  HOLD_SALE,
  DELETE_HELD_SALE
} from '../gql/mutations/inventory';
import { useIdentity } from './IdentityContext';

// 🚀 [VANGUARD] Sales & Shift Store:
// Managed via Legend observables to ensure the POS terminal doesn't lag 
// during high-volume sales periods.
export const salesState$ = observable({
  sales: [] as Sale[],
  activeShift: null as CashierShift | null,
  heldSales: [] as any[],
  saleReturns: [] as any[],
  isSalesLoading: false,
});

interface SalesContextType {
  sales: Sale[];
  activeShift: CashierShift | null;
  heldSales: any[];
  saleReturns: any[];
  isSalesLoading: boolean;
  fetchSales: (startDate?: string, endDate?: string, search?: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'> & { clientTxId?: string; heldSaleId?: string }) => Promise<any>;
  recordReturn: (ret: { saleId: string; productId: string; quantity: number; amount: number; reason?: string; date?: string; shiftId?: string }) => Promise<void>;
  openShift: (openingCash: number) => Promise<void>;
  closeShift: (id: string, actualCash: number) => Promise<any>;
  getActiveShift: (cashierId: string) => Promise<any>;
  getShiftExpected: (id: string) => Promise<CashierShift | null>;
  fetchCashierShifts: (start?: string, end?: string) => Promise<any[]>;
  fetchSaleReturns: (start?: string, end?: string) => Promise<any[]>;
  fetchProfitReport: (start: string, end: string) => Promise<any[]>;
  holdTransaction: (cart: string, customerId?: string, discount?: number) => Promise<any>;
  deleteHeldTransaction: (id: string) => Promise<void>;
  refreshHeldSales: (silent?: boolean) => Promise<void>;
  searchSaleByInvoice: (invoiceId: string) => Promise<Sale | null>;
  salesState$: any;
}

import { observer } from '@legendapp/state/react';

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { withLoading, currentUser } = useIdentity();

  const fetchSales = useCallback(async (startDate?: string, endDate?: string, search?: string) => {
    try {
      salesState$.isSalesLoading.set(true);
      const { data } = await client.query({
        query: GET_SALES,
        variables: { startDate, endDate, search },
        fetchPolicy: 'network-only'
      });
      if (data?.sales) salesState$.sales.set(data.sales);
    } catch (err) {
      console.error('Fetch sales error:', err);
    } finally {
      salesState$.isSalesLoading.set(false);
    }
  }, []);

  const addSale = async (sale: Omit<Sale, 'id' | 'timestamp'> & { clientTxId?: string; heldSaleId?: string }) => {
    try {
      let result = null;
      // 🛰️ [VANGUARD] Payload Sanitization (Dialect v2):
      // Re-calibrated to match the server-side SaleItemInput schema:
      // - 'id' is used for the product reference.
      // - 'price' is used for the line item value.
      const sanitizedItems = (sale.items || []).map((item: any) => ({
        id: item.productId || item.id,
        name: item.name || item.productName,
        quantity: item.quantity,
        price: item.unitPrice || item.price,
      }));

      await withLoading('RECORDING_SALE', async () => {
        const { data } = await client.mutate({
          mutation: ADD_SALE,
          variables: { 
            ...sale,
            items: sanitizedItems 
          }
        });
        result = data?.addSale;
        if (result) await fetchSales();
      }, true);
      return result;
    } catch (err: any) {
      console.error('[addSale] Execution Failed:', err);
      throw err;
    }
  };

  const recordReturn = async (ret: { saleId: string; productId: string; quantity: number; amount: number; reason?: string; date?: string; shiftId?: string }) => {
    try {
      await withLoading('RECORDING_RETURN', async () => {
        await client.mutate({
          mutation: RECORD_RETURN,
          variables: { ...ret }
        });
        await Promise.all([fetchSales(), fetchSaleReturns()]);
      }, true);
    } catch (err) {
      console.error('[recordReturn] Execution Failed:', err);
    }
  };

  const openShift = async (openingCash: number) => {
    try {
      await withLoading('OPENING_SHIFT', async () => {
        const { data } = await client.mutate({
          mutation: OPEN_SHIFT,
          variables: { openingCash }
        });
        if (data?.openShift) salesState$.activeShift.set(data.openShift);
      }, true);
    } catch (err) {
      console.error('[openShift] Execution Failed:', err);
    }
  };

  const closeShift = async (id: string, actualCash: number) => {
    try {
      let result = null;
      await withLoading('CLOSING_SHIFT', async () => {
        const { data } = await client.mutate({
          mutation: CLOSE_SHIFT,
          variables: { id, actualCash }
        });
        result = data?.closeShift;
        salesState$.activeShift.set(null);
      }, true);
      return result;
    } catch (err) {
      console.error('[closeShift] Execution Failed:', err);
      throw err;
    }
  };

  const getActiveShift = async (cashierId: string) => {
    const { data } = await client.query({
      query: GET_ACTIVE_SHIFT,
      variables: { cashierId },
      fetchPolicy: 'network-only'
    });
    if (data?.activeShift) salesState$.activeShift.set(data.activeShift);
    return data?.activeShift;
  };

  const getShiftExpected = async (id: string) => {
    const { data } = await client.query({
      query: GET_SHIFT_EXPECTED,
      variables: { id },
      fetchPolicy: 'network-only'
    });
    return data?.shiftExpected;
  };

  const fetchCashierShifts = async (start?: string, end?: string) => {
    const { data } = await client.query({
      query: GET_CASHIER_SHIFTS,
      variables: { startDate: start, endDate: end },
      fetchPolicy: 'network-only'
    });
    return data?.cashierShifts || [];
  };

  const fetchSaleReturns = async (start?: string, end?: string) => {
    const { data } = await client.query({
      query: GET_SALE_RETURNS,
      variables: { startDate: start, endDate: end },
      fetchPolicy: 'network-only'
    });
    if (data?.saleReturns) salesState$.saleReturns.set(data.saleReturns);
    return data?.saleReturns || [];
  };

  const fetchProfitReport = async (start: string, end: string) => {
    const { data } = await client.query({
      query: GET_PROFIT_REPORT,
      variables: { startDate: start, endDate: end },
      fetchPolicy: 'network-only'
    });
    return data?.profitReport || [];
  };

  const holdTransaction = async (cart: string, customerId?: string, discount?: number) => {
    try {
      let result = null;
      await withLoading('HOLDING_TRANSACTION', async () => {
        const { data } = await client.mutate({
          mutation: HOLD_SALE,
          variables: { 
            cart, 
            customerId, 
            discount,
            cashierId: currentUser?.id || "unknown"
          }
        });
        result = data?.holdSale;
        await refreshHeldSales();
      }, true);
      return result;
    } catch (err) {
      console.error('[holdTransaction] Execution Failed:', err);
    }
  };

  const deleteHeldTransaction = async (id: string) => {
    try {
      await withLoading('DELETING_HELD_SALE', async () => {
        await client.mutate({
          mutation: DELETE_HELD_SALE,
          variables: { id }
        });
        await refreshHeldSales();
      }, true);
    } catch (err) {
      console.error('[deleteHeldTransaction] Execution Failed:', err);
    }
  };

  const refreshHeldSales = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_HELD_SALES,
        fetchPolicy: 'network-only'
      });
      if (data?.heldSales) salesState$.heldSales.set(data.heldSales);
    } catch (err) {
      console.error('Fetch held sales error:', err);
    }
  }, []);

  const searchSaleByInvoice = async (invoiceId: string) => {
    const { data } = await client.query({
      query: GET_SALES,
      variables: { search: invoiceId },
      fetchPolicy: 'network-only'
    });
    return data?.sales?.[0] || null;
  };

  const value: SalesContextType = useMemo(() => ({
    get sales() { return salesState$.sales.get(); },
    get activeShift() { return salesState$.activeShift.get(); },
    get heldSales() { return salesState$.heldSales.get(); },
    get saleReturns() { return salesState$.saleReturns.get(); },
    get isSalesLoading() { return salesState$.isSalesLoading.get(); },
    fetchSales,
    addSale,
    recordReturn,
    openShift,
    closeShift,
    getActiveShift,
    getShiftExpected,
    fetchCashierShifts,
    fetchSaleReturns,
    fetchProfitReport,
    holdTransaction,
    deleteHeldTransaction,
    refreshHeldSales,
    searchSaleByInvoice,
    salesState$
  }), [fetchSales, refreshHeldSales, currentUser]);

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
});

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) throw new Error('useSales must be used within SalesProvider');
  return context;
};
