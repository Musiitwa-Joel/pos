import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  AlertCircle,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Save,
  Upload,
  AlertTriangle,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { useHardware } from "../HardwareContext";
import { formatCurrency, cn } from "../lib/utils";
import { Product } from "../types";
import Modal from "./Modal";
import Select from "./Select";
import { toast } from "sonner";
import { API_BASE_URL } from "../lib/apollo";

export default function Inventory() {
  const {
    products,
    suppliers,
    addProduct,
    updateProduct,
    retireProduct,
    adjustStock,
    refreshInventory,
    addSystemLog,
    isOffline,
  } = useHardware();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    fail: number;
    errors: string[];
  } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingFormData, setEditingFormData] = useState({
    name: "",
    category: "CEMENT_AND_AGGREGATES",
    supplierId: "",
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    unit: "PCS",
    minStock: "5",
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "CEMENT_AND_AGGREGATES",
    supplierId: "",
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    profitMargin: "20",
    finalPrice: "",
    initialStock: "",
    unit: "PCS",
    minStock: "5",
  });

  const [isAddingCustomUnit, setIsAddingCustomUnit] = useState(false);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [availableUnits, setAvailableUnits] = useState([
    "PCS",
    "BAGS",
    "MTRS",
    "KG",
    "LTRS",
    "PKTS",
    "ROLLS",
    "BDL",
  ]);
  const [openWidget, setOpenWidget] = useState<"restock" | "dead" | null>(null);

  // Security Protocols
  const [retirePendingId, setRetirePendingId] = useState<string | null>(null);
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);

  // Sync edit form data when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setEditingFormData({
        name: editingProduct.name || "",
        category: editingProduct.category || "CEMENT_AND_AGGREGATES",
        supplierId: editingProduct.supplierId || "",
        barcode: editingProduct.barcode || "",
        costPrice: editingProduct.costPrice?.toString() || "",
        sellingPrice: editingProduct.price?.toString() || "",
        unit: editingProduct.unit || "PCS",
        minStock: editingProduct.minStock?.toString() || "5",
      });
    }
  }, [editingProduct]);

  // Handle price calculations (Margin is now calculated from Cost and Sales)
  React.useEffect(() => {
    const cost = parseFloat(formData.costPrice);
    const sales = parseFloat(formData.sellingPrice);
    if (!isNaN(cost) && !isNaN(sales) && cost > 0) {
      const margin = ((sales - cost) / cost) * 100;
      setFormData((prev) => ({
        ...prev,
        profitMargin: margin.toFixed(1),
        finalPrice: sales.toFixed(0), // Default final price to sales price
      }));
    }
  }, [formData.costPrice, formData.sellingPrice]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom Validation
    if (!formData.name) return toast.error("PRODUCT_NAME_REQUIRED");
    if (!formData.costPrice || Number(formData.costPrice) <= 0)
      return toast.error("INVALID_COST_PRICE");
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0)
      return toast.error("INVALID_SELLING_PRICE");
    if (!formData.unit) return toast.error("UNIT_OF_MEASURE_REQUIRED");

    setIsSubmitting(true);
    try {
      await addProduct({
        name: formData.name,
        category: formData.category,
        supplierId: formData.supplierId || undefined,
        barcode: formData.barcode || undefined,
        costPrice: parseFloat(formData.costPrice),
        price: parseFloat(formData.finalPrice || formData.sellingPrice),
        initialStock: 0,
        unit: formData.unit,
        minStock: parseInt(formData.minStock) || 5,
      });

      await addSystemLog({
        action: "PRODUCT_REGISTERED",
        target: formData.name,
        newValue: JSON.stringify({
          price: formData.sellingPrice,
          cost: formData.costPrice,
        }),
      });

      setIsAddModalOpen(false);
      setFormData({
        name: "",
        category: "CEMENT_AND_AGGREGATES",
        supplierId: "",
        barcode: "",
        costPrice: "",
        sellingPrice: "",
        profitMargin: "20",
        finalPrice: "",
        initialStock: "",
        unit: "PCS",
        minStock: "5",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmitting(true);
    try {
      await updateProduct(editingProduct.id, {
        name: editingFormData.name,
        category: editingFormData.category,
        supplierId: editingFormData.supplierId || undefined,
        barcode: editingFormData.barcode || undefined,
        costPrice: parseFloat(editingFormData.costPrice),
        price: parseFloat(editingFormData.sellingPrice),
        unit: editingFormData.unit,
        minStock: parseInt(editingFormData.minStock),
      });

      if (
        editingProduct.price !== parseFloat(editingFormData.sellingPrice) ||
        editingProduct.costPrice !== parseFloat(editingFormData.costPrice)
      ) {
        await addSystemLog({
          action: "PRICE_MODIFIED",
          target: editingProduct.name,
          oldValue: `Price: ${editingProduct.price}, Cost: ${editingProduct.costPrice}`,
          newValue: `Price: ${editingFormData.sellingPrice}, Cost: ${editingFormData.costPrice}`,
        });
      }

      setEditingProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetireProduct = async (id: string) => {
    setRetirePendingId(id);
    setIsRetireModalOpen(true);
  };

  const executeRetireProtocol = async () => {
    if (!retirePendingId) return;

    setIsSubmitting(true);
    try {
      const p = products.find((prod) => prod.id === retirePendingId);
      await retireProduct(retirePendingId);
      if (p) {
        await addSystemLog({
          action: "PRODUCT_RETIRED",
          target: p.name,
          oldValue: JSON.stringify(p),
        });
      }
      setIsRetireModalOpen(false);
      setRetirePendingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async (
    productId: string,
    quantity: number,
    type: "adjustment" | "restock" | "damage",
  ) => {
    const p = products.find((prod) => prod.id === productId);
    await adjustStock(
      productId,
      quantity,
      type,
      `Manual adjustment from Inventory UI`,
    );
    if (p) {
      await addSystemLog({
        action: "STOCK_ADJUSTMENT",
        target: p.name,
        oldValue: `Current: ${p.stock}`,
        newValue: `Adjustment: ${quantity > 0 ? "+" : ""}${quantity} (Type: ${type})`,
      });
    }
  };

  const downloadTemplate = () => {
    const headers = "Name,Barcode,Cost,Sales Price,Category,Unit,Stock\n";
    const sample =
      "Cement (Tororo),SKU-1001,35000,38000,CEMENT_AND_AGGREGATES,BAGS,50\nSteel Bar 12mm,SKU-2002,12000,15000,STEEL_AND_METAL,PCS,100";
    const blob = new Blob([headers + sample], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hardware_inventory_template.csv";
    a.click();
  };

  const filteredProducts = products.filter((p) => {
    const name = p.name || "UNKNOWN PRODUCT";
    const matchesSearch = name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filter === "low")
      return (
        matchesSearch &&
        (p.stock || 0) <= (p.minStock || 5) &&
        (p.stock || 0) > 0
      );
    if (filter === "out") return matchesSearch && (p.stock || 0) <= 0;
    return matchesSearch;
  });

  const suggestions = useMemo(() => {
    return products
      .filter((p) => p.stock <= p.minStock)
      .map((p) => ({
        ...p,
        suggestedOrder: p.minStock * 2 - p.stock,
      }));
  }, [products]);

  const deadStock = useMemo(() => {
    // Real logic: items with stock but no sales in 30+ days (or never sold)
    return products.filter(
      (p) =>
        p.stock > 0 &&
        (p.daysSinceLastSale === null || p.daysSinceLastSale > 30),
    );
  }, [products]);

  return (
    <div className="p-4 sm:p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-display text-[var(--text-main)] uppercase tracking-tight">
            Inventory // Intelligence
          </h1>
          <p className="text-[9px] text-slate-800 dark:text-slate-900 dark:text-slate-500 font-mono uppercase tracking-[0.2em] font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            System_Live // Total_Registry: {products.length}_Items
          </p>
        </div>
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isOffline}
            className={cn(
              "btn-industrial btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] py-2 sm:py-2.5 font-black tracking-widest uppercase",
              isOffline &&
                "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
            )}
          >
            <Plus size={14} />
            {isOffline ? "LOCKED" : "REGISTER_NEW"}
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isOffline}
            className={cn(
              "btn-industrial bg-brand-steel/5 border-brand-steel/30 flex items-center justify-center p-4 sm:p-2.5 hover:bg-brand-steel/20 transition-all",
              isOffline &&
                "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
            )}
            title="Import_Buffer"
          >
            <Upload size={14} className="text-brand-accent" />
          </button>
        </div>
      </div>

      {/* Intelligence Widgets - now responsive: single column on mobile, two on sm+ */}
      {/* Mobile: compact accordion (hidden on sm+). Desktop/tablet: 2-column grid (sm+). */}
      <div className="sm:hidden space-y-2">
        <div className="industrial-panel p-2 border-orange-500/20">
          <button
            onClick={() =>
              setOpenWidget(openWidget === "restock" ? null : "restock")
            }
            className="w-full flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 text-orange-400">
              <AlertCircle size={14} className="shrink-0" />
              <span className="text-sm font-display uppercase tracking-widest font-black">
                Restock_Intelligence
              </span>
            </div>
            <div className="text-[10px] font-mono text-orange-400">
              {openWidget === "restock" ? "▾" : "▸"}
            </div>
          </button>
          {openWidget === "restock" && (
            <div className="mt-2 space-y-1 text-[9px] font-mono">
              {suggestions.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center leading-none py-1"
                >
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="text-orange-400 font-bold">
                    +{s.suggestedOrder} {s.unit}
                  </span>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="text-[9px] italic">ALL_STOCK_LEVELS_HEALTHY</p>
              )}
            </div>
          )}
        </div>

        <div className="industrial-panel p-2 border-brand-steel/20">
          <button
            onClick={() => setOpenWidget(openWidget === "dead" ? null : "dead")}
            className="w-full flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-400">
              <Package size={14} className="shrink-0" />
              <span className="text-sm font-display uppercase tracking-widest font-black">
                Dead_Stock_Detection
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {openWidget === "dead" ? "▾" : "▸"}
            </div>
          </button>
          {openWidget === "dead" && (
            <div className="mt-2 space-y-1 text-[9px] font-mono">
              {deadStock.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center leading-none py-1"
                >
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="text-slate-900 font-bold">
                    {s.daysSinceLastSale === null
                      ? "NEVER_SOLD"
                      : `${s.daysSinceLastSale}D_STAGNANT`}
                  </span>
                </div>
              ))}
              {deadStock.length === 0 && (
                <p className="text-[9px] italic">
                  NO_STAGNANT_INVENTORY_DETECTED
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 max-h-40 sm:max-h-none overflow-y-auto">
        <div className="industrial-panel p-3 bg-orange-500/5 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-[9px] font-display uppercase tracking-widest font-black">
              Restock_Intelligence
            </span>
          </div>
          <div className="space-y-1.5">
            {suggestions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center text-[9px] font-mono leading-none py-1 border-b border-orange-500/10 last:border-0"
              >
                <span className="text-[var(--text-main)] opacity-70 truncate pr-4">
                  {s.name}
                </span>
                <span className="text-orange-400 shrink-0 font-bold">
                  +{s.suggestedOrder} {s.unit}
                </span>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="text-[9px] text-slate-800 dark:text-slate-900 dark:text-slate-500 font-mono italic p-1">
                ALL_STOCK_LEVELS_HEALTHY
              </p>
            )}
          </div>
        </div>
        <div className="industrial-panel p-3 bg-[var(--bg-inset)] border-brand-steel/30">
          <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-400">
            <Package size={14} className="shrink-0" />
            <span className="text-[9px] font-display uppercase tracking-widest font-black">
              Dead_Stock_Detection
            </span>
          </div>
          <div className="space-y-1.5">
            {deadStock.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center text-[9px] font-mono leading-none py-1 border-b border-brand-steel/5 last:border-0"
              >
                <span className="text-[var(--text-main)] opacity-70 truncate pr-4">
                  {s.name}
                </span>
                <span className="text-slate-900 dark:text-slate-900 dark:text-slate-500 uppercase tracking-tighter shrink-0 font-bold">
                  {s.daysSinceLastSale === null
                    ? "NEVER_SOLD"
                    : `${s.daysSinceLastSale}D_STAGNANT`}
                </span>
              </div>
            ))}
            {deadStock.length === 0 && (
              <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono italic p-1">
                NO_STAGNANT_INVENTORY_DETECTED
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tactical Horizon: Search & Filter Suite */}
      <div className="flex flex-col gap-3 py-2 border-y border-brand-steel/10 bg-black/5 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-accent/50"
            size={14}
          />
          <input
            type="text"
            placeholder="FILTER_SYSTEM_BUFFER..."
            className="terminal-input w-full pl-10 h-10 text-[9px] uppercase font-mono tracking-widest bg-transparent border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Horizon Scrollable */}
        <div className="flex gap-2 flex-wrap sm:overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-2 sm:-mx-2 px-2 sm:px-2 mask-linear-right">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 sm:px-4 h-8 flex items-center justify-center whitespace-nowrap text-[8px] font-display uppercase tracking-widest transition-all rounded-sm",
              filter === "all"
                ? "bg-brand-accent text-white shadow-lg"
                : "bg-brand-steel/10 text-slate-700 dark:text-slate-900 dark:text-slate-500 hover:bg-brand-steel/20",
            )}
          >
            ALL_RECORDS
          </button>
          <button
            onClick={() => setFilter("low")}
            className={cn(
              "px-3 sm:px-4 h-8 flex items-center justify-center whitespace-nowrap text-[8px] font-display uppercase tracking-widest transition-all rounded-sm",
              filter === "low"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-brand-steel/10 text-slate-700 dark:text-slate-900 dark:text-slate-500 hover:bg-brand-steel/20",
            )}
          >
            LOW_THRESHOLD
          </button>
          <button
            onClick={() => setFilter("out")}
            className={cn(
              "px-3 sm:px-4 h-8 flex items-center justify-center whitespace-nowrap text-[8px] font-display uppercase tracking-widest transition-all rounded-sm",
              filter === "out"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-brand-steel/10 text-slate-700 dark:text-slate-900 dark:text-slate-500 hover:bg-brand-steel/20",
            )}
          >
            ZERO_STOCK
          </button>
          <div className="flex-1" /> {/* Spacer for scroll end */}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 industrial-panel overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
          {/* Desktop Table View */}
          <table className="data-table hidden md:table">
            <thead>
              <tr>
                <th>PRODUCT_DETAILS</th>
                <th>CATEGORY</th>
                <th>STOCK_LEVEL</th>
                <th>UNIT_PRICE</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group">
                  <td>
                    <div className="flex flex-col">
                      <span className="text-xs font-display font-black text-black dark:text-[var(--text-main)] tracking-tight uppercase">
                        {product.name}
                      </span>
                      <span
                        className="text-[9px] text-black dark:text-slate-500 font-mono font-bold"
                        title={product.id}
                      >
                        ID: #{product.id.slice(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[9px] font-display bg-black/5 dark:bg-[var(--bg-inset)] border border-black/10 dark:border-brand-steel px-2 py-0.5 text-black dark:text-[var(--text-main)] font-bold">
                      {(product.category || "UNCATEGORIZED").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-mono font-black",
                          product.stock <= product.minStock
                            ? "text-orange-500"
                            : "text-black dark:text-[var(--text-main)]",
                        )}
                      >
                        {product.stock} {product.unit}
                      </span>
                      {isOffline && (
                        <span className="text-[7px] font-mono text-slate-800 dark:text-slate-900 dark:text-slate-500 font-bold uppercase">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-black text-black dark:text-[var(--text-main)]">
                      {formatCurrency(product.price)}
                    </span>
                  </td>
                  <td>
                    {product.stock <= 0 ? (
                      <div className="flex items-center gap-2 text-danger">
                        <div className="status-indicator bg-danger animate-pulse" />
                        <span className="text-[9px] font-display">
                          OUT_OF_STOCK
                        </span>
                      </div>
                    ) : product.stock <= product.minStock ? (
                      <div className="flex items-center gap-2 text-warning">
                        <div className="status-indicator bg-warning animate-pulse" />
                        <span className="text-[9px] font-display">
                          LOW_STOCK
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-success">
                        <div className="status-indicator bg-success" />
                        <span className="text-[9px] font-display">OPTIMAL</span>
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    <div
                      className={cn(
                        "flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        isOffline && "hidden",
                      )}
                    >
                      <button
                        onClick={() => setEditingProduct(product)}
                        disabled={isOffline}
                        className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)] hover:bg-brand-steel/30 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleRetireProduct(product.id)}
                        disabled={isOffline}
                        className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-danger hover:bg-brand-steel/30 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {isOffline && (
                      <X size={14} className="text-slate-700 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View V3: Tactical Efficiency */}
          <div className="md:hidden p-2 sm:p-3 space-y-2 pb-32">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="industrial-panel p-2 sm:p-3 bg-[var(--bg-panel)] flex flex-col gap-2 sm:gap-2.5 border-brand-steel/20 hover:border-brand-accent/50 transition-all active:scale-[0.99]"
              >
                {/* Header Row: Product ID + Status */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-tight line-clamp-1">
                      {product.name}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 font-black">
                    {product.stock <= 0 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                    ) : product.stock <= product.minStock ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    )}
                    <span
                      className={cn(
                        "text-[7px] uppercase tracking-widest",
                        product.stock <= 0
                          ? "text-danger"
                          : product.stock <= product.minStock
                            ? "text-warning"
                            : "text-success",
                      )}
                    >
                      {product.stock <= 0
                        ? "CRITICAL"
                        : product.stock <= product.minStock
                          ? "ALERT"
                          : "STABLE"}
                    </span>
                  </div>
                </div>

                {/* Meta Row: Category & Key Metric Container */}
                <div className="flex items-center justify-between bg-black/10 p-2 border border-brand-steel/10 rounded-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-mono font-bold text-brand-accent">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-[7px] font-mono text-slate-800 dark:text-slate-900 dark:text-slate-500 font-bold uppercase">
                      Unit_Price_Point
                    </span>
                  </div>

                  <div className="h-6 w-px bg-brand-steel/20" />

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "text-[10px] font-mono font-black",
                          product.stock <= product.minStock
                            ? "text-orange-400"
                            : "text-[var(--text-main)]",
                        )}
                      >
                        {product.stock} {product.unit}
                      </span>
                      <span className="text-[7px] font-mono text-slate-800 dark:text-slate-900 dark:text-slate-500 font-bold uppercase tracking-tighter">
                        Current_Registry
                      </span>
                    </div>

                  </div>
                </div>

                {/* Footer Row: Minimal Actions */}
                <div className="flex justify-between items-center bg-white/5 -mx-3 px-3 py-1 mt-1 border-t border-brand-steel/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-mono text-slate-900 dark:text-slate-900 dark:text-slate-500 bg-brand-steel/20 px-1 py-0.5 rounded-sm font-bold">
                      SKU: #{product.id.slice(0, 6)}
                    </span>
                    <span className="text-[7px] font-display text-slate-900 dark:text-slate-900 dark:text-slate-500 uppercase tracking-tighter truncate max-w-[80px] font-bold">
                      {product.category || "UNCATEGORIZED"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      disabled={isOffline}
                      onClick={() => setEditingProduct(product)}
                      className="p-1.5 text-slate-800 dark:text-slate-400 hover:text-brand-accent transition-colors"
                      title="Edit_Spec"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      disabled={isOffline}
                      onClick={() => handleRetireProduct(product.id)}
                      className="p-1.5 text-slate-800 dark:text-slate-400 hover:text-danger transition-colors"
                      title="Retire_Stock"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center text-slate-900 dark:text-slate-500">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-display uppercase tracking-widest">
                NO_INVENTORY_RECORDS_FOUND
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="REGISTER_NEW_INVENTORY_ITEM"
        maxWidth="max-w-lg"
      >
        <form className="space-y-4" onSubmit={handleAddSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">
                Product Name
              </label>
              <input
                type="text"
                className="terminal-input w-full p-2 text-xs"
                placeholder="ENTER_PRODUCT_NAME..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">
                Barcode / SKU
              </label>
              <input
                type="text"
                className="terminal-input w-full p-2 text-xs outline-none"
                placeholder="SCAN_OR_TYPE_BARCODE..."
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                "CEMENT_AND_AGGREGATES",
                "STEEL_AND_METAL",
                "PLUMBING_AND_FITTINGS",
                "ELECTRICAL_COMPONENTS",
                "TOOLS_AND_EQUIPMENT",
              ]}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
            />
            <Select
              label="Supplier"
              options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
              value={formData.supplierId}
              onChange={(val) => setFormData({ ...formData, supplierId: val })}
              placeholder="SELECT_SUPPLIER..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--bg-inset)] p-4 border border-brand-steel/50 rounded-sm">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Purchase Price (Cost)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                placeholder="0"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-brand-accent uppercase tracking-widest">
                Sales Price (Target)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs border-brand-accent"
                placeholder="0"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest">
                Calculated Margin (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="terminal-input w-full p-2 text-xs bg-[var(--bg-inset)] border-orange-500/20 text-orange-500 font-bold"
                  value={formData.profitMargin + "%"}
                  readOnly
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Final Price* (Adjusted)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                placeholder="0"
                value={formData.finalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, finalPrice: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Unit of Measure
              </label>
              <div className="flex gap-1">
                {isAddingCustomUnit ? (
                  <div className="flex flex-1 gap-1">
                    <input
                      type="text"
                      className="terminal-input w-full p-2 text-xs border-brand-accent animate-in fade-in slide-in-from-left-2"
                      placeholder="NEW_UNIT..."
                      autoFocus
                      onBlur={(e) => {
                        if (e.target.value) {
                          const val = e.target.value.toUpperCase();
                          if (!availableUnits.includes(val))
                            setAvailableUnits((prev) => [...prev, val]);
                          setFormData((prev) => ({ ...prev, unit: val }));
                        }
                        setIsAddingCustomUnit(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (
                            e.target as HTMLInputElement
                          ).value.toUpperCase();
                          if (val) {
                            if (!availableUnits.includes(val))
                              setAvailableUnits((prev) => [...prev, val]);
                            setFormData((prev) => ({ ...prev, unit: val }));
                          }
                          setIsAddingCustomUnit(false);
                        }
                        if (e.key === "Escape") setIsAddingCustomUnit(false);
                      }}
                    />
                  </div>
                ) : (
                  <Select
                    options={availableUnits}
                    value={formData.unit}
                    onChange={(val) => setFormData({ ...formData, unit: val })}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setIsAddingCustomUnit(!isAddingCustomUnit)}
                  className={cn(
                    "btn-industrial px-3 text-[10px] transition-all",
                    isAddingCustomUnit ? "bg-brand-accent text-white" : "",
                  )}
                  title={isAddingCustomUnit ? "SAVE_UNIT" : "ADD_CUSTOM_UNIT"}
                >
                  {isAddingCustomUnit ? <Save size={12} /> : <Plus size={12} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Min Stock
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                placeholder="5"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "btn-industrial btn-primary w-full py-4 sm:py-3 flex items-center justify-center gap-2 mt-4 text-[10px] sm:text-xs font-black tracking-widest",
              isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
            )}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSubmitting ? "PROCESSING..." : "REGISTER_PRODUCT"}
          </button>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadResult(null);
        }}
        title="BULK_INVENTORY_IMPORT"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          {!uploadResult ? (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-brand-steel/50 rounded bg-brand-dark/30 text-center space-y-4">
                <div className="w-12 h-12 bg-brand-steel/20 rounded-full flex items-center justify-center mx-auto text-brand-accent">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-xs font-display uppercase tracking-widest">
                    Select file to upload
                  </p>
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 mt-1 font-mono">
                    SUPPORTED: .CSV, .XLSX, .XLS
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  id="file-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadLoading(true);
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      // Using port 9000 as configured in server.js/config.js
                      const response = await fetch(
                        `${API_BASE_URL}/api/inventory/upload`,
                        {
                          method: "POST",
                          body: formData,
                        },
                      );
                      const data = await response.json();

                      if (response.ok) {
                        setUploadResult({
                          success: data.successCount,
                          fail: 0,
                          errors: [],
                        });
                        await refreshInventory(false);
                      } else {
                        // Handle Atomic Rollback
                        toast.error(data.error || "UPLOAD_FAILED");
                        setUploadResult({
                          success: 0,
                          fail: 1, // Treat as generic failure
                          errors: [
                            data.error ||
                              "The entire upload was rolled back to protect your data.",
                          ],
                        });
                      }
                    } catch (err) {
                      toast.error("UPLOAD_FAILED_CHECK_NETWORK");
                    } finally {
                      setUploadLoading(false);
                    }
                  }}
                />
                <button
                  disabled={uploadLoading}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="btn-industrial btn-primary w-full py-2"
                >
                  {uploadLoading ? "PROCESSING..." : "CHOOSE_FILE"}
                </button>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
                <div className="space-y-3 pb-3 border-b border-orange-500/20">
                  <p className="text-[10px] font-display text-orange-400 uppercase flex items-center gap-2 font-bold tracking-tighter">
                    <AlertTriangle size={14} />
                    IMPORT_REQUIREMENTS
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="w-full text-[9px] font-display text-brand-accent hover:text-white transition-colors uppercase tracking-widest border border-brand-accent/30 px-3 py-2 rounded bg-brand-accent/5 hover:bg-brand-accent text-center block"
                  >
                    DOWNLOAD_SAMPLE_TEMPLATE.CSV
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-800 dark:text-slate-400 font-mono leading-relaxed">
                    Rows must contain:{" "}
                    <span className="text-[var(--text-main)]">Name</span>,{" "}
                    <span className="text-[var(--text-main)]">Cost</span>, and{" "}
                    <span className="text-[var(--text-main)]">Sales Price</span>
                    .
                  </p>
                  <p className="text-[9px] text-slate-900 dark:text-slate-500 font-mono italic">
                    * Category, Barcode, and Stock are optional fields.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-success/10 border border-success/30 rounded">
                  <p className="text-2xl font-display text-success">
                    {uploadResult.success}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-success/70">
                    SUCCESS
                  </p>
                </div>
                <div className="text-center p-4 bg-danger/10 border border-danger/30 rounded">
                  <p className="text-2xl font-display text-danger">
                    {uploadResult.fail}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-danger/70">
                    FAILED
                  </p>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase">
                    Error Details
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-brand-dark/50 border border-brand-steel/30 rounded">
                    {uploadResult.errors.map((err, i) => (
                      <p
                        key={i}
                        className="text-[8px] font-mono text-danger opacity-80 break-words"
                      >
                        {err}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadResult(null);
                }}
                className="btn-industrial w-full py-2"
              >
                CLOSE_AND_CONTINUE
              </button>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={`EDIT_PRODUCT // SKU_#${editingProduct?.id.slice(0, 8)}...`}
        maxWidth="max-w-lg"
      >
        <form className="space-y-4" onSubmit={handleEditSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Product Name
              </label>
              <input
                type="text"
                className="terminal-input w-full p-2 text-xs"
                value={editingFormData.name}
                onChange={(e) =>
                  setEditingFormData({
                    ...editingFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Barcode / SKU
              </label>
              <input
                type="text"
                className="terminal-input w-full p-2 text-xs"
                value={editingFormData.barcode}
                onChange={(e) =>
                  setEditingFormData({
                    ...editingFormData,
                    barcode: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                "CEMENT_AND_AGGREGATES",
                "STEEL_AND_METAL",
                "PLUMBING_AND_FITTINGS",
                "ELECTRICAL_COMPONENTS",
                "TOOLS_AND_EQUIPMENT",
              ]}
              value={editingFormData.category}
              onChange={(val) =>
                setEditingFormData({ ...editingFormData, category: val })
              }
            />
            <Select
              label="Supplier"
              options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
              value={editingFormData.supplierId}
              onChange={(val) =>
                setEditingFormData({ ...editingFormData, supplierId: val })
              }
              placeholder="SELECT_SUPPLIER..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Cost Price (UGX)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                value={editingFormData.costPrice}
                onChange={(e) =>
                  setEditingFormData({
                    ...editingFormData,
                    costPrice: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Selling Price (UGX)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                value={editingFormData.sellingPrice}
                onChange={(e) =>
                  setEditingFormData({
                    ...editingFormData,
                    sellingPrice: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Current Stock
              </label>
                <input
                  type="number"
                  className="terminal-input w-full p-2 text-xs bg-brand-steel/10"
                  value={editingProduct?.stock}
                  disabled
                />
              </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Min Stock Alert
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                value={editingFormData.minStock}
                onChange={(e) =>
                  setEditingFormData({
                    ...editingFormData,
                    minStock: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <Select
              label="Unit of Measure"
              options={availableUnits}
              value={editingFormData.unit}
              onChange={(val) =>
                setEditingFormData({ ...editingFormData, unit: val })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "btn-industrial btn-primary w-full py-4 sm:py-3 flex items-center justify-center gap-2 mt-4 text-[10px] sm:text-xs font-black tracking-widest",
              isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
            )}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSubmitting ? "COMMITTING..." : "UPDATE_SPECIFICATIONS"}
          </button>
        </form>
      </Modal>
      {/* Security Confirmation Modal */}
      <Modal
        isOpen={isRetireModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsRetireModalOpen(false);
            setRetirePendingId(null);
          }
        }}
        title="AUTHORIZED_DEACTIVATION_PROTOCOL"
        maxWidth="max-w-sm sm:max-w-md"
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="p-3 sm:p-5 bg-danger/5 border border-danger/20 flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger shrink-0">
              <AlertTriangle size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[9px] sm:text-xs font-display uppercase tracking-widest text-danger font-black leading-tight">
                SYSTEM_DEACTIVATION_REQUISITION
              </h3>
              <p className="text-[10px] text-slate-900 dark:text-slate-500 font-mono leading-relaxed">
                DEACTIVATING:{" "}
                <span className="text-[var(--text-main)] font-black underline decoration-danger/30">
                  {products.find((p) => p.id === retirePendingId)?.name}
                </span>
                <br />
                <span className="opacity-70">
                  THIS PRODUCT LINE WILL BE RETIRED FROM ALL ACTIVE INVENTORY
                  BUFFERS. HISTORICAL TRANSACTIONS WILL REMAIN IMMUTABLE.
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={executeRetireProtocol}
              disabled={isSubmitting}
              className="btn-industrial bg-danger text-white py-4 font-black uppercase tracking-widest text-[10px] shadow-[0px_4px_12px_rgba(var(--danger-rgb),0.2)] hover:shadow-none active:scale-95 transition-all disabled:opacity-80 dark:opacity-50"
            >
              {isSubmitting ? "RETIRING..." : "AUTHORIZE_RETIREMENT"}
            </button>
            <button
              onClick={() => {
                setIsRetireModalOpen(false);
                setRetirePendingId(null);
              }}
              disabled={isSubmitting}
              className="btn-industrial btn-outline py-3 text-[10px] uppercase font-bold text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)]"
            >
              CANCEL_COMMAND
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
