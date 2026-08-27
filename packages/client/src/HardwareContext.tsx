import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useIdentity } from './contexts/IdentityContext';
import { useInventory } from './contexts/InventoryContext';
import { useSales } from './contexts/SalesContext';
import { useFinance } from './contexts/FinanceContext';
import { useHR } from './contexts/HRContext';
import { useSystem } from './contexts/SystemContext';
import { usePOS } from './POSContext';
import { getLocalDateString, getPastLocalDateString } from './lib/utils';
import { apolloClient as client } from './lib/apollo';
import { gql } from '@apollo/client';

// Keep all types/interfaces for backward compatibility
import { Product, Sale, Customer, Supplier, Expense, User, Employee, Role, AttendanceRecord, Promotion, CashierShift } from './types';

interface HardwareContextType {
  // States from modules
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  roles: Role[];
  promotions: Promotion[];
  currentUser: User | null;
  settings: Record<string, string>;
  activeShift: CashierShift | null;
  heldSales: any[];
  saleReturns: any[];
  isOffline: boolean;
  isReady: boolean;
  loading: boolean;
  loadingStatus: string;
  isSalesLoading: boolean;

  // Actions from modules
  login: (email: string, password: string) => Promise<string | undefined>;
  loginWithGoogle: (token: string) => Promise<string | undefined>;
  logout: () => void;
  updateProfilePicture: (file: File) => Promise<void>;
  withLoading: (status: string | undefined, fn: () => Promise<void>, showToast?: boolean) => Promise<void>;
  
  // Inventory Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, updates: any) => Promise<void>;
  retireProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, quantity: number, type: string, notes?: string) => Promise<void>;
  refreshInventory: (silent?: boolean) => Promise<void>;
  getInventoryTransactions: (productId?: string, startDate?: string, endDate?: string) => Promise<any[]>;
  addPromotion: (promo: any) => Promise<void>;
  updatePromotion: (id: string, updates: any) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotion: (id: string) => Promise<void>;
  
  // Supplier Actions
  addSupplier: (supplier: any) => Promise<void>;
  updateSupplier: (id: string, updates: any) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  refreshSuppliers: () => Promise<void>;

  // Sales Actions
  addSale: (sale: any) => Promise<any>;
  recordReturn: (ret: any) => Promise<void>;
  refreshSales: (start?: string, end?: string, search?: string) => Promise<void>;
  openShift: (openingCash: number) => Promise<void>;
  closeShift: (id: string, actualCash: number) => Promise<any>;
  getActiveShift: (cashierId: string) => Promise<any>;
  getShiftExpected: (id: string) => Promise<any>;
  searchSaleByInvoice: (invoiceId: string) => Promise<Sale | null>;
  fetchCashierShifts: (start?: string, end?: string) => Promise<any[]>;
  fetchSaleReturns: (start?: string, end?: string) => Promise<any[]>;
  fetchProfitReport: (start: string, end: string) => Promise<any[]>;
  refreshReturns: (start?: string, end?: string) => Promise<any[]>;
  holdTransaction: (cart: string, customerId?: string, discount?: number) => Promise<any>;
  deleteHeldTransaction: (id: string) => Promise<void>;
  refreshHeldSales: (silent?: boolean) => Promise<void>;

  // Finance Actions
  addCustomer: (customer: any) => Promise<void>;
  fetchCustomers: (silent?: boolean) => Promise<void>;
  updateCustomer: (id: string, updates: any) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  recordPayment: (customerId: string, amount: number, paymentMethod: string, reference?: string, notes?: string, shiftId?: string) => Promise<void>;
  refreshAllCustomerPayments: (start?: string, end?: string) => Promise<void>;
  customerPayments: any[];
  addExpense: (expense: any) => Promise<void>;
  updateExpense: (id: string, updates: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshExpenses: (start?: string, end?: string, search?: string) => Promise<void>;
  deleteCustomerPayment: (id: string) => Promise<void>;
  getCustomerPayments: (customerId: string) => Promise<any[]>;
  getDailyDebtRecovered: () => Promise<number>;

  // HR Actions
  addEmployee: (employee: any) => Promise<void>;
  updateEmployee: (id: string, updates: any) => Promise<void>;
  refreshEmployees: (silent?: boolean) => Promise<void>;
  recordAttendance: (record: any) => Promise<void>;
  addRole: (role: any) => Promise<void>;
  updateRole: (id: string, updates: any) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;

  // System Actions
  updateSetting: (key: string, value: string) => Promise<void>;
  initializeSettingsDB: () => Promise<void>;
  initializeInventoryDB: () => Promise<void>;
  initializeHR: () => Promise<void>;
  initializeUserDB: () => Promise<void>;
  initializeLogsDB: () => Promise<void>;
  getSystemTelemetry: () => Promise<any>;
  backupDatabase: () => Promise<any>;
  fetchAuditLogs: (start?: string, end?: string) => Promise<any[]>;
  testNotifications: (email: string) => Promise<void>;
  addSystemLog: (log: any) => Promise<void>;

  // 📡 [VANGUARD] Observable Feed Proxies
  identityState$: any;
  inventoryState$: any;
  salesState$: any;
  financeState$: any;
  hrState$: any;
  systemState$: any;
  posState$: any;
}

const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

import { observer } from '@legendapp/state/react';

export const HardwareProvider = observer(({ children }: { children: React.ReactNode }) => {
  const identity = useIdentity();
  const inventory = useInventory();
  const sales = useSales();
  const finance = useFinance();
  const hr = useHR();
  const system = useSystem();
  const pos = usePOS();

  const [isReady, setIsReady] = useState(false);

  // Maintain the original Hydration Logic exactly as it was, but calling the new modular functions
  useEffect(() => {
    if (!identity.currentUser) {
      setIsReady(true);
      return;
    }

    const isHqCeo = identity.currentUser?.role?.toLowerCase() === 'hq-ceo';

    identity.withLoading('SYSTEM_HYDRATION_IN_PROGRESS...', async () => {
      try {
        if (isHqCeo) {
          await Promise.all([
            hr.fetchEmployees(),
            system.fetchSettings(),
            hr.fetchRoles()
          ]);
        } else {
          const today = getLocalDateString();
          const sevenDaysAgo = getPastLocalDateString(6);
          await Promise.all([
            hr.fetchEmployees(),
            hr.fetchAttendance(),
            system.fetchSettings(),
            hr.fetchRoles(),
            inventory.fetchSuppliers(),
            inventory.fetchProducts(),
            finance.fetchCustomers(),
            sales.fetchSales(sevenDaysAgo, today),
            finance.fetchExpenses(sevenDaysAgo, today),
            sales.fetchSaleReturns(sevenDaysAgo, today),
            inventory.fetchPromotions(),
            sales.refreshHeldSales()
          ]);

          await sales.getActiveShift(identity.currentUser!.id);
        }

        // Re-verify currentUser
        const { data: meData } = await client.query({
          query: gql`query RefreshMe { me { id username role authorizedModules profilePicture tenantStatus } }`,
          fetchPolicy: 'network-only'
        });
        if (meData?.me) {
          identity.setCurrentUser(prev => ({ ...prev!, ...meData.me }));
        }

        setIsReady(true);
      } catch (err) {
        console.error('Hydration error:', err);
        setIsReady(true);
      }
    });
  }, [identity.currentUser?.id]);

  const value: HardwareContextType = useMemo(() => ({
    // Identity
    currentUser: identity.currentUser,
    isOffline: identity.isOffline,
    isReady: isReady && identity.isReady,
    loading: !isReady || !identity.isReady,
    loadingStatus: identity.loadingStatus,
    login: identity.login,
    loginWithGoogle: identity.loginWithGoogle,
    logout: identity.logout,
    updateProfilePicture: identity.updateProfilePicture,
    withLoading: identity.withLoading,

    // Inventory
    products: inventory.products,
    suppliers: inventory.suppliers,
    promotions: inventory.promotions,
    fetchProducts: inventory.fetchProducts,
    refreshInventory: inventory.fetchProducts,
    addProduct: inventory.addProduct,
    updateProduct: inventory.updateProduct,
    retireProduct: inventory.retireProduct,
    adjustStock: inventory.adjustStock,
    getInventoryTransactions: inventory.getInventoryTransactions,
    addPromotion: inventory.addPromotion,
    updatePromotion: inventory.updatePromotion,
    deletePromotion: inventory.deletePromotion,
    togglePromotion: inventory.togglePromotion,
    addSupplier: inventory.addSupplier,
    updateSupplier: inventory.updateSupplier,
    deleteSupplier: inventory.deleteSupplier,
    refreshSuppliers: inventory.fetchSuppliers,

    // Sales
    sales: sales.sales,
    activeShift: sales.activeShift,
    heldSales: sales.heldSales,
    saleReturns: sales.saleReturns,
    isSalesLoading: sales.isSalesLoading,
    refreshSales: sales.fetchSales,
    addSale: async (sale: any) => {
      const result = await sales.addSale(sale);
      if (result) {
        await inventory.fetchProducts();
      }
      return result;
    },
    recordReturn: sales.recordReturn,
    openShift: sales.openShift,
    closeShift: sales.closeShift,
    getActiveShift: sales.getActiveShift,
    getShiftExpected: sales.getShiftExpected,
    searchSaleByInvoice: sales.searchSaleByInvoice,
    fetchCashierShifts: sales.fetchCashierShifts,
    fetchSaleReturns: sales.fetchSaleReturns,
    fetchProfitReport: sales.fetchProfitReport,
    refreshReturns: sales.fetchSaleReturns,
    holdTransaction: sales.holdTransaction,
    deleteHeldTransaction: sales.deleteHeldTransaction,
    refreshHeldSales: sales.refreshHeldSales,

    // Finance
    customers: finance.customers,
    expenses: finance.expenses,
    customerPayments: finance.customerPayments,
    addCustomer: finance.addCustomer,
    fetchCustomers: finance.fetchCustomers,
    updateCustomer: finance.updateCustomer,
    deleteCustomer: finance.deleteCustomer,
    recordPayment: finance.recordPayment,
    refreshAllCustomerPayments: finance.refreshAllCustomerPayments,
    addExpense: finance.addExpense,
    updateExpense: finance.updateExpense,
    deleteExpense: finance.deleteExpense,
    refreshExpenses: finance.fetchExpenses,
    deleteCustomerPayment: finance.deleteCustomerPayment,
    getCustomerPayments: finance.getCustomerPayments,
    getDailyDebtRecovered: finance.getDailyDebtRecovered,

    // HR
    employees: hr.employees,
    attendance: hr.attendance,
    roles: hr.roles,
    refreshEmployees: hr.fetchEmployees,
    addEmployee: hr.addEmployee,
    updateEmployee: hr.updateEmployee,
    recordAttendance: hr.recordAttendance,
    addRole: hr.addRole,
    updateRole: hr.updateRole,
    deleteRole: hr.deleteRole,

    // System
    settings: system.settings,
    updateSetting: system.updateSetting,
    initializeSettingsDB: system.initializeSettingsDB,
    initializeInventoryDB: system.initializeInventoryDB,
    initializeHR: hr.initializeHR,
    initializeUserDB: hr.initializeUserDB,
    initializeLogsDB: hr.initializeLogsDB,
    getSystemTelemetry: system.getSystemTelemetry,
    backupDatabase: system.backupDatabase,
    fetchAuditLogs: system.fetchAuditLogs,
    testNotifications: system.testNotifications,
    addSystemLog: system.addSystemLog,

    // 📡 [VANGUARD] Observable Feed Proxies
    identityState$: (identity as any).identityState$,
    inventoryState$: (inventory as any).inventoryState$,
    salesState$: (sales as any).salesState$,
    financeState$: (finance as any).financeState$,
    hrState$: (hr as any).hrState$,
    systemState$: (system as any).systemState$,
    posState$: pos.posState$,
  }), [
    identity.currentUser, identity.isReady,
    inventory.products, inventory.suppliers, inventory.promotions,
    sales.sales, sales.activeShift, sales.heldSales, sales.saleReturns, sales.isSalesLoading,
    finance.customers, finance.expenses, finance.customerPayments,
    hr.employees, hr.attendance, hr.roles,
    system.settings, isReady
  ]);

  return (
    <HardwareContext.Provider value={value}>
      {children}
    </HardwareContext.Provider>
  );
});

export const useHardware = () => {
  const context = useContext(HardwareContext);
  if (!context) throw new Error('useHardware must be used within HardwareProvider');
  return context;
};