import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Truck,
  DollarSign,
  UserCog,
  Percent,
  RotateCcw,
  ShoppingCart,
  Layers,
  Landmark,
  Tag,
  ShieldCheck,
  Calendar,
  Download,
  Printer,
  ChevronLeft,
  ArrowRight,
  Search,
  Filter,
  History,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
  TrendingDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useHardware } from "../HardwareContext";
import {
  formatCurrency,
  cn,
  getLocalDateString,
  exportToCSV,
} from "../lib/utils";
import { generateBrandedReport } from "./ReportBranding";
import DatePicker from "./DatePicker";
import ReturnsReport from "./reports/ReturnsReport";
import PurchaseReport from "./reports/PurchaseReport";
import CashFlowReport from "./reports/CashFlowReport";
import CashierShiftsReport from "./reports/CashierShiftsReport";
import ProfitMarginReport from "./reports/ProfitMarginReport";
import InventoryReport from "./reports/InventoryReport";
import SalesReport from "./reports/SalesReport";
import FinancialReport from "./reports/FinancialReport";
import SecurityAuditTrail from "./reports/SecurityAuditTrail";
import CategorySalesReport from "./reports/CategorySalesReport";
import DiscountAuditReport from "./reports/DiscountAuditReport";
import PromotionManager from "./PromotionManager";

type ReportType =
  | "SALES_SUMMARY"
  | "PRODUCT_PERFORMANCE"
  | "INVENTORY_STOCK"
  | "LOW_STOCK"
  | "CREDIT_SALES"
  | "SUPPLIER_PAYABLES"
  | "CASH_FLOW"
  | "DAILY_CASHIER"
  | "PROFIT_MARGIN"
  | "RETURNS_REFUNDS"
  | "PURCHASE_REPORT"
  | "SALES_BY_CATEGORY"
  | "DISCOUNT_REPORT"
  | "AUDIT_TRAIL"
  | "PROMOTION_MANAGER";

interface ReportMetadata {
  id: ReportType;
  label: string;
  description: string;
  icon: any;
  color: string;
  category: "Financial" | "Inventory" | "Operations" | "Security";
}

const REPORTS_METADATA: ReportMetadata[] = [
  {
    id: "SALES_SUMMARY",
    label: "Sales Summary",
    description: "Tracks total revenue and transaction volume over time.",
    icon: TrendingUp,
    color: "text-orange-500",
    category: "Financial",
  },
  {
    id: "PRODUCT_PERFORMANCE",
    label: "Product Performance",
    description: "Identifies best-selling and slow-moving items.",
    icon: ShoppingCart,
    color: "text-blue-500",
    category: "Inventory",
  },
  {
    id: "INVENTORY_STOCK",
    label: "Inventory Stock",
    description: "Reconciles opening, sold, and closing stock levels.",
    icon: Package,
    color: "text-emerald-500",
    category: "Inventory",
  },
  {
    id: "LOW_STOCK",
    label: "Low Stock Alert",
    description: "Highlights items that need immediate restocking.",
    icon: Package,
    color: "text-rose-500",
    category: "Inventory",
  },
  {
    id: "CREDIT_SALES",
    label: "Credit & Debt",
    description: "Tracks outstanding balances and customer credit aging.",
    icon: Users,
    color: "text-purple-500",
    category: "Financial",
  },
  {
    id: "SUPPLIER_PAYABLES",
    label: "Supplier Payables",
    description: "Manages money owed and procurement deadlines.",
    icon: Truck,
    color: "text-amber-500",
    category: "Financial",
  },
  {
    id: "CASH_FLOW",
    label: "Cash Flow",
    description: "Monitors net operational liquidity and outflows.",
    icon: Landmark,
    color: "text-cyan-500",
    category: "Financial",
  },
  {
    id: "DAILY_CASHIER",
    label: "Daily Cashier",
    description: "Audits cashier shifts and detects cash variances.",
    icon: UserCog,
    color: "text-indigo-500",
    category: "Operations",
  },
  {
    id: "PROFIT_MARGIN",
    label: "Profit Margin",
    description: "Analyzes profitability per unit and total profit.",
    icon: Percent,
    color: "text-lime-500",
    category: "Financial",
  },
  {
    id: "RETURNS_REFUNDS",
    label: "Returns & Refunds",
    description: "Tracks reversed sales and faulty product returns.",
    icon: RotateCcw,
    color: "text-red-500",
    category: "Operations",
  },
  {
    id: "PURCHASE_REPORT",
    label: "Purchase History",
    description: "Log of all goods procured from suppliers.",
    icon: Package,
    color: "text-sky-500",
    category: "Inventory",
  },
  {
    id: "SALES_BY_CATEGORY",
    label: "Category Sales",
    description: "Performance breakdown by hardware department.",
    icon: Layers,
    color: "text-fuchsia-500",
    category: "Inventory",
  },
  {
    id: "DISCOUNT_REPORT",
    label: "Discount Audit",
    description: "Monitors manual price overrides and discounts.",
    icon: Tag,
    color: "text-yellow-500",
    category: "Security",
  },
  {
    id: "PROMOTION_MANAGER",
    label: "Promotion Scheduling",
    description: "Configure timed events (30m, 24h, 1w) & flash sales.",
    icon: Zap,
    color: "text-brand-accent",
    category: "Operations",
  },
  {
    id: "AUDIT_TRAIL",
    label: "System Audit Trail",
    description: "Comprehensive log of all administrative actions.",
    icon: ShieldCheck,
    color: "text-slate-800 dark:text-slate-400",
    category: "Security",
  },
];

export default function Reports() {
  const {
    products,
    sales,
    saleReturns,
    customers,
    suppliers,
    expenses,
    employees,
    customerPayments,
    refreshAllCustomerPayments,
    refreshSales,
    refreshReturns,
    refreshExpenses,
    refreshEmployees,
    fetchCashierShifts,
    fetchProfitReport,
    fetchAuditLogs,
    getInventoryTransactions,
    promotions,
    isOffline,
    settings,
  } = useHardware();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cashierShifts, setCashierShifts] = useState<any[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [profitReportData, setProfitReportData] = useState<{
    dateTrends: any[];
    productPerformance: any[];
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const today = getLocalDateString();
  const [dateRange, setDateRange] = useState({
    start: today,
    end: today,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "All" | "Financial" | "Inventory" | "Operations" | "Security"
  >("All");

  React.useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
        const { start: startDate, end: endDate } = dateRange;
        if (!startDate || !endDate) return;

        await Promise.all([
          refreshSales(startDate, endDate).catch((e) =>
            console.error("Sales fetch failure:", e),
          ),
          refreshReturns(startDate, endDate).catch((e) =>
            console.error("Returns fetch failure:", e),
          ),
          refreshExpenses(startDate, endDate).catch((e) =>
            console.error("Expenses fetch failure:", e),
          ),
          refreshAllCustomerPayments(startDate, endDate).catch((e) =>
            console.error("Payments fetch failure:", e),
          ),
          refreshEmployees(true).catch((e) =>
            console.error("Employees fetch failure:", e),
          ),
          (async () => {
            try {
              const shifts = await fetchCashierShifts(startDate, endDate);
              setCashierShifts(shifts);
            } catch (e) {
              console.error("Shifts fetch failure:", e);
            }
          })(),
          (async () => {
            try {
              if (selectedReport === "PROFIT_MARGIN") {
                const report = await fetchProfitReport(startDate, endDate);
                setProfitReportData(report as any);
              }
              if (selectedReport === "PURCHASE_REPORT") {
                const txns = await getInventoryTransactions(
                  undefined,
                  startDate,
                  endDate,
                );
                setPurchaseHistory(txns);
              }
              if (selectedReport === "AUDIT_TRAIL") {
                const logs = await fetchAuditLogs(startDate, endDate);
                setAuditLogs(logs);
              }
            } catch (e) {
              console.error("Report-specific fetch failure:", e);
            }
          })(),
        ]);
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchData();
  }, [dateRange.start, dateRange.end, selectedReport]);

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const filteredMetadata = useMemo(() => {
    if (activeCategory === "All") return REPORTS_METADATA;
    return REPORTS_METADATA.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const handleExportCSV = () => {
    if (!selectedReport) return;

    let headers: string[] = [];
    let data: any[][] = [];

    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    switch (selectedReport) {
      case "SALES_SUMMARY":
        headers = ["ID", "TIMESTAMP", "METHOD", "TOTAL"];
        data = sales
          .filter((s) => {
            const d = new Date(s.createdAt || s.timestamp).getTime();
            return d >= startTs && d <= endTs;
          })
          .map((s) => [
            s.id,
            new Date(s.createdAt || s.timestamp).toLocaleString(),
            s.paymentMethod,
            s.total,
          ]);
        break;
      case "PRODUCT_PERFORMANCE":
        headers = ["RANK", "NAME", "QTY_SOLD", "REVENUE"];
        data = (productStats as any[]).map((s, i) => [
          i + 1,
          s.name,
          s.qty,
          s.revenue,
        ]);
        break;
      case "INVENTORY_STOCK":
        headers = [
          "NAME",
          "CATEGORY",
          "SKU",
          "STOCK",
          "UNIT",
          "PRICE",
          "VALUATION",
        ];
        data = products.map((p) => [
          p.name,
          p.category,
          p.barcode || "N/A",
          p.stock,
          p.unit,
          p.price,
          p.price * p.stock,
        ]);
        break;
      case "LOW_STOCK":
        headers = ["NAME", "STOCK", "MIN_STOCK", "SUGGESTED_ORDER"];
        data = products
          .filter((p) => p.stock <= p.minStock)
          .map((p) => [p.name, p.stock, p.minStock, p.minStock * 2 - p.stock]);
        break;
      case "CREDIT_SALES":
        headers = ["CUSTOMER", "PHONE", "BALANCE", "LIMIT", "RISK"];
        data = customers.map((c) => [
          c.name,
          c.phone,
          c.balance,
          c.creditLimit,
          c.balance > c.creditLimit * 0.8 ? "HIGH" : "LOW",
        ]);
        break;
      case "SUPPLIER_PAYABLES":
        headers = ["SUPPLIER", "PHONE", "BALANCE", "TOTAL_ORDERS"];
        data = suppliers.map((s) => [
          s.name,
          s.phone || "N/A",
          s.balance || 0,
          s.totalOrders || 0,
        ]);
        break;
      case "CASH_FLOW":
        headers = ["DATE", "INFLOW", "OUTFLOW", "NET"];
        data = cashFlow.daily.map((d) => [
          d.date,
          d.inflow,
          d.outflow,
          d.inflow - d.outflow,
        ]);
        break;
      case "DAILY_CASHIER":
        headers = [
          "SHIFT_ID",
          "CASHIER",
          "START",
          "END",
          "EXPECTED",
          "ACTUAL",
          "VARIANCE",
        ];
        data = cashierShifts.map((s) => [
          s.id,
          s.cashierId,
          s.startTime,
          s.endTime || "ACTIVE",
          s.expectedCash || 0,
          s.actualCash || 0,
          (s.actualCash || 0) - (s.expectedCash || 0),
        ]);
        break;
      case "PROFIT_MARGIN":
        headers = ["PRODUCT", "QTY", "REVENUE", "COST", "PROFIT", "MARGIN_%"];
        data = profitStats.products.map((p) => {
          const margin = (p.profit / (p.revenue || 1)) * 100;
          return [
            p.name,
            p.qty,
            p.revenue,
            p.cost,
            p.profit,
            margin.toFixed(2),
          ];
        });
        break;
      case "RETURNS_REFUNDS":
        headers = ["DATE", "PRODUCT", "QTY", "AMOUNT", "REASON"];
        data = saleReturns
          .filter((r) => {
            const d = new Date(r.createdAt).getTime();
            return d >= startTs && d <= endTs;
          })
          .map((r) => [
            new Date(r.createdAt).toLocaleString(),
            productMap.get(r.productId)?.name || "UNKNOWN",
            r.quantity,
            r.amount,
            r.reason,
          ]);
        break;
      case "PURCHASE_REPORT":
        headers = ["DATE", "PRODUCT", "SUPPLIER", "QTY", "COST", "TOTAL"];
        data = purchaseHistory
          .filter((t) => t.type === "stock_in" || t.type === "purchase")
          .map((t) => {
            const product = productMap.get(t.productId);
            const cost = t.unitCost || product?.costPrice || 0;
            return [
              new Date(t.createdAt).toLocaleString(),
              product?.name || "UNKNOWN",
              t.referenceId || "N/A",
              t.quantity,
              cost,
              cost * t.quantity,
            ];
          });
        break;
      case "SALES_BY_CATEGORY":
        headers = ["CATEGORY", "QTY", "REVENUE", "COST", "PROFIT", "MARGIN_%"];
        data = categoryStats.map((s) => {
          const margin = s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;
          return [
            s.category,
            s.qty,
            s.revenue,
            s.cost,
            s.profit,
            margin.toFixed(2),
          ];
        });
        break;
      case "DISCOUNT_REPORT":
        headers = [
          "DATE",
          "SALE_ID",
          "CASHIER",
          "NET_SUBTOTAL",
          "PROMO",
          "NET_DISCOUNT",
          "%",
          "STATUS",
        ];
        data = sales
          .filter((s) => (s.discount || 0) > 0)
          .map((s) => {
            const cashier =
              employees.find((e) => e.id === s.cashierId)?.name ||
              s.cashierName ||
              "System";
            const originalSubtotal = s.subtotal || 1;
            const discountRate = (s.discount || 0) / originalSubtotal;

            const netSubtotal =
              s.items?.reduce((acc: number, item: any) => {
                const remainingQty =
                  (item.quantity || 0) - (item.returnedQuantity || 0);
                return acc + remainingQty * (item.unitPrice || 0);
              }, 0) || 0;

            const netDiscount = netSubtotal * discountRate;
            const isPartiallyReturned = s.items?.some(
              (i: any) => (i.returnedQuantity || 0) > 0,
            );
            const status =
              isPartiallyReturned && netSubtotal <= 0
                ? "FULLY_REVERSED"
                : isPartiallyReturned
                  ? "PARTIALLY_RECOVERED"
                  : "ACTIVE";

            const pct = (s.discount / originalSubtotal) * 100;
            return [
              new Date(s.createdAt || s.timestamp).toLocaleString(),
              s.id,
              cashier,
              netSubtotal,
              s.promoName || "MANUAL",
              netDiscount,
              pct.toFixed(1),
              status,
            ];
          });
        break;
    }

    if (data.length > 0) {
      exportToCSV(selectedReport, headers, data);
      toast.success(`EXPORTED_${data.length}_RECORDS_TO_CSV`);
    } else {
      toast.error("NO_DATA_AVAILABLE_FOR_EXPORT");
    }
  };

  const handlePrint = async () => {
    if (!selectedReport) return;

    let dataForPrint: any[] = [];
    let totalValue = 0;

    switch (selectedReport) {
      case "SALES_SUMMARY":
        dataForPrint = sales.filter((s) => {
          const d = s.createdAt || s.timestamp;
          if (!d) return false;
          const sellDate = new Date(d).getTime();
          const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
          const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);
          return sellDate >= startTs && sellDate <= endTs;
        });
        totalValue = salesSummary.totalRevenue;
        break;
      case "PRODUCT_PERFORMANCE":
        dataForPrint = productStats;
        totalValue = salesSummary.totalRevenue;
        break;
      case "INVENTORY_STOCK":
        dataForPrint = products;
        totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
        break;
      case "LOW_STOCK":
        dataForPrint = products.filter((p) => p.stock <= p.minStock);
        totalValue = dataForPrint.reduce(
          (acc, p) => acc + (p.minStock * 2 - p.stock) * p.costPrice,
          0,
        );
        break;
      case "CREDIT_SALES":
        dataForPrint = customers;
        totalValue = customers.reduce((acc, c) => acc + c.balance, 0);
        break;
      case "SUPPLIER_PAYABLES":
        dataForPrint = suppliers;
        totalValue = suppliers.reduce((acc, s) => acc + (s.balance || 0), 0);
        break;
      case "AUDIT_TRAIL":
        const logs = await fetchAuditLogs(dateRange.start, dateRange.end);
        dataForPrint = logs;
        break;
      case "CASH_FLOW":
        dataForPrint = cashFlow.daily;
        totalValue = cashFlow.netCash;
        break;
      case "DAILY_CASHIER":
        dataForPrint = cashierShifts.map((s) => {
          const shiftSales = (sales || []).filter((sale) => {
            const saleTime = new Date(sale.createdAt).getTime();
            const shiftStart = new Date(s.startTime).getTime();
            const shiftEnd = s.endTime
              ? new Date(s.endTime).getTime()
              : Date.now();
            return (
              (sale.cashierId === s.cashierId ||
                (sale.cashierName && sale.cashierName.includes(s.cashierId))) &&
              saleTime >= shiftStart &&
              saleTime <= shiftEnd
            );
          });
          const calculatedSalesTotal = shiftSales.reduce(
            (acc, sale) => acc + (sale.total || 0),
            0,
          );
          const expectedCash = (s.openingCash || 0) + calculatedSalesTotal;
          return {
            ...s,
            expectedCash,
            variance: s.status === "CLOSED" ? s.actualCash - expectedCash : 0,
          };
        });
        totalValue = cashierStats.totalVariance;
        break;
      case "PROFIT_MARGIN":
        dataForPrint = profitStats.products;
        totalValue = profitStats.totalProfit;
        break;
      case "RETURNS_REFUNDS":
        dataForPrint = saleReturns;
        totalValue = dataForPrint.reduce(
          (acc, r) => acc + (Number(r.amount) || 0),
          0,
        );
        break;
      case "PURCHASE_REPORT":
        const purchases = purchaseHistory.filter(
          (t) => t.type === "stock_in" || t.type === "purchase",
        );
        dataForPrint = purchases;
        totalValue = purchases.reduce((acc, t) => {
          const cost =
            t.unitCost ||
            productMap.get(t.productId)?.costPrice ||
            0;
          return acc + cost * (t.quantity || 0);
        }, 0);
        break;
      case "SALES_BY_CATEGORY":
        dataForPrint = categoryStats;
        totalValue = categoryStats.reduce((acc, s) => acc + s.revenue, 0);
        break;
      case "DISCOUNT_REPORT":
        dataForPrint = sales
          .filter((s) => (s.discount || 0) > 0)
          .map((s) => {
            const originalSubtotal = s.subtotal || 1;
            const discountRate = (s.discount || 0) / originalSubtotal;
            const netSubtotal =
              s.items?.reduce((acc: number, item: any) => {
                const remainingQty =
                  (item.quantity || 0) - (item.returnedQuantity || 0);
                return acc + remainingQty * (item.unitPrice || 0);
              }, 0) || 0;
            const netDiscount = netSubtotal * discountRate;
            return { ...s, netSubtotal, netDiscount };
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.timestamp).getTime() -
              new Date(a.createdAt || a.timestamp).getTime(),
          );
        totalValue = dataForPrint.reduce(
          (acc, s) => acc + (s.netDiscount || 0),
          0,
        );
        break;
      case "PROMOTION_MANAGER":
        dataForPrint = promotions.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type === "percentage" ? `${p.value}% OFF` : `-USh ${p.value}`,
          scope: p.productIds?.length
            ? `${p.productIds.length} targeted products`
            : "Store-wide",
          startDate: new Date(p.startDate).toLocaleString(),
          endDate: new Date(p.endDate).toLocaleString(),
          status: !p.isActive
            ? "PAUSED"
            : new Date() < new Date(p.startDate)
              ? "SCHEDULED"
              : new Date() > new Date(p.endDate)
                ? "EXPIRED"
                : "LIVE",
        }));
        break;
      default:
        dataForPrint = [];
        break;
    }

    const currentMeta = REPORTS_METADATA.find((m) => m.id === selectedReport)!;
    const printHtml = generateBrandedReport(
      {
        label: currentMeta.label,
        description: currentMeta.description,
        id: currentMeta.id,
      },
      dataForPrint,
      settings,
      dateRange,
      { customers, products, totalValue, employees, cashierStats, suppliers },
    );

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "100vw";
    iframe.style.bottom = "100vh";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(printHtml);
    doc.close();

    toast.info("GENERATING_BRANDED_PRINT_LOG...");

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  const salesSummary = useMemo(() => {
    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const periodSales = sales.filter((s) => {
      const d = new Date(s.createdAt || s.timestamp).getTime();
      return d >= startTs && d <= endTs;
    });

    const periodReturns = saleReturns.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      return d >= startTs && d <= endTs;
    });

    const grossRevenue = periodSales.reduce((acc, s) => acc + s.total, 0);
    const totalRefunds = periodReturns.reduce(
      (acc, r) => acc + (Number(r.amount) || 0),
      0,
    );
    const netRevenue = grossRevenue - totalRefunds;

    return {
      totalRevenue: netRevenue,
      grossRevenue,
      totalRefunds,
      txCount: periodSales.length,
      avgValue: periodSales.length > 0 ? netRevenue / periodSales.length : 0,
      byMethod: periodSales.reduce((acc: any, s) => {
        const methodTotal = (acc[s.paymentMethod] || 0) + s.total;
        return { ...acc, [s.paymentMethod]: methodTotal };
      }, {}),
    };
  }, [sales, saleReturns, dateRange]);

  const productStats = useMemo(() => {
    const stats: any = {};
    products.forEach((p) => {
      stats[p.id] = { id: p.id, name: p.name, qty: 0, revenue: 0 };
    });

    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const periodSales = sales.filter((s) => {
      const d = new Date(s.createdAt || s.timestamp).getTime();
      return d >= startTs && d <= endTs;
    });

    const periodReturns = saleReturns.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      return d >= startTs && d <= endTs;
    });

    periodSales.forEach((s) => {
      const saleSubtotal =
        Number(s.subtotal) ||
        s.items?.reduce(
          (acc, i) =>
            acc +
            Number(i.unitPrice || (i as any).price || 0) *
              Number(i.quantity || 0),
          0,
        ) ||
        1;
      const discountFactor = Number(s.total) / saleSubtotal;

      s.items?.forEach((item) => {
        const pId = item.productId || item.id;
        if (!stats[pId]) {
          stats[pId] = {
            id: pId,
            name: item.productName || item.name || `ITEM_${pId.slice(0, 8)}`,
            qty: 0,
            revenue: 0,
          };
        }

        const qty = Number(item.quantity) || 0;
        const price =
          Number(item.unitPrice) || Number((item as any).price) || 0;

        stats[pId].qty += qty;
        stats[pId].revenue += qty * price * discountFactor;
      });
    });

    periodReturns.forEach((r) => {
      if (stats[r.productId]) {
        stats[r.productId].qty -= Number(r.quantity) || 0;
        stats[r.productId].revenue -= Number(r.amount) || 0;
      }
    });

    return Object.values(stats).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [sales, products, saleReturns, dateRange, productMap]);

  const cashFlow = useMemo(() => {
    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const periodSales = sales.filter((s) => {
      const d = new Date(s.createdAt || s.timestamp).getTime();
      return d >= startTs && d <= endTs;
    });
    const periodExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date || e.createdAt).getTime();
      return d >= startTs && d <= endTs;
    });
    const periodReturns = saleReturns.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      return d >= startTs && d <= endTs;
    });
    const periodPayments = (customerPayments || []).filter((p) => {
      const d = new Date(p.createdAt).getTime();
      const method = (p.paymentMethod || "").toLowerCase();
      return (
        d >= startTs &&
        d <= endTs &&
        (method === "cash" || method === "cash-transaction")
      );
    });

    const totalInflow =
      periodSales.reduce((acc, s) => acc + s.total, 0) +
      periodPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalExpenses = periodExpenses.reduce(
      (acc: number, e: any) => acc + e.amount,
      0,
    );
    const totalRefunds = periodReturns.reduce(
      (acc, r) => acc + (Number(r.amount) || 0),
      0,
    );
    const totalOutflow = totalExpenses + totalRefunds;
    const netCash = totalInflow - totalOutflow;

    const getLocalDate = (d: any) => {
      if (!d) return "";
      const date = new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const dayMap: Record<
      string,
      { date: string; inflow: number; outflow: number }
    > = {};
    periodSales.forEach((s) => {
      const day = getLocalDate(s.createdAt || s.timestamp);
      if (!dayMap[day]) dayMap[day] = { date: day, inflow: 0, outflow: 0 };
      dayMap[day].inflow += s.total;
    });
    periodPayments.forEach((p) => {
      const day = getLocalDate(p.createdAt);
      if (!dayMap[day]) dayMap[day] = { date: day, inflow: 0, outflow: 0 };
      dayMap[day].inflow += p.amount;
    });
    periodExpenses.forEach((e: any) => {
      const day = getLocalDate(e.date || e.createdAt);
      if (!dayMap[day]) dayMap[day] = { date: day, inflow: 0, outflow: 0 };
      dayMap[day].outflow += e.amount;
    });
    periodReturns.forEach((r) => {
      const day = getLocalDate(r.createdAt);
      if (!dayMap[day]) dayMap[day] = { date: day, inflow: 0, outflow: 0 };
      dayMap[day].outflow += Number(r.amount) || 0;
    });

    const daily = Object.values(dayMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      totalInflow,
      totalExpenses,
      totalRefunds,
      totalOutflow,
      netCash,
      daily,
    };
  }, [sales, expenses, saleReturns, dateRange, customerPayments]);

  // Real-time synchronization for multi-user environments
  React.useEffect(() => {
    if (selectedReport !== "DAILY_CASHIER" || isOffline) return;

    const pollShifts = setInterval(() => {
      fetchCashierShifts(dateRange.start, dateRange.end)
        .then(setCashierShifts)
        .catch((e) => console.error("Auto-poll shifts failure:", e));
    }, 20000); // 20s polling for Manager's dashboard

    return () => clearInterval(pollShifts);
  }, [selectedReport, dateRange, isOffline, fetchCashierShifts]);

  const { cashierStats, calculatedShifts } = useMemo(() => {
    let totalOpening = 0;
    let totalExpected = 0;
    let totalActual = 0;
    let totalClosedVariance = 0;

    // 🚀 Performance Optimization: Step 1 - Group data by shiftId using Maps (O(N))
    const salesByShift = new Map<string, any[]>();
    const returnsByShift = new Map<string, any[]>();
    const paymentsByShift = new Map<string, any[]>();

    // Group items that have an explicit shiftId
    (sales || []).forEach((s) => {
      if (s.shiftId) {
        if (!salesByShift.has(s.shiftId)) salesByShift.set(s.shiftId, []);
        salesByShift.get(s.shiftId)!.push(s);
      }
    });

    (saleReturns || []).forEach((r) => {
      if (r.shiftId) {
        if (!returnsByShift.has(r.shiftId)) returnsByShift.set(r.shiftId, []);
        returnsByShift.get(r.shiftId)!.push(r);
      }
    });

    (customerPayments || []).forEach((p) => {
      if (p.shiftId) {
        if (!paymentsByShift.has(p.shiftId)) paymentsByShift.set(p.shiftId, []);
        paymentsByShift.get(p.shiftId)!.push(p);
      }
    });

    // 🚀 Performance Optimization: Step 2 - Pre-index workers
    const employeeMap = new Map();
    (employees || []).forEach((e) => employeeMap.set(e.id, e));

    const shifts = (cashierShifts || []).map((s) => {
      totalOpening += s.openingCash || 0;
      totalActual += s.actualCash || 0;

      const employee = employeeMap.get(s.cashierId);
      const employeeName = employee?.name?.toLowerCase();

      // High-Precision Matching: Use grouped maps first
      let shiftSales = salesByShift.get(s.id) || [];
      let shiftRefunds = returnsByShift.get(s.id) || [];
      const shiftRecoveries = paymentsByShift.get(s.id) || [];

      // Fallback for transition data (no shiftId): Only filter the items that didn't have a shiftId
      if (shiftSales.length === 0) {
        const shiftStart = new Date(s.startTime).getTime() - 5 * 60000;
        const shiftEnd = s.endTime ? new Date(s.endTime).getTime() : Date.now();

        shiftSales = (sales || []).filter((sale) => {
          if (sale.shiftId) return false; // Already tried explicitly grouped ones
          const saleTime = new Date(sale.createdAt).getTime();
          const idMatch = sale.cashierId === s.cashierId;
          const nameMatch =
            employeeName &&
            sale.cashierName &&
            (sale.cashierName.toLowerCase().includes(employeeName) ||
              employeeName.includes(sale.cashierName.toLowerCase()));
          return (
            (idMatch || nameMatch) &&
            saleTime >= shiftStart &&
            saleTime <= shiftEnd + 60000
          );
        });
      }

      if (shiftRefunds.length === 0) {
        const shiftStart = new Date(s.startTime).getTime() - 5 * 60000;
        const shiftEnd = s.endTime ? new Date(s.endTime).getTime() : Date.now();

        shiftRefunds = (saleReturns || []).filter((ret) => {
          if (ret.shiftId) return false;
          const retTime = new Date(ret.createdAt).getTime();
          // Find parent sale cashier for attribution
          const parentSale = (sales || []).find((sale) => sale.id === ret.saleId);
          const originalCashierId = parentSale?.cashierId;
          const originalCashierName = parentSale?.cashierName;
          if (!originalCashierId) return false;

          const retIdMatch = originalCashierId === s.cashierId;
          const retNameMatch =
            employeeName &&
            originalCashierName &&
            (originalCashierName.toLowerCase().includes(employeeName) ||
              employeeName.includes(originalCashierName.toLowerCase()));
          return (
            (retIdMatch || retNameMatch) &&
            retTime >= shiftStart &&
            retTime <= shiftEnd + 86400000
          );
        });
      }

      const cashSales = shiftSales.filter(
        (sale) => sale.paymentMethod === "cash",
      );
      const creditSalesTotal = shiftSales
        .filter((sale) => sale.paymentMethod === "credit")
        .reduce((acc, sale) => acc + (sale.total || 0), 0);
      const digitalSalesTotal = shiftSales
        .filter(
          (sale) =>
            sale.paymentMethod === "bank" ||
            sale.paymentMethod === "mobile_money",
        )
        .reduce((acc, sale) => acc + (sale.total || 0), 0);

      const cashTotal = cashSales.reduce(
        (acc, sale) => acc + (sale.total || 0),
        0,
      );
      const refundsTotal = shiftRefunds.reduce(
        (acc, ret) => acc + (Number(ret.amount) || 0),
        0,
      );
      const recoveryTotal = shiftRecoveries.reduce(
        (acc, pay) => acc + (pay.amount || 0),
        0,
      );

      const expectedTotal =
        (s.openingCash || 0) + cashTotal + recoveryTotal - refundsTotal;

      totalExpected += expectedTotal;
      if (s.status === "CLOSED") {
        totalClosedVariance += (s.actualCash || 0) - expectedTotal;
      }

      const nameFromSales = shiftSales.find(
        (sale) => sale.cashierName,
      )?.cashierName;
      const cashierName =
        s.cashierName ||
        employee?.name ||
        nameFromSales ||
        `OPERATOR_${s.cashierId.slice(-4).toUpperCase()}`;

      return {
        ...s,
        cashierName,
        cashTotal,
        creditTotal: creditSalesTotal,
        digitalTotal: digitalSalesTotal,
        recoveryTotal,
        refundsTotal,
        expectedTotal,
        actualTotal: s.actualCash || 0,
        variance: (s.actualCash || 0) - expectedTotal,
        duration: s.endTime
          ? `${Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000)}m`
          : "ACTIVE",
      };
    });

    // Handle "Orphaned" Recoveries
    const orphanedRecoveries = (customerPayments || [])
      .filter((pay) => {
        if (pay.shiftId)
          return !cashierShifts.some((cs: any) => cs.id === pay.shiftId);
        const matchesAnyShift = (cashierShifts || []).some((s: any) => {
          const payTime = new Date(pay.createdAt).getTime();
          const shiftStart = new Date(s.startTime).getTime();
          const shiftEnd = s.endTime ? new Date(s.endTime) : new Date();
          return (
            pay.recordedBy === s.cashierId &&
            payTime >= shiftStart &&
            payTime <= shiftEnd.getTime() + 60000
          );
        });
        const method = (pay.paymentMethod || "").toLowerCase();
        return (
          !matchesAnyShift && (method === "cash" || method === "cash-transaction")
        );
      })
      .reduce((acc, pay) => acc + pay.amount, 0);

    totalExpected += orphanedRecoveries;
    totalActual += orphanedRecoveries;

    return {
      cashierStats: {
        totalOpening,
        totalExpected,
        totalActual,
        totalVariance: totalClosedVariance,
        orphanedRecoveries,
      },
      calculatedShifts: shifts,
    };
  }, [cashierShifts, sales, saleReturns, employees, customerPayments]);

  const profitStats = useMemo(() => {
    if (profitReportData && profitReportData.dateTrends.length > 0) {
      let revenue = 0;
      let cost = 0;
      profitReportData.dateTrends.forEach((d) => {
        revenue += d.revenue;
        cost += d.cost;
      });

      return {
        totalRevenue: revenue,
        totalCOGS: cost,
        totalProfit: revenue - cost,
        avgMargin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
        dailyTrend: profitReportData.dateTrends,
        products: profitReportData.productPerformance,
      };
    }

    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const periodSales = sales.filter((s) => {
      const d = new Date(s.createdAt || s.timestamp).getTime();
      return d >= startTs && d <= endTs;
    });

    let totalRevenue = 0;
    let totalCOGS = 0;
    const dailyData: Record<
      string,
      { date: string; revenue: number; profit: number }
    > = {};
    const productBreakdown: Record<
      string,
      {
        id: string;
        name: string;
        qty: number;
        revenue: number;
        cost: number;
        profit: number;
      }
    > = {};

    periodSales.forEach((sale) => {
      const day = new Date(sale.createdAt || sale.timestamp).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short" },
      );
      if (!dailyData[day])
        dailyData[day] = { date: day, revenue: 0, profit: 0 };

      sale.items.forEach((item: any) => {
        const product = products.find((p) => p.id === item.productId);
        const costPrice = item.costPrice || product?.costPrice || 0;
        const netQty =
          Number(item.quantity || 0) - Number(item.returnedQuantity || 0);

        if (netQty <= 0) return;

        const itemRevenue = netQty * item.unitPrice;
        const itemCost = netQty * costPrice;
        const itemProfit = itemRevenue - itemCost;

        totalRevenue += itemRevenue;
        totalCOGS += itemCost;

        dailyData[day].revenue += itemRevenue;
        dailyData[day].profit += itemProfit;

        const pId = item.productId || item.id;
        if (!productBreakdown[pId]) {
          productBreakdown[pId] = {
            id: pId,
            name: item.productName || product?.name || "Unknown",
            qty: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }
        productBreakdown[pId].qty += netQty;
        productBreakdown[pId].revenue += itemRevenue;
        productBreakdown[pId].cost += itemCost;
        productBreakdown[pId].profit += itemProfit;
      });
    });

    const totalProfit = totalRevenue - totalCOGS;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCOGS,
      totalProfit,
      avgMargin,
      dailyTrend: Object.values(dailyData),
      products: Object.values(productBreakdown).sort(
        (a, b) => b.profit - a.profit,
      ),
    };
  }, [sales, products, dateRange, productMap]);

  const categoryStats = useMemo(() => {
    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const periodSales = sales.filter((s) => {
      const d = new Date(s.createdAt || s.timestamp).getTime();
      return d >= startTs && d <= endTs;
    });

    const categoryMap: Record<
      string,
      {
        category: string;
        revenue: number;
        cost: number;
        profit: number;
        qty: number;
      }
    > = {};

    periodSales.forEach((sale) => {
      sale.items.forEach((item: any) => {
        const product = products.find((p) => p.id === item.productId);
        const category = product?.category || "Uncategorized";
        const costPrice = item.costPrice || product?.costPrice || 0;
        const netQty =
          Number(item.quantity || 0) - Number(item.returnedQuantity || 0);

        if (netQty <= 0) return;

        const itemRevenue = netQty * item.unitPrice;
        const itemCost = netQty * costPrice;

        if (!categoryMap[category]) {
          categoryMap[category] = {
            category,
            revenue: 0,
            cost: 0,
            profit: 0,
            qty: 0,
          };
        }

        categoryMap[category].revenue += itemRevenue;
        categoryMap[category].cost += itemCost;
        categoryMap[category].profit += itemRevenue - itemCost;
        categoryMap[category].qty += netQty;
      });
    });

    return Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
  }, [sales, products, dateRange, productMap]);

  if (selectedReport) {
    const currentMeta = REPORTS_METADATA.find((m) => m.id === selectedReport)!;
    const startTs = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTs = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const isReportEmpty = (() => {
      switch (selectedReport) {
        case "SALES_SUMMARY":
        case "DISCOUNT_REPORT":
          return !sales.some((s) => {
            const d = new Date(s.createdAt || s.timestamp).getTime();
            return d >= startTs && d <= endTs;
          });
        case "PRODUCT_PERFORMANCE":
          return productStats.length === 0;
        case "INVENTORY_STOCK":
        case "LOW_STOCK":
          return (
            products.length === 0 ||
            (selectedReport === "LOW_STOCK" &&
              !products.some((p) => p.stock <= p.minStock))
          );
        case "CREDIT_SALES":
          return customers.length === 0;
        case "SUPPLIER_PAYABLES":
          return suppliers.length === 0;
        case "CASH_FLOW":
          return cashFlow.daily.length === 0;
        case "DAILY_CASHIER":
          return cashierShifts.length === 0;
        case "PROFIT_MARGIN":
          return !profitStats.products || profitStats.products.length === 0;
        case "RETURNS_REFUNDS":
          return !saleReturns.some((r) => {
            const d = new Date(r.createdAt).getTime();
            return d >= startTs && d <= endTs;
          });
        case "PURCHASE_REPORT":
          return purchaseHistory.length === 0;
        case "SALES_BY_CATEGORY":
          return categoryStats.length === 0;
        case "AUDIT_TRAIL":
          return auditLogs.length === 0;
        case "PROMOTION_MANAGER":
          return promotions.length === 0;
        default:
          return false;
      }
    })();

    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-4 md:py-6 h-full flex flex-col overflow-hidden space-y-4 md:space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setSelectedReport(null)}
              className="p-2 hover:bg-brand-steel/20 border border-brand-steel rounded transition-colors text-slate-800 dark:text-slate-400 hover:text-[var(--text-main)] shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <currentMeta.icon
                  size={16}
                  className={cn(currentMeta.color, "shrink-0")}
                />
                <h2 className="text-lg md:text-xl font-display text-[var(--text-main)] mt-0.5 truncate uppercase tracking-tight">
                  {currentMeta.label}
                </h2>
              </div>
              <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono mt-0.5 uppercase tracking-wider truncate opacity-90 dark:opacity-60 italic">
                {currentMeta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {selectedReport === "DAILY_CASHIER" ? (
              <div className="flex items-center gap-2">
                <DatePicker
                  value={dateRange.start}
                  onChange={(v) => setDateRange({ start: v, end: v })}
                  label="SHIFT_DAY"
                />
              </div>
            ) : (
              ![
                "SUPPLIER_PAYABLES",
                "LOW_STOCK",
                "INVENTORY_STOCK",
                "CREDIT_SALES",
                "PROMOTION_MANAGER",
              ].includes(selectedReport) && (
                <div className="flex items-center gap-1 sm:gap-2 bg-brand-graphite/50 p-1 rounded-sm border border-brand-steel/10 w-full sm:w-auto">
                  <DatePicker
                    value={dateRange.start}
                    onChange={(v) =>
                      setDateRange((prev) => ({ ...prev, start: v }))
                    }
                    label="FROM"
                    className="flex-1"
                  />
                  <ArrowRight
                    size={10}
                    className="text-slate-900 dark:text-slate-500 shrink-0"
                  />
                  <DatePicker
                    value={dateRange.end}
                    onChange={(v) =>
                      setDateRange((prev) => ({ ...prev, end: v }))
                    }
                    label="TO"
                    className="flex-1"
                  />
                </div>
              )
            )}

            {isRefreshing && (
              <div
                className="flex items-center gap-1.5 text-brand-accent animate-pulse"
                title="Fetching from server..."
              >
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[8px] font-mono uppercase tracking-widest hidden sm:inline">
                  SYNCING
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {!["SUPPLIER_PAYABLES", "PROMOTION_MANAGER"].includes(
                selectedReport,
              ) && (
                <button
                  onClick={handleExportCSV}
                  disabled={isOffline || isReportEmpty}
                  className={cn(
                    "btn-industrial btn-outline px-4 py-2 text-[9px] flex items-center gap-2 transition-all duration-300",
                    (isOffline || isReportEmpty) &&
                      "opacity-40 blur-[1.5px] grayscale cursor-not-allowed pointer-events-none",
                  )}
                >
                  <Download size={14} /> EXPORT_CSV
                </button>
              )}
              <button
                onClick={handlePrint}
                disabled={isOffline || isReportEmpty}
                className={cn(
                  "btn-industrial btn-primary px-4 py-2 text-[9px] flex items-center gap-2 transition-all duration-300",
                  (isOffline || isReportEmpty) &&
                    "opacity-40 blur-[1.5px] grayscale cursor-not-allowed pointer-events-none",
                )}
              >
                <Printer size={14} /> PRINT_LOG
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">
          {selectedReport === "SALES_SUMMARY" && (
            <SalesReport
              type="SALES_SUMMARY"
              salesSummary={salesSummary}
              productStats={productStats}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {selectedReport === "PRODUCT_PERFORMANCE" && (
            <SalesReport
              type="PRODUCT_PERFORMANCE"
              salesSummary={salesSummary}
              productStats={productStats}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {selectedReport === "INVENTORY_STOCK" && (
            <InventoryReport products={products} type="INVENTORY_STOCK" />
          )}

          {selectedReport === "LOW_STOCK" && (
            <InventoryReport products={products} type="LOW_STOCK" />
          )}

          {selectedReport === "CREDIT_SALES" && (
            <FinancialReport
              type="CREDIT_SALES"
              customers={customers}
              suppliers={suppliers}
            />
          )}

          {selectedReport === "SUPPLIER_PAYABLES" && (
            <FinancialReport
              type="SUPPLIER_PAYABLES"
              customers={customers}
              suppliers={suppliers}
            />
          )}

          {selectedReport === "AUDIT_TRAIL" && (
            <SecurityAuditTrail auditLogs={auditLogs} />
          )}

          {selectedReport === "DAILY_CASHIER" && (
            <CashierShiftsReport
              cashierShifts={calculatedShifts}
              sales={sales}
              employees={employees}
              saleReturns={saleReturns}
              dateRange={dateRange}
              cashierStats={cashierStats}
            />
          )}

          {selectedReport === "CASH_FLOW" && (
            <CashFlowReport cashFlow={cashFlow} />
          )}

          {selectedReport === "PROFIT_MARGIN" && (
            <ProfitMarginReport profitStats={profitStats} />
          )}

          {selectedReport === "RETURNS_REFUNDS" && (
            <ReturnsReport
              saleReturns={saleReturns}
              products={products}
              totalRefunds={salesSummary.totalRefunds}
            />
          )}

          {selectedReport === "PURCHASE_REPORT" && (
            <PurchaseReport
              transactions={purchaseHistory}
              products={products}
              suppliers={suppliers}
            />
          )}

          {selectedReport === "SALES_BY_CATEGORY" && (
            <CategorySalesReport categoryStats={categoryStats} />
          )}

          {selectedReport === "DISCOUNT_REPORT" && (
            <DiscountAuditReport sales={sales} employees={employees} />
          )}

          {selectedReport === "PROMOTION_MANAGER" && <PromotionManager />}

          {/* Fallback for other reports */}
          {![
            "SALES_SUMMARY",
            "PRODUCT_PERFORMANCE",
            "INVENTORY_STOCK",
            "LOW_STOCK",
            "CREDIT_SALES",
            "SUPPLIER_PAYABLES",
            "AUDIT_TRAIL",
            "CASH_FLOW",
            "DAILY_CASHIER",
            "PROFIT_MARGIN",
            "RETURNS_REFUNDS",
            "PURCHASE_REPORT",
            "SALES_BY_CATEGORY",
            "DISCOUNT_REPORT",
            "PROMOTION_MANAGER",
          ].includes(selectedReport) && (
            <div className="flex-1 industrial-panel flex flex-col items-center justify-center gap-4">
              <BarChart3
                size={64}
                className="text-brand-steel animate-pulse opacity-20"
              />
              <div className="text-center">
                <h3 className="text-xs font-display text-slate-800 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">
                  TELEMETRY_DATA_FORMATTING_IN_PROGRESS
                </h3>
                <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono italic">
                  AGGR_LEDGER_SEQ :: {selectedReport}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-4 h-full flex flex-col overflow-hidden space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 md:p-2 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent shrink-0">
              <BarChart3 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-3xl font-display text-[var(--text-main)] tracking-tight uppercase truncate">
                Strategic Metrics
              </h2>
              <p className="text-[8px] md:text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-1 uppercase tracking-widest border-l-2 border-brand-accent pl-3 truncate opacity-80">
                Operational Intelligence Hub // v4.2.0_TACTICAL
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 bg-brand-graphite p-1 border border-brand-steel rounded-md w-full lg:w-auto overflow-x-auto no-scrollbar no-print [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
          {["All", "Financial", "Inventory", "Operations", "Security"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={cn(
                  "px-3 md:px-4 py-1.5 text-[8px] md:text-[9px] font-display uppercase transition-all rounded whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-brand-steel text-[var(--text-main)] shadow-lg"
                    : "text-slate-900 dark:text-slate-500 hover:text-slate-300",
                )}
              >
                {cat}
              </button>
            ),
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0 md:pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0">
          {filteredMetadata.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              disabled={isOffline}
              className={cn(
                "industrial-panel p-4 md:p-6 flex flex-col gap-4 text-left group hover:border-brand-accent/50 transition-all hover:bg-brand-accent/5",
                isOffline &&
                  "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
              )}
            >
              <div className="flex justify-between items-start">
                <div
                  className={cn(
                    "p-1.5 md:p-2 border border-current bg-current/5",
                    report.color,
                  )}
                >
                  <report.icon size={16} md:size={18} />
                </div>
                <div className="px-2 py-0.5 bg-brand-steel text-[7px] font-mono text-slate-800 dark:text-slate-400 rounded uppercase tracking-widest">
                  {isOffline ? "OFFLINE" : report.category}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-display text-[var(--text-main)] mb-2 uppercase group-hover:text-brand-accent transition-colors">
                  {report.label}
                </h3>
                <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono leading-relaxed uppercase">
                  {isOffline
                    ? "SYNC_REQUIRED: RECONNECT TO VIEW ANALYSIS"
                    : report.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-brand-steel/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-mono text-brand-accent">
                  {isOffline ? "LOCKED" : "LAUNCH_ANALYSIS"}
                </span>
                <ArrowRight size={12} className="text-brand-accent" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="min-h-8 py-2 md:h-8 border-t border-brand-steel/30 flex flex-col md:flex-row md:items-center justify-between text-[8px] font-mono text-slate-900 dark:text-slate-500 gap-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <span className="truncate">
            SECURE_DATA_ENCRYPTION: AES-256_ACTIVE
          </span>
          <span className="truncate">
            REPORT_CACHE_TIMESTAMP: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="text-right sm:text-left truncate">
          SYSTEM_ACCESS_LEVEL: LEVEL_4_ADMIN
        </div>
      </footer>
    </div>
  );
}
