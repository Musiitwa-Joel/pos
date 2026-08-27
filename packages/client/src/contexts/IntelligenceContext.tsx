import React, { createContext, useContext } from 'react';
import { observable, computed } from "@legendapp/state";
import { observer } from '@legendapp/state/react';
import { useHardware } from '../HardwareContext';

// 🚀 [VANGUARD] Intelligence Core:
// High-performance analytical engine powered by Legend-State.
// Computes complex financial telemetry in the background without React re-renders.
export const intelligenceState$ = observable({
  now: Date.now(),
});

// [Ticker] Keeps 'Today' boundaries accurate
setInterval(() => intelligenceState$.now.set(Date.now()), 60000);

interface IntelligenceContextType {
  stats$: any;
  chartData$: any;
  combinedLogs$: any;
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export const IntelligenceProvider = observer(({ children }: { children: React.ReactNode }) => {
  const hardware = useHardware();

  // 🛡️ [VANGUARD] Data Integrity Guard:
  // Ensure the intelligence feed isn't empty on first load.
  React.useEffect(() => {
    if (hardware.isReady && (hardware.salesState$.sales.get() || []).length === 0) {
      console.log('INTELLIGENCE_CORE: DETECTED_EMPTY_FEED // INITIATING_EMERGENCY_SYNC');
      hardware.refreshSales();
      hardware.refreshInventory();
      hardware.refreshExpenses();
      hardware.refreshSuppliers();
    }
  }, [hardware.isReady]);

  // 🧠 [VANGUARD] Analytical Computations
  const stats$ = computed(() => {
    const now = intelligenceState$.now.get();
    const todayMillis = new Date(now).setHours(0, 0, 0, 0);
    
    const sales = hardware.salesState$.sales.get() || [];
    const returns = hardware.salesState$.saleReturns.get() || [];
    const expenses = hardware.financeState$.expenses.get() || [];
    const products = hardware.inventoryState$.products.get() || [];
    const customers = hardware.financeState$.customers.get() || [];
    const suppliers = hardware.financeState$.suppliers.get() || [];
    const attendance = hardware.hrState$.attendance.get() || [];

    const todaySales = sales.filter(s => {
      const sDate = s.createdAt ? new Date(s.createdAt).getTime() : (Number(s.timestamp) || 0);
      return sDate >= todayMillis;
    });

    const todayReturns = returns.filter(r => {
      const rDate = r.createdAt ? new Date(r.createdAt).getTime() : todayMillis;
      return rDate >= todayMillis;
    });

    const todayExpenses = expenses.filter(e => new Date(e.date).getTime() >= todayMillis)
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const todayRefunds = todayReturns.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    // High-Speed Matrix Operations
    const productMap = new Map();
    products.forEach(p => productMap.set(p.id, p));

    const grossTotal = todaySales.reduce((acc, s) => acc + (parseFloat(s.subtotal as any) || (parseFloat(s.total as any) + (parseFloat(s.discount as any) || 0))), 0);
    const totalDiscounts = todaySales.reduce((acc, s) => acc + (parseFloat(s.discount as any) || 0), 0);
    const netRevenue = (grossTotal - totalDiscounts) - todayRefunds;

    const cogs = todaySales.reduce((acc, s) => {
      const saleCost = (s.items || []).reduce((itemAcc, item) => {
        const product = productMap.get(item.productId);
        const itemCost = parseFloat(item.costPrice as any) || parseFloat(product?.costPrice as any) || 0;
        return itemAcc + (itemCost * item.quantity);
      }, 0);
      return acc + saleCost;
    }, 0);

    const returnCogs = todayReturns.reduce((acc, r) => {
      const product = productMap.get(r.productId);
      return acc + ((product?.costPrice || 0) * r.quantity);
    }, 0);

    const grossProfit = netRevenue - (cogs - returnCogs);
    const netProfit = grossProfit - todayExpenses;

    return {
      netProfit,
      netRevenue,
      todayExpenses,
      inventoryValue: products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0),
      totalPayables: suppliers.reduce((acc, s) => acc + s.balance, 0),
      totalReceivables: customers.reduce((acc, c) => acc + c.balance, 0),
      lowStockCount: products.filter(p => p.stock <= p.minStock).length,
      stockOutCount: products.filter(p => p.stock === 0).length,
      staffPresent: attendance.filter(a => new Date(a.date).setHours(0,0,0,0) === todayMillis && (a.status === 'present' || a.status === 'late')).length
    };
  });

  const chartData$ = computed(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const buckets = new Map();
    const now = intelligenceState$.now.get();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      buckets.set(dayStart, { name: days[new Date(dayStart).getDay()], revenue: 0, profit: 0, expenses: 0, cogs: 0 });
    }

    const sales = hardware.salesState$.sales.get() || [];
    const expenses = hardware.financeState$.expenses.get() || [];
    const returns = hardware.salesState$.saleReturns.get() || [];
    const products = hardware.inventoryState$.products.get() || [];
    
    const productMap = new Map();
    products.forEach(p => productMap.set(p.id, p));

    sales.forEach(s => {
      const sDate = s.createdAt ? new Date(s.createdAt).getTime() : s.timestamp;
      const dayKey = new Date(sDate).setHours(0, 0, 0, 0);
      if (buckets.has(dayKey)) {
        const b = buckets.get(dayKey);
        b.revenue += s.total;
        b.cogs += s.items.reduce((acc, item) => acc + ((item.costPrice || productMap.get(item.productId)?.costPrice || 0) * item.quantity), 0);
      }
    });

    expenses.forEach(e => {
      const dayKey = new Date(e.date).setHours(0, 0, 0, 0);
      if (buckets.has(dayKey)) buckets.get(dayKey).expenses += e.amount;
    });

    returns.forEach(r => {
      const dayKey = new Date(r.createdAt).setHours(0, 0, 0, 0);
      if (buckets.has(dayKey)) {
        const b = buckets.get(dayKey);
        b.revenue -= (Number(r.amount) || 0);
        b.cogs -= ((productMap.get(r.productId)?.costPrice || 0) * r.quantity);
      }
    });

    return Array.from(buckets.values()).map(b => ({ ...b, profit: b.revenue - b.cogs - b.expenses }));
  });

  const combinedLogs$ = computed(() => {
    const sales = (hardware.salesState$.sales.get() || []).map(s => ({ ...s, type: 'SALE', sortDate: s.createdAt ? new Date(s.createdAt).getTime() : (Number(s.timestamp) || 0) }));
    const expenses = (hardware.financeState$.expenses.get() || []).map(e => ({ ...e, type: 'EXPENSE', sortDate: new Date(e.date).getTime() }));
    const returns = (hardware.salesState$.saleReturns.get() || []).map(r => ({ ...r, type: 'RETURN', sortDate: new Date(r.createdAt).getTime(), total: r.amount }));
    
    return [...sales, ...expenses, ...returns].sort((a, b) => b.sortDate - a.sortDate).slice(0, 5);
  });

  return (
    <IntelligenceContext.Provider value={{ stats$, chartData$, combinedLogs$ }}>
      {children}
    </IntelligenceContext.Provider>
  );
});

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) throw new Error('useIntelligence must be used within IntelligenceProvider');
  return context;
};
