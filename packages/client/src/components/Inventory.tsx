import React, { useMemo, useEffect } from "react";
import { observer, useObservable } from "@legendapp/state/react";
import { useHardware } from "../HardwareContext";
import { Product } from "../types";
import { toast } from "sonner";

// ⚛️ Atomic Vanguard Inventory Components
import { InventoryHeader } from "./inventory/InventoryHeader";
import { InventorySearchHorizon } from "./inventory/InventorySearchHorizon";
import { InventoryTable } from "./inventory/InventoryTable";
import { InventoryModals } from "./inventory/InventoryModals";

// 🛰️ [VANGUARD] Hardened Inventory Module:
// This component is now a high-performance 'Intelligence Hub'. 
// It utilizes isolated reactive blades to ensure parent-level re-render 
// cascades are eliminated during high-frequency system buffer filtering.
export default function Inventory() {
  const hardware = useHardware();
  const {
    inventoryState$,
    addProduct,
    updateProduct,
    retireProduct,
    addSystemLog,
    isOffline,
  } = hardware;

  // 🛰️ [VANGUARD] Zero-Render UI Pulse:
  // Replacing state with observables + computed intelligence.
  const ui$ = useObservable({
    searchQuery: "",
    filter: "all" as "all" | "low" | "out",
    isAddModalOpen: false,
    isUploadModalOpen: false,
    isRetireModalOpen: false,
    isSubmitting: false,
    editingProduct: null as Product | null,
    retirePendingId: null as string | null,
    openWidget: null as "restock" | "dead" | null,
    formData: {
      name: "",
      category: "CEMENT_AND_AGGREGATES",
      supplierId: "",
      barcode: "",
      costPrice: "",
      sellingPrice: "",
      profitMargin: "0",
      finalPrice: "0",
      initialStock: "",
      unit: "PCS",
      minStock: "5",
    },
    uploadLoading: false,
    uploadResult: null as {
      success: number;
      fail: number;
      errors: string[];
    } | null,
    editingFormData: {
      name: "",
      category: "CEMENT_AND_AGGREGATES",
      supplierId: "",
      barcode: "",
      costPrice: "",
      sellingPrice: "",
      unit: "PCS",
      minStock: "5",
    }
  });

  // 🛰️ [INTELLIGENCE] Computed Financial Horizon
  // High-performance reactive math for industrial margins.
  useEffect(() => {
    ui$.formData.profitMargin.set(() => {
      const cost = parseFloat(ui$.formData.costPrice.get() || "0");
      const sales = parseFloat(ui$.formData.sellingPrice.get() || "0");
      if (!isNaN(cost) && !isNaN(sales) && cost > 0) {
        return ((sales - cost) / cost * 100).toFixed(1);
      }
      return "0";
    });

    ui$.formData.finalPrice.set(() => {
      return ui$.formData.sellingPrice.get() || "0";
    });
  }, [ui$]);

  // 🛰️ [INTELLIGENCE] Edit Sync Protocol
  // Auto-hydrates the edit form when a product is selected.
  ui$.editingProduct.onChange(({ value }) => {
    if (value) {
      ui$.editingFormData.set({
        name: value.name || "",
        category: value.category || "CEMENT_AND_AGGREGATES",
        supplierId: value.supplierId || "",
        barcode: value.barcode || "",
        costPrice: value.costPrice?.toString() || "",
        sellingPrice: value.price?.toString() || "",
        unit: value.unit || "PCS",
        minStock: value.minStock?.toString() || "5",
      });
    }
  });


  const handleAddSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const data = ui$.formData.get();

    if (!data.name) return toast.error("PRODUCT_NAME_REQUIRED");
    if (!data.costPrice || Number(data.costPrice) <= 0) return toast.error("INVALID_COST_PRICE");
    if (!data.sellingPrice || Number(data.sellingPrice) <= 0) return toast.error("INVALID_SELLING_PRICE");
    if (!data.unit) return toast.error("UNIT_OF_MEASURE_REQUIRED");

    ui$.isSubmitting.set(true);
    try {
      await addProduct({
        name: data.name,
        category: data.category,
        supplierId: data.supplierId || undefined,
        barcode: data.barcode || undefined,
        costPrice: parseFloat(data.costPrice),
        price: parseFloat(ui$.formData.finalPrice.get() || data.sellingPrice),
        initialStock: 0,
        unit: data.unit,
        minStock: parseInt(data.minStock) || 5,
      });

      await addSystemLog({
        action: "PRODUCT_REGISTERED",
        target: data.name,
        newValue: JSON.stringify({ price: data.sellingPrice, cost: data.costPrice }),
      });

      ui$.isAddModalOpen.set(false);
      ui$.formData.set({
        name: "",
        category: "CEMENT_AND_AGGREGATES",
        supplierId: "",
        barcode: "",
        costPrice: "",
        sellingPrice: "",
        profitMargin: "0",
        finalPrice: "0",
        initialStock: "",
        unit: "PCS",
        minStock: "5",
      });
    } finally {
      ui$.isSubmitting.set(false);
    }
  }, [addProduct, addSystemLog, ui$]);

  const handleEditSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const product = ui$.editingProduct.get();
    const data = ui$.editingFormData.get();
    if (!product) return;

    ui$.isSubmitting.set(true);
    try {
      await updateProduct(product.id, {
        name: data.name,
        category: data.category,
        supplierId: data.supplierId || undefined,
        barcode: data.barcode || undefined,
        costPrice: parseFloat(data.costPrice),
        price: parseFloat(data.sellingPrice),
        unit: data.unit,
        minStock: parseInt(data.minStock),
      });
      ui$.editingProduct.set(null);
    } finally {
      ui$.isSubmitting.set(false);
    }
  }, [updateProduct, ui$]);

  const executeRetireProtocol = React.useCallback(async () => {
    const id = ui$.retirePendingId.get();
    if (!id) return;

    ui$.isSubmitting.set(true);
    try {
      const p = inventoryState$?.products?.get?.()?.find?.((prod: any) => prod.id === id);
      await retireProduct(id);
      if (p) {
        await addSystemLog({
          action: "PRODUCT_RETIRED",
          target: p.name,
          oldValue: JSON.stringify(p),
        });
      }
      ui$.isRetireModalOpen.set(false);
      ui$.retirePendingId.set(null);
    } finally {
      ui$.isSubmitting.set(false);
    }
  }, [retireProduct, inventoryState$, addSystemLog, ui$]);

  const downloadTemplate = React.useCallback(() => {
    const headers = "Name,Barcode,Cost,Sales Price,Category,Unit,Stock\n";
    const sample = "Cement (Tororo),SKU-1001,35000,38000,CEMENT_AND_AGGREGATES,BAGS,50\nSteel Bar 12mm,SKU-2002,12000,15000,STEEL_AND_METAL,PCS,100";
    const blob = new Blob([headers + sample], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hardware_inventory_template.csv";
    a.click();
  }, []);

  const handleOpenAdd = React.useCallback(() => ui$.isAddModalOpen.set(true), [ui$]);
  const handleOpenUpload = React.useCallback(() => ui$.isUploadModalOpen.set(true), [ui$]);
  const handleEdit = React.useCallback((p: any) => ui$.editingProduct.set(p), [ui$]);
  const handleRetire = React.useCallback((id: string) => {
    ui$.retirePendingId.set(id);
    ui$.isRetireModalOpen.set(true);
  }, [ui$]);

  // 🛰️ [VANGUARD] Zero-Render Shell:
  // No .get() calls allowed here. Child blades consume reactivity.

  return (
    <div className="p-4 sm:p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <InventoryHeader 
        ui$={ui$}
        products$={inventoryState$.products}
        isOffline$={hardware.identityState$.isOffline}
        onOpenAdd={handleOpenAdd}
        onOpenUpload={handleOpenUpload}
      />

      <InventorySearchHorizon ui$={ui$} />

      <InventoryTable 
        products$={inventoryState$.products}
        ui$={ui$}
        isOffline$={hardware.identityState$.isOffline}
        onEdit={handleEdit}
        onRetire={handleRetire}
      />

      <InventoryModals 
        ui$={ui$}
        suppliers$={inventoryState$.suppliers}
        isOffline$={hardware.identityState$.isOffline}
        onAddSubmit={handleAddSubmit}
        onEditSubmit={handleEditSubmit}
        onExecuteRetire={executeRetireProtocol}
        onDownloadTemplate={downloadTemplate}
      />
    </div>
  );
}
