import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, gql } from '@apollo/client';
import { Product, Sale, Customer, Supplier, Expense, User, Employee, Role, AttendanceRecord, Promotion, CashierShift, CartItem, PaymentMethod } from './types';
import { GET_EMPLOYEES, GET_ATTENDANCE } from './gql/queries/hr';
import {
  ADD_EMPLOYEE,
  UPDATE_EMPLOYEE,
  RECORD_ATTENDANCE,
  INITIALIZE_HR_DB
} from './gql/mutations/hr';
import { LOGIN, GOOGLE_LOGIN, INITIALIZE_USER_DB } from './gql/mutations/auth';
import { INITIALIZE_LOGS_DB } from './gql/mutations/logs';
import { 
  GET_SETTINGS, 
  UPDATE_SETTING, 
  INITIALIZE_SETTINGS_DB, 
  GET_ROLES, 
  ADD_ROLE, 
  DELETE_ROLE,
  GET_SYSTEM_TELEMETRY,
  BACKUP_DATABASE,
  TEST_NOTIFICATION_SETTINGS
} from './gql/settings';
import { GET_SUPPLIERS, GET_PRODUCTS, GET_INVENTORY_TRANSACTIONS, GET_CUSTOMERS, GET_CUSTOMER_PAYMENTS, GET_ALL_CUSTOMER_PAYMENTS, GET_DAILY_DEBT_RECOVERED, GET_SALES, GET_EXPENSES, GET_AUDIT_LOGS, GET_SALE_RETURNS, GET_CASHIER_SHIFTS, GET_ACTIVE_SHIFT, GET_PROFIT_REPORT, GET_PROMOTIONS, GET_SHIFT_EXPECTED } from './gql/queries/inventory';
import { getLocalDateString, getPastLocalDateString } from './lib/utils';
import {
  ADD_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
  INITIALIZE_INVENTORY_DB,
  ADD_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  ADJUST_STOCK,
  ADD_SALE,
  ADD_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  RECORD_PAYMENT,
  ADD_EXPENSE,
  DELETE_EXPENSE,
  UPDATE_EXPENSE,
  ADD_SYSTEM_LOG,
  RECORD_RETURN,
  OPEN_SHIFT,
  CLOSE_SHIFT,
  ADD_PROMOTION,
  UPDATE_PROMOTION,
  DELETE_PROMOTION,
  TOGGLE_PROMOTION,
  DELETE_CUSTOMER_PAYMENT
} from './gql/mutations/inventory';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

export const FORCE_LOGOUT_EVENT = 'khms_force_logout';


interface HardwareContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  roles: Role[];
  currentUser: User | null;
  loading: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<string | undefined>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  addSupplier: (supplier: { name: string; contact?: string; phone?: string; email?: string; }) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  refreshSuppliers: (silent?: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'stock'> & { initialStock?: number }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  retireProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, quantity: number, type: string, notes?: string) => Promise<void>;
  refreshInventory: (silent?: boolean) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'> & { clientTxId?: string }) => Promise<any>;
  refreshSales: (startDate?: string, endDate?: string, search?: string, silent?: boolean) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  updateCustomerBalance: (id: string, amount: number) => void;
  recordPayment: (customerId: string, amount: number, paymentMethod: string, reference?: string, notes?: string, shiftId?: string) => Promise<void>;
  customerPayments: any[];
  refreshAllCustomerPayments: (startDate?: string, endDate?: string) => Promise<void>;
  saleReturns: any[];
  refreshReturns: (startDate?: string, endDate?: string, silent?: boolean) => Promise<void>;
  addExpense: (expense: { category: string, amount: number, description?: string, date?: string }) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshExpenses: (startDate?: string, endDate?: string, search?: string, silent?: boolean) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'joinedDate'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  refreshEmployees: (silent?: boolean) => Promise<void>;
  addRole: (role: { name: string; description?: string }) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'date' | 'checkIn'>) => Promise<void>;
  initializeHR: () => Promise<void>;
  initializeUserDB: () => Promise<void>;
  initializeLogsDB: () => Promise<void>;
  settings: Record<string, string>;
  updateSetting: (key: string, value: string) => Promise<void>;
  initializeSettingsDB: () => Promise<void>;
  initializeInventoryDB: () => Promise<void>;
  getInventoryTransactions: (productId?: string, startDate?: string, endDate?: string) => Promise<any[]>;
  getCustomerPayments: (customerId: string) => Promise<any[]>;
  getDailyDebtRecovered: () => Promise<number>;
  addSystemLog: (log: { action: string; target: string; oldValue?: string; newValue?: string }) => Promise<void>;
  recordReturn: (ret: { saleId: string; productId: string; quantity: number; amount: number; reason?: string; date?: string; shiftId?: string }) => Promise<void>;
  openShift: (openingCash: number) => Promise<void>;
  closeShift: (id: string, actualCash: number) => Promise<any>;
  getShiftExpected: (id: string) => Promise<CashierShift | null>;
  fetchAuditLogs: (start?: string, end?: string) => Promise<any[]>;
  fetchSaleReturns: (start?: string, end?: string) => Promise<any[]>;
  fetchCashierShifts: (start?: string, end?: string) => Promise<any[]>;
  getActiveShift: (cashierId: string) => Promise<any>;
  loadingStatus: string;
  fetchPromotions: () => Promise<void>;
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id' | 'isActive'>) => Promise<void>;
  updatePromotion: (id: string, updates: Partial<Promotion>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotion: (id: string) => Promise<void>;
  fetchProfitReport: (start: string, end: string) => Promise<any[]>;
  searchSaleByInvoice: (invoiceId: string) => Promise<Sale | null>;
  activeShift: CashierShift | null;
  isOffline: boolean;
  deleteCustomerPayment: (id: string) => Promise<void>;
  getSystemTelemetry: () => Promise<any>;
  backupDatabase: () => Promise<any>;
  testNotifications: (email: string) => Promise<void>;
  isSalesLoading: boolean;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  posDiscount: number;
  setPosDiscount: React.Dispatch<React.SetStateAction<number>>;
  selectedCustomerId: string;
  setSelectedCustomerId: React.Dispatch<React.SetStateAction<string>>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
  withLoading: (displayStatus: string | undefined, fn: () => Promise<void>, showToast?: boolean) => Promise<void>;
}


const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

// Dynamic API resolution for Cloud Hosting support
const getApiBaseUrl = () => {
  try {
    // Check for Vite meta (env) - use string indexing to bypass strict module checks
    // @ts-ignore
    const meta = (import.meta as any);
    const viteEnv = meta.env?.VITE_API_BASE_URL;
    if (viteEnv) return viteEnv;

    // Check Bun/Node-style env
    const nodeEnv = typeof process !== 'undefined' ? process.env?.VITE_API_BASE_URL : null;
    if (nodeEnv) return nodeEnv;
  } catch (e) {
    // Fallback if import.meta is not supported or env is missing
  }

  return `http://${window.location.hostname}:9000`;
};

export const API_BASE_URL = getApiBaseUrl();

const httpLink = createHttpLink({
  uri: `${API_BASE_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('khms_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message?.includes('expired token')) {
        // Dispatched as a CustomEvent to handle React state outside the link
        window.dispatchEvent(new CustomEvent(FORCE_LOGOUT_EVENT));
        break;
      }
    }
  }
  if (networkError) {
    if ('statusCode' in networkError && (networkError.statusCode === 401 || networkError.statusCode === 403)) {
      window.dispatchEvent(new CustomEvent(FORCE_LOGOUT_EVENT));
    } else {
      // General network error (e.g. 503 Service Unavailable or 408 Timeout)
      console.error('[Apollo Network Error]', networkError);
    }
  }
});


const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});


export const HardwareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence for non-HR modules
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null);

  const [sales, setSales] = useState<Sale[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [saleReturns, setSaleReturns] = useState<any[]>([]);
  const [classTeachers, setClassTeachers] = useState<any[]>([]); 
  const [classes, setClasses] = useState<any[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('khms_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global POS Terminal Session Persistence
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // Connectivity & Server Heartbeat Monitoring
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const isServerDown = useRef(false);
  const offlineToastId = useRef<string | number | null>(null);

  useEffect(() => {
    let checkInterval: any;
    let consecutiveServerFailures = 0;

    const handleSyncStatus = (isNowOffline: boolean, reason: 'network' | 'server') => {
      if (isNowOffline) {
        setIsOffline(true);
        if (!offlineToastId.current) {
          const message = reason === 'network' 
            ? 'Network Paused: Please check your internet connection.' 
            : 'Sync Paused: Reconnecting to your local hardware server...';
          offlineToastId.current = toast.error(message, { 
            id: 'offline-sync-error',
            duration: Infinity 
          });
        }
      } else {
        // Only restore if BOTH network is up AND server is reachable
        if (window.navigator.onLine && !isServerDown.current) {
          setIsOffline(false);
          consecutiveServerFailures = 0; // Reset counter on success
          if (offlineToastId.current) {
            toast.dismiss(offlineToastId.current);
            offlineToastId.current = null;
            toast.success('System Synchronization Complete.', { id: 'offline-sync-error' });
          }
        }
      }
    };

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000); // Increased timeout
        const res = await fetch(`${API_BASE_URL}/health`, { 
          method: 'GET',
          signal: controller.signal, 
          cache: 'no-cache' 
        });
        clearTimeout(id);
        
        if (res.ok) {
          consecutiveServerFailures = 0;
          if (isServerDown.current) {
            isServerDown.current = false;
            handleSyncStatus(false, 'server');
          }
        } else {
          throw new Error();
        }
      } catch (e) {
        consecutiveServerFailures++;
        // Grace Period: Only go offline after 2 consecutive failures
        if (consecutiveServerFailures >= 2 && !isServerDown.current) {
          isServerDown.current = true;
          handleSyncStatus(true, 'server');
        }
      }
    };

    // Initial check and start heartbeat interval (every 10 seconds)
    checkHealth();
    checkInterval = setInterval(checkHealth, 10000);

    const handleOnline = () => handleSyncStatus(false, 'network');
    const handleOffline = () => handleSyncStatus(true, 'network');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 📡 [HSM v2.4] Vanguard Session Re-validation
  // We synchronize the tenantStatus from the registry hub on every mount
  useEffect(() => {
    const syncSession = async () => {
      const token = localStorage.getItem('khms_token');
      if (!token || !currentUser) return;

      try {
        const { data } = await client.query({
          query: gql`
            query SyncSession { 
              me { 
                id 
                username 
                role 
                tenantStatus 
              } 
            }
          `,
          fetchPolicy: 'network-only'
        });

        if (data?.me) {
          setCurrentUser(prev => ({
            ...prev!,
            ...data.me
          }));
        }
      } catch (err: any) {
        if (err.message?.includes('ACCESS_DENIED') || err.message?.includes('suspended')) {
          setCurrentUser(prev => prev ? { ...prev, tenantStatus: 'suspended' } : null);
        } else {
          console.warn("[Vanguard HQ] Session Synchronization Failure:", err);
        }
      }
    };

    syncSession();
  }, []);



  // GraphQL for HR
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  // Unified Global Loading State
  const [globalLoading, setGlobalLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Smart Debounced Loading Helper (Directly connected to Server throughput)
  const withLoading = async (status: string | undefined, fn: () => Promise<void>, showToast = false) => {
    // Format status for display: "SAVING_SALE" -> "Saving Sale"
    const displayStatus = status
      ? status
          .replace(/\.\.\./g, '')
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      : 'Processing';


    // Offline Check
    if (isOffline) {
      toast.error(`Sync Paused: Reconnecting to hardware server...`, {
        id: 'offline-sync-error'
      });
      return;
    }

    let toastId: string | number | null = null;
    if (showToast) {
      toastId = toast.loading(`${displayStatus}...`);
    }

    // Only show the full-screen loader if the server takes > 200ms (avoids flicker)
    const loaderTimer = setTimeout(() => {
      setLoadingStatus(displayStatus);
      setGlobalLoading(true);
    }, 200);

    try {
      await fn(); // Real Server await
      if (showToast && toastId) {
        toast.success(`${displayStatus} completed`, { id: toastId });
      }
    } catch (err: any) {
      if (showToast && toastId && !err.message?.includes('Store reset')) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable. Check connection.' : err.message;
        toast.error(`${displayStatus} failed: ${friendlyMsg}`, { id: toastId });
      }
      throw err;
    } finally {
      clearTimeout(loaderTimer);
      setGlobalLoading(false);
      setLoadingStatus('');
    }
  };



  const fetchEmployees = useCallback(async () => {
    try {
      setEmpLoading(true);
      const { data } = await client.query({
        query: GET_EMPLOYEES,
        fetchPolicy: 'network-only'
      });
      if (data?.employees) setEmployees(data.employees);
    } catch (err) {
      console.error('Fetch employees error:', err);
    } finally {
      setEmpLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_PRODUCTS,
        fetchPolicy: 'network-only'
      });
      if (data?.products) setProducts(data.products);
    } catch (err: any) {
      if (!err.message?.includes('Store reset')) {
        console.error('Fetch products error:', err);
        toast.error(`Products Sync Failed: ${err.message || 'Cannot reach server'}`);
      }
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_SUPPLIERS,
        fetchPolicy: 'network-only'
      });
      if (data?.suppliers) setSuppliers(data.suppliers);
    } catch (err) {
      console.error('Fetch suppliers error:', err);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_CUSTOMERS,
        fetchPolicy: 'network-only'
      });
      if (data?.customers) setCustomers(data.customers);
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  }, []);

  const fetchSales = useCallback(async (startDate?: string, endDate?: string, search?: string) => {
    try {
      setIsSalesLoading(true);
      const { data } = await client.query({
        query: GET_SALES,
        variables: { startDate, endDate, search },
        fetchPolicy: 'network-only'
      });
      if (data?.sales) setSales(data.sales);
    } catch (err) {
      console.error('Fetch sales error:', err);
    } finally {
      setIsSalesLoading(false);
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_PROMOTIONS,
        fetchPolicy: 'network-only'
      });
      if (data?.promotions) setPromotions(data.promotions);
    } catch (err) {
      console.error('Fetch promotions error:', err);
    }
  }, []);

  const fetchExpenses = useCallback(async (startDate?: string, endDate?: string, search?: string) => {
    try {
      const { data } = await client.query({
        query: GET_EXPENSES,
        variables: { startDate, endDate, search },
        fetchPolicy: 'network-only'
      });
      if (data?.expenses) setExpenses(data.expenses);
    } catch (err) {
      console.error('Fetch expenses error:', err);
    }
  }, []);

  const fetchReturns = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const { data } = await client.query({
        query: GET_SALE_RETURNS,
        variables: { startDate, endDate },
        fetchPolicy: 'network-only'
      });
      if (data?.saleReturns) setSaleReturns(data.saleReturns);
    } catch (err) {
      console.error('Fetch returns error:', err);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_ATTENDANCE,
        fetchPolicy: 'network-only'
      });
      if (data?.attendance) setAttendance(data.attendance);
    } catch (err) {
      console.error('Fetch attendance error:', err);
    }
  }, []);

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
        setSettings(settingsMap);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_ROLES,
        fetchPolicy: 'network-only'
      });
      if (data?.roles) setRoles(data.roles);
    } catch (err) {
      console.error('Fetch roles error:', err);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setIsReady(true);
      return;
    }

    const isHqCeo = currentUser?.role === 'hq-ceo';

    withLoading('SYSTEM_HYDRATION_IN_PROGRESS...', async () => {
      try {
        if (isHqCeo) {
          // 👑 HQ-CEO Context: Only fetch platform-wide administrative metadata
          await Promise.all([
            fetchEmployees(),
            fetchSettings(),
            fetchRoles()
          ]);
        } else {
          // 🏬 Store Context: Fetch full operational dataset (7-day window for dashboard delta)
          const today = getLocalDateString();
          const sevenDaysAgo = getPastLocalDateString(6);
          await Promise.all([
            fetchEmployees(),
            fetchAttendance(),
            fetchSettings(),
            fetchRoles(),
            fetchSuppliers(),
            fetchProducts(),
            fetchCustomers(),
            fetchSales(sevenDaysAgo, today),
            fetchExpenses(sevenDaysAgo, today),
            fetchReturns(sevenDaysAgo, today),
            fetchPromotions()
          ]);

          const { data } = await client.query({
            query: GET_ACTIVE_SHIFT,
            variables: { cashierId: currentUser.id },
            fetchPolicy: 'network-only'
          });
          if (data?.activeShift) setActiveShift(data.activeShift);
        }
        
        setIsReady(true);
      } catch (err) {
        console.error('Hydration error:', err);
        setIsReady(true); // Don't block UI if some fetches fail
      }
    });
  }, [currentUser, fetchEmployees, fetchAttendance, fetchSettings, fetchRoles, fetchSuppliers, fetchProducts, fetchCustomers, fetchSales, fetchExpenses, fetchReturns, fetchPromotions]);

  useEffect(() => {
    localStorage.setItem('khms_expenses', JSON.stringify(expenses)); // Keep expenses for now as they are lighter
    localStorage.setItem('khms_promotions', JSON.stringify(promotions));
    if (currentUser) {
      localStorage.setItem('khms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('khms_user');
    }
  }, [expenses, currentUser, promotions]);

  // 🏷️ Institutional Identity Protocol: Dynamic Browser Title
  useEffect(() => {
    if (currentUser) {
      const bizName = settings.COMPANY_NAME || 'Institutional Terminal';
      document.title = bizName.toUpperCase();
    } else {
      document.title = 'TREDPOS INDUSTRIES';
    }
  }, [currentUser, settings.COMPANY_NAME]);

  const login = async (username: string, password: string) => {
    try {
      const { data } = await client.mutate({
        mutation: LOGIN,
        variables: { username, password }
      });

      if (data?.login) {
        const token = data.login;
        localStorage.setItem('khms_token', token);

        // HSM v2.4: Purge cache before session context switch
        await client.clearStore();

        // Decode token to get user info
        const decoded: any = jwtDecode(token);
        setCurrentUser({
          id: decoded.id,
          username: decoded.username,
          name: decoded.name,
          role: decoded.role as any,
          tenantStatus: decoded.tenantStatus,
        });

        // Refresh client headers
        client.setLink(createHttpLink({
          uri: `${API_BASE_URL}/graphql`,
          headers: {
            authorization: `Bearer ${token}`
          }
        }));

        toast.success('Logged in successfully');
        return token;
      }
    } catch (err: any) {
      const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable. Check connection.' : err.message;
      toast.error(friendlyMsg || 'Login failed');
      throw err;
    }
  };

  const loginWithGoogle = useCallback(async (idToken: string) => {
    try {
      const { data } = await client.mutate({
        mutation: GOOGLE_LOGIN,
        variables: { idToken }
      });

      if (data?.googleLogin) {
        localStorage.setItem('khms_token', data.googleLogin);
        
        // HSM v2.4: Purge cache before session context switch
        await client.clearStore();

        const decoded = jwtDecode(data.googleLogin) as User;
        setCurrentUser(decoded);
        toast.success(`Identity Verified: Welcome, ${decoded.name || decoded.username}`);
        return data.googleLogin;
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      const friendlyMsg = error.message === 'Failed to fetch' ? 'Server unreachable. Check connection.' : error.message;
      toast.error('Identity Protocol Failure', {
        description: friendlyMsg || 'Google authentication failed'
      });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    try {
        localStorage.removeItem('khms_token');
        localStorage.removeItem('khms_user');
        setCurrentUser(null);
        
        // HSM v2.4 Scorched Earth: Clear all local state to avoid session leakage
        setEmployees([]);
        setProducts([]);
        setSales([]);
        setCustomers([]);
        setSuppliers([]);
        setExpenses([]);
        setSettings({});
        setActiveShift(null);
        setAttendance([]);
        setRoles([]);
        setPromotions([]);
        setSaleReturns([]);
        setClassTeachers([]); // 🛡️ Institutional Academics Purge
        setClasses([]); // 🛡️ Enrollment Purge
        
        // Purge Apollo Cache and reset link to ensure security partitioning
        client.clearStore().catch(console.error);
        client.setLink(httpLink); 
    } catch (error) {
        console.error('[Scorched Earth] Logout cleanup error:', error);
        // We still consider the user logged out since tokens are gone
        setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      toast.error('Session Expired: Please log in again', {
        id: 'session-expired', // Prevent duplicate toasts
        duration: 5000
      });
      logout();
    };

    window.addEventListener(FORCE_LOGOUT_EVENT, handleForceLogout as any);
    return () => window.removeEventListener(FORCE_LOGOUT_EVENT, handleForceLogout as any);
  }, [logout]);


  const addProduct = async (p: Omit<Product, 'id' | 'stock'> & { initialStock?: number }) => {
    try {
      await withLoading('SAVING_PRODUCT', async () => {
        await client.mutate({
          mutation: ADD_PRODUCT,
          variables: { ...p }
        });
        await fetchProducts();
      }, true);
    } catch (err) {
      console.error('[addProduct] Execution Failed:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await withLoading('UPDATING_PRODUCT', async () => {
        await client.mutate({
          mutation: UPDATE_PRODUCT,
          variables: { id, ...updates }
        });
        await fetchProducts();
      }, true);
    } catch (err) {
      console.error('[updateProduct] Execution Failed:', err);
    }
  };

   const retireProduct = async (id: string) => {
    try {
      await withLoading('RETIRING_PRODUCT', async () => {
        await client.mutate({
          mutation: DELETE_PRODUCT, // Backend still uses DELETE_PRODUCT but we mask it as RETIRE
          variables: { id }
        });
        await fetchProducts();
        toast.success('Product retired from active circulation');
      }, true);
    } catch (err: any) {
      toast.error(`Retirement Protocol Failure: ${err.message}`);
    }
  };

  const adjustStock = async (productId: string, quantity: number, type: string, notes?: string) => {
    try {
      await withLoading('ADJUSTING_STOCK', async () => {
        await client.mutate({
          mutation: ADJUST_STOCK,
          variables: { productId, quantity, type, notes }
        });
        await fetchProducts();
      }, true);
    } catch (err) {
      console.error('[adjustStock] Execution Failed:', err);
    }
  };

  const isAddingSaleRef = React.useRef(false);

  const addSale = async (s: Omit<Sale, 'id' | 'timestamp'> & { clientTxId?: string }) => {
    if (isAddingSaleRef.current) return;
    isAddingSaleRef.current = true;
    
    let saleResult: any = null;
    try {
      await withLoading('RECORDING_SALE', async () => {
        const { data } = await client.mutate({
          mutation: ADD_SALE,
          variables: {
            ...s,
            shiftId: activeShift?.id,
            items: s.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price }))
          }
        });
        
        saleResult = data.addSale;
        setSales(prev => [saleResult, ...prev]);
        await fetchProducts(); // Refresh inventory stock immediately
        if (s.paymentMethod === 'credit') {
          await fetchCustomers();
        }
      }, true);
    } catch (err) {
      console.error('[addSale] Execution Failed:', err);
      // withLoading already handled the toast message, we just prevent unhandled rejection here
    } finally {
      isAddingSaleRef.current = false;
    }
    
    return saleResult;
  };

  const [customerPayments, setCustomerPayments] = useState<any[]>([]);
  const refreshAllCustomerPayments = async (startDate?: string, endDate?: string) => {
    try {
      const { data } = await client.query({
        query: GET_ALL_CUSTOMER_PAYMENTS,
        variables: { startDate, endDate },
        fetchPolicy: 'network-only'
      });
      setCustomerPayments(data?.allCustomerPayments || []);
    } catch (err) {
      console.error('Fetch all payments error:', err);
    }
  };

  const addCustomer = async (c: Omit<Customer, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => {
    try {
      await withLoading('SAVING_CUSTOMER', async () => {
        await client.mutate({
          mutation: ADD_CUSTOMER,
          variables: { ...c }
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
          variables: { customerId, amount, paymentMethod, reference, notes, shiftId: shiftId || activeShift?.id }
        });
        await fetchCustomers();
        // Ensure money shows up in reports immediately
        const todayString = new Date().toISOString().split('T')[0];
        await refreshAllCustomerPayments(todayString, todayString);
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
        await fetchCustomers();
        // Sync reports after rollback
        const todayString = new Date().toISOString().split('T')[0];
        await refreshAllCustomerPayments(todayString, todayString);
      }, true);
    } catch (err) {
      console.error('[deleteCustomerPayment] Execution Failed:', err);
    }
  };

  const updateCustomerBalance = (id: string, amount: number) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, balance: c.balance + amount } : c));
  };

  const addExpense = async (e: { category: string, amount: number, description?: string, date?: string }) => {
    try {
      await withLoading('SAVING_EXPENSE', async () => {
        await client.mutate({
          mutation: ADD_EXPENSE,
          variables: { ...e }
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
        toast.success('Expense updated');
      }, true);
    } catch (err: any) {
      toast.error(`Update Failed: ${err.message}`);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await client.mutate({
        mutation: DELETE_EXPENSE,
        variables: { id }
      });
      await fetchExpenses();
      toast.success('Expense deleted');
    } catch (err: any) {
      toast.error(`Failed to delete expense: ${err.message}`);
    }
  };

  // HR Backend Actions
  const addEmployee = async (emp: Omit<Employee, 'id' | 'joinedDate'>) => {
    try {
      await client.mutate({
        mutation: ADD_EMPLOYEE,
        variables: { ...emp }
      });
      await withLoading('REFRESHING_STAFF_RECORDS...', async () => {
        await fetchEmployees();
      });
      toast.success('Employee added successfully');
    } catch (err: any) {
      toast.error(`Failed to add employee: ${err.message}`);
    }
  };

  const refreshEmployees = async (silent = false) => {
    try {
      await withLoading(silent ? undefined : 'SYNCING_STAFF_RECORDS...', async () => {
        await fetchEmployees();
      });
      if (!silent) toast.info('Staff records synchronized');
    } catch (err: any) {
      if (!silent) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable' : err.message;
        toast.error(`Sync Failed: ${friendlyMsg}`);
      }
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await client.mutate({
        mutation: UPDATE_EMPLOYEE,
        variables: { id, ...updates }
      });
      await fetchEmployees();
      toast.success('Employee updated successfully');
    } catch (err: any) {
      toast.error(`Failed to update employee: ${err.message}`);
    }
  };

  const recordAttendance = async (record: Omit<AttendanceRecord, 'id' | 'date' | 'checkIn'>) => {
    try {
      await client.mutate({
        mutation: RECORD_ATTENDANCE,
        variables: {
          employeeId: record.employeeId,
          checkIn: new Date().toISOString(),
          status: record.status
        }
      });
      await fetchAttendance();
      toast.success('Attendance recorded');
    } catch (err: any) {
      toast.error(`Failed to record attendance: ${err.message}`);
    }
  };

  const initializeHR = async () => {
    try {
      await client.mutate({ mutation: INITIALIZE_HR_DB });
      await fetchEmployees();
      toast.success('HR Database initialized');
    } catch (err: any) {
      toast.error(`Initialization failed: ${err.message}`);
    }
  };

  const initializeUserDB = async () => {
    try {
      await client.mutate({ mutation: INITIALIZE_USER_DB });
      toast.success('User Database initialized');
    } catch (err: any) {
      toast.error(`User Init failed: ${err.message}`);
    }
  };

  const initializeLogsDB = async () => {
    try {
      await client.mutate({ mutation: INITIALIZE_LOGS_DB });
      toast.success('Logs Database initialized');
    } catch (err: any) {
      toast.error(`Logs Init failed: ${err.message}`);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await client.mutate({
        mutation: UPDATE_SETTING,
        variables: { key, value }
      });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (err: any) {
      toast.error(`Setting update failed: ${err.message}`);
    }
  };

  const initializeSettingsDB = async () => {
    try {
      await client.mutate({ mutation: INITIALIZE_SETTINGS_DB });
      toast.success('Settings Database initialized');
    } catch (err: any) {
      toast.error(`Settings Init failed: ${err.message}`);
    }
  };

  const getSystemTelemetry = useCallback(async () => {
    try {
      const { data } = await client.query({ 
        query: GET_SYSTEM_TELEMETRY,
        fetchPolicy: 'network-only'
      });
      return data.getSystemTelemetry;
    } catch (err) {
      console.error('Telemetry Fetch Failed:', err);
      return null;
    }
  }, []);

  const backupDatabase = useCallback(async () => {
    try {
      const { data } = await client.mutate({ mutation: BACKUP_DATABASE });
      return data.backupDatabase;
    } catch (err) {
      console.error('Backup Mutation Failed:', err);
      throw err;
    }
  }, []);

  const testNotifications = useCallback(async (email: string) => {
    try {
      await client.mutate({ 
        mutation: TEST_NOTIFICATION_SETTINGS,
        variables: { email }
      });
      toast.success('Verification Email Sent Successfully');
    } catch (err: any) {
      toast.error(`Notification Test Failed: ${err.message}`);
      throw err;
    }
  }, []);

  const addRole = async (role: { name: string; description?: string }) => {
    try {
      await client.mutate({
        mutation: ADD_ROLE,
        variables: { ...role }
      });
      await fetchRoles();
      toast.success('Role added successfully');
    } catch (err: any) {
      toast.error(`Failed to add role: ${err.message}`);
    }
  };

  const addPromotion = async (p: Omit<Promotion, 'id' | 'isActive'>) => {
    try {
      await withLoading('CONFIGURING_PROMOTION', async () => {
        await client.mutate({
          mutation: ADD_PROMOTION,
          variables: { ...p }
        });
        await fetchPromotions();
        toast.success(p.productIds?.length ? `Targeted Promotion: ${p.name} Active` : 'Store-wide Promotion Scheduled');
      }, true);
    } catch (err) {
      console.error('[addPromotion] Execution Failed:', err);
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      await withLoading('REMOVING_PROMOTION', async () => {
        await client.mutate({
          mutation: DELETE_PROMOTION,
          variables: { id }
        });
        await fetchPromotions();
        toast.info('Promotion removed');
      }, true);
    } catch (err) {
      console.error('[deletePromotion] Execution Failed:', err);
    }
  };

  const togglePromotion = async (id: string) => {
    try {
      await withLoading('TOGGLING_PROMOTION_STATUS', async () => {
        await client.mutate({
          mutation: TOGGLE_PROMOTION,
          variables: { id }
        });
        await fetchPromotions();
      }, true);
    } catch (err) {
      console.error('[togglePromotion] Execution Failed:', err);
    }
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>) => {
    try {
      await withLoading('UPDATING_PROMOTION_CONFIG', async () => {
        await client.mutate({
          mutation: UPDATE_PROMOTION,
          variables: { id, ...updates }
        });
        await fetchPromotions();
        toast.success('Promotion updated');
      }, true);
    } catch (err) {
      console.error('[updatePromotion] Execution Failed:', err);
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await client.mutate({
        mutation: DELETE_ROLE,
        variables: { id }
      });
      await fetchRoles();
      toast.success('Role deleted');
    } catch (err: any) {
      toast.error(`Failed to delete role: ${err.message}`);
    }
  };

  const addSupplier = async (supplier: { name: string; contact?: string; phone?: string; email?: string; }) => {
    try {
      await client.mutate({
        mutation: ADD_SUPPLIER,
        variables: { ...supplier }
      });
      await fetchSuppliers();
      toast.success('Supplier added successfully');
    } catch (err: any) {
      toast.error(`Failed to add supplier: ${err.message}`);
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      await client.mutate({
        mutation: UPDATE_SUPPLIER,
        variables: { id, ...updates }
      });
      await fetchSuppliers();
      toast.success('Supplier updated successfully');
    } catch (err: any) {
      toast.error(`Failed to update supplier: ${err.message}`);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await client.mutate({
        mutation: DELETE_SUPPLIER,
        variables: { id }
      });
      await fetchSuppliers();
      toast.success('Supplier deleted');
    } catch (err: any) {
      toast.error(`Failed to delete supplier: ${err.message}`);
    }
  };

  const initializeInventoryDB = async () => {
    try {
      await client.mutate({ mutation: INITIALIZE_INVENTORY_DB });
      toast.success('Inventory Database initialized');
      await fetchSuppliers();
    } catch (err: any) {
      toast.error(`Inventory Init failed: ${err.message}`);
    }
  };

  const getInventoryTransactions = async (productId?: string, startDate?: string, endDate?: string): Promise<any[]> => {
    try {
      const { data } = await client.query({
        query: GET_INVENTORY_TRANSACTIONS,
        variables: { productId, startDate, endDate },
        fetchPolicy: 'network-only'
      });
      return data?.inventoryTransactions || [];
    } catch (err: any) {
      console.error('Fetch transactions error:', err);
      return [];
    }
  };

  const getCustomerPayments = async (customerId: string): Promise<any[]> => {
    try {
      const { data } = await client.query({
        query: GET_CUSTOMER_PAYMENTS,
        variables: { customerId },
        fetchPolicy: 'network-only'
      });
      return data?.customerPayments || [];
    } catch (err: any) {
      console.error('Fetch customer payments error:', err);
      return [];
    }
  };

  const getDailyDebtRecovered = async (): Promise<number> => {
    try {
      const { data } = await client.query({
        query: GET_DAILY_DEBT_RECOVERED,
        fetchPolicy: 'network-only'
      });
      return data?.dailyDebtRecovered || 0;
    } catch (err: any) {
      console.error('Fetch daily recovery error:', err);
      return 0;
    }
  };

  const addSystemLog = async (log: { action: string; target: string; oldValue?: string; newValue?: string }) => {
    try {
      await client.mutate({
        mutation: ADD_SYSTEM_LOG,
        variables: { ...log, userId: currentUser?.id }
      });
    } catch (err) {
      console.error('Logging error:', err);
    }
  };

  const recordReturn = async (ret: { saleId: string; productId: string; quantity: number; amount: number; reason?: string; date?: string; shiftId?: string }) => {
    try {
      await client.mutate({
        mutation: RECORD_RETURN,
        variables: {
          ...ret,
          amount: parseFloat(ret.amount.toString())
        }
      });
      await fetchProducts();
      await fetchSales();
      await fetchReturns();
      toast.success('Return recorded successfully');
    } catch (err: any) {
      toast.error(`Return failed: ${err.message}`);
    }
  };

  const openShift = async (openingCash: number) => {
    try {
      const { data } = await client.mutate({
        mutation: OPEN_SHIFT,
        variables: { openingCash }
      });
      setActiveShift(data.openShift);
      toast.success('Shift opened successfully');
    } catch (err: any) {
      toast.error(`Failed to open shift: ${err.message}`);
    }
  };

  const closeShift = async (id: string, actualCash: number) => {
    try {
      const { data } = await client.mutate({
        mutation: CLOSE_SHIFT,
        variables: { id, actualCash }
      });
      setActiveShift(null);
      toast.success('Shift closed. Variance: ' + (data.closeShift.variance));
      return data.closeShift;
    } catch (err: any) {
      toast.error(`Shift closure failed: ${err.message}`);
    }
  };

  const getShiftExpected = async (id: string) => {
    try {
      const { data } = await client.query({
        query: GET_SHIFT_EXPECTED,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      return data.getShiftExpected;
    } catch (err: any) {
      console.error('getShiftExpected error:', err);
      return null;
    }
  };

  const fetchAuditLogs = async (startDate?: string, endDate?: string) => {
    const { data } = await client.query({ query: GET_AUDIT_LOGS, variables: { startDate, endDate }, fetchPolicy: 'network-only' });
    return data?.auditLogs || [];
  };

  const fetchSaleReturns = async (startDate?: string, endDate?: string) => {
    const { data } = await client.query({ query: GET_SALE_RETURNS, variables: { startDate, endDate }, fetchPolicy: 'network-only' });
    return data?.saleReturns || [];
  };

  const fetchCashierShifts = async (startDate?: string, endDate?: string) => {
    const { data } = await client.query({ query: GET_CASHIER_SHIFTS, variables: { startDate, endDate }, fetchPolicy: 'network-only' });
    return data?.cashierShifts || [];
  };

  const getActiveShift = async (cashierId: string) => {
    const { data } = await client.query({ query: GET_ACTIVE_SHIFT, variables: { cashierId }, fetchPolicy: 'network-only' });
    return data?.activeShift;
  };

  const fetchProfitReport = async (start: string, end: string) => {
    try {
      const { data } = await client.query({
        query: GET_PROFIT_REPORT,
        variables: { startDate: start, endDate: end },
        fetchPolicy: 'network-only'
      });
      return data?.getProfitReport || [];
    } catch (err: any) {
      console.error('fetchProfitReport error:', err);
      return [];
    }
  };

  const searchSaleByInvoice = async (invoiceId: string): Promise<Sale | null> => {
    try {
      // Use existing GET_SALES with search parameter to find the specific sale
      const { data } = await client.query({
        query: GET_SALES,
        variables: { search: invoiceId },
        fetchPolicy: 'network-only' // Always fetch fresh to prevent bypass
      });
      // The search might return multiple if the ID is typed partially, so we find the exact match
      const sale = data?.sales?.find((s: Sale) => s.id === invoiceId) || data?.sales?.[0];
      return sale || null;
    } catch (err) {
      console.error('searchSaleByInvoice error:', err);
      return null;
    }
  };


  const contextValue = useMemo(() => ({
    products, sales, customers, suppliers, expenses, employees, attendance, roles,
    currentUser, loading: globalLoading || empLoading, isReady, isOffline,
    login, loginWithGoogle, logout, addProduct, updateProduct, retireProduct, adjustStock, addSale, addCustomer,

    updateCustomer, deleteCustomer, recordPayment,
    updateCustomerBalance, addExpense, deleteExpense,
    addEmployee, updateEmployee, refreshEmployees,
    addRole, deleteRole,
    recordAttendance, initializeHR, initializeUserDB, initializeLogsDB,
    settings, updateSetting, initializeSettingsDB,
    addSupplier, updateSupplier, deleteSupplier, initializeInventoryDB,
    getInventoryTransactions, getCustomerPayments, getDailyDebtRecovered,
    refreshInventory: async (silent = true) => {
      try {
        await withLoading(silent ? undefined : 'SYNCING_INVENTORY', async () => {
          await fetchProducts();
        }, false);
        if (!silent) toast.info('Inventory synchronized');
      } catch (err: any) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable' : err.message;
        toast.error(`Sync Failed: ${friendlyMsg}`);
      }
    },
    refreshSuppliers: async (silent = true) => {
      try {
        await withLoading(silent ? undefined : 'SYNCING_SUPPLIERS', async () => {
          await fetchSuppliers();
        }, false);
        if (!silent) toast.info('Suppliers synchronized');
      } catch (err: any) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable' : err.message;
        toast.error(`Sync Failed: ${friendlyMsg}`);
      }
    },
    refreshSales: async (startDate?: string, endDate?: string, search?: string, silent = true) => {
      try {
        const start = startDate || getPastLocalDateString(6);
        const end = endDate || getLocalDateString();
        await withLoading(silent ? undefined : 'SYNCING_SALES_LEDGER', async () => {
          await fetchSales(start, end, search);
        }, false);
        if (!silent) toast.info('Sales ledger synchronized');
      } catch (err: any) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable' : err.message;
        toast.error(`Sync Failed: ${friendlyMsg}`);
      }
    },
    refreshExpenses: async (startDate?: string, endDate?: string, search?: string, silent = true) => {
      try {
        const start = startDate || getPastLocalDateString(6);
        const end = endDate || getLocalDateString();
        await withLoading(silent ? undefined : 'SYNCING_EXPENSE_LEDGER', async () => {
          await fetchExpenses(start, end, search);
        }, false);
        if (!silent) toast.info('Expense ledger synchronized');
      } catch (err: any) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable' : err.message;
        toast.error(`Sync Failed: ${friendlyMsg}`);
      }
    },
    updateExpense,
    addSystemLog,
    recordReturn,
    saleReturns,
    refreshReturns: async (startDate?: string, endDate?: string, silent = true) => {
      try {
        const start = startDate || getPastLocalDateString(6);
        const end = endDate || getLocalDateString();
        await withLoading(silent ? undefined : 'SYNCING_RETURNS_LEDGER', async () => {
          await fetchReturns(start, end);
        }, false);
        if (!silent) toast.info('Returns ledger synchronized');
      } catch (err: any) {
        const friendlyMsg = err.message === 'Failed to fetch' ? 'Server unreachable' : err.message;
        toast.error(`Sync Failed: ${friendlyMsg}`);
      }
    },
    openShift,
    closeShift,
    fetchAuditLogs,
    fetchSaleReturns,
    fetchCashierShifts,
    getActiveShift,
    activeShift,
    loadingStatus,
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    fetchPromotions,
    fetchProfitReport,
    getShiftExpected,
    searchSaleByInvoice,
    customerPayments,
    refreshAllCustomerPayments,
    deleteCustomerPayment,
    getSystemTelemetry,
    backupDatabase,
    testNotifications,
    isSalesLoading,
    cart,
    setCart,
    posDiscount,
    setPosDiscount,
    selectedCustomerId,
    setSelectedCustomerId,
    paymentMethod,
    setPaymentMethod,
    withLoading,
  }), [
    products, sales, customers, suppliers, expenses, employees, attendance, roles,
    currentUser, globalLoading, empLoading, isReady, isOffline, login, loginWithGoogle, logout, addProduct, updateProduct, 
    retireProduct, adjustStock, addSale, addCustomer, updateCustomer, deleteCustomer, 
    recordPayment, updateCustomerBalance, addExpense, deleteExpense, addEmployee,
    customerPayments, refreshAllCustomerPayments,
    updateEmployee, refreshEmployees, addRole, deleteRole, recordAttendance, 
    initializeHR, initializeUserDB, initializeLogsDB, settings, updateSetting, 
    initializeSettingsDB, addSupplier, updateSupplier, deleteSupplier, 
    initializeInventoryDB, getInventoryTransactions, getCustomerPayments, 
    getDailyDebtRecovered, withLoading, fetchProducts, fetchSuppliers, 
    fetchSales, fetchExpenses, updateExpense, addSystemLog, recordReturn, saleReturns, 
    fetchReturns, openShift, closeShift, fetchAuditLogs, fetchSaleReturns, 
    fetchCashierShifts, getActiveShift, activeShift, loadingStatus, fetchProfitReport,
    searchSaleByInvoice, promotions, addPromotion, updatePromotion, deletePromotion, togglePromotion, fetchPromotions,
    getShiftExpected,
    deleteCustomerPayment,
    getSystemTelemetry,
    backupDatabase,
    testNotifications,
    isSalesLoading,
    cart,
    posDiscount,
    selectedCustomerId,
    paymentMethod
  ]);

  return (
    <ApolloProvider client={client}>
      <HardwareContext.Provider value={contextValue}>
        {children}
      </HardwareContext.Provider>
    </ApolloProvider>
  );
};

export const useHardware = () => {
  const context = useContext(HardwareContext);
  if (!context) throw new Error('useHardware must be used within HardwareProvider');
  return context;
};
