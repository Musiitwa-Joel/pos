import React from "react";
import { Save, Upload, AlertTriangle, RefreshCw, X, Loader2, Plus, AlertCircle } from "lucide-react";
import { observer } from "@legendapp/state/react";
import Modal from "../Modal";
import Select from "../Select";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { API_BASE_URL } from "../../lib/apollo";
import { useHardware } from "../../HardwareContext";

interface InventoryModalsProps {
  ui$: any;
  suppliers$: any;
  isOffline: boolean;
  onAddSubmit: (e: React.FormEvent) => void;
  onEditSubmit: (e: React.FormEvent) => void;
  onExecuteRetire: () => void;
  onDownloadTemplate: () => void;
}

// 🛰️ [VANGUARD] Inventory Control Suite:
// This suite is decomposed into autonomous observer blades to ensure 
// zero-render interference between different operational modes.
export const InventoryModals = ({
  ui$,
  suppliers$,
  isOffline$,
  onAddSubmit,
  onEditSubmit,
  onExecuteRetire,
  onDownloadTemplate,
}: any) => {
  return (
    <>
      <AddProductModal ui$={ui$} suppliers$={suppliers$} isOffline$={isOffline$} onSubmit={onAddSubmit} />
      <EditProductModal ui$={ui$} suppliers$={suppliers$} isOffline$={isOffline$} onSubmit={onEditSubmit} />
      <RetireProductModal ui$={ui$} onExecute={onExecuteRetire} />
      <UploadBufferModal ui$={ui$} onDownloadTemplate={onDownloadTemplate} />
    </>
  );
};

const AddProductModal = observer(({ ui$, suppliers$, isOffline$, onSubmit }: any) => {
  const isOpen = ui$?.isAddModalOpen?.get?.();
  
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.isAddModalOpen.set(false)}
      title="REGISTER_NEW_INVENTORY_ITEM"
      maxWidth="max-w-lg"
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Product Name</label>
            <ProductField observable$={ui$.formData.name} placeholder="ENTER_PRODUCT_NAME..." />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Barcode / SKU</label>
            <ProductField observable$={ui$.formData.barcode} placeholder="GENERATE_OR_SCAN..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Cost Price</label>
            <ProductField observable$={ui$.formData.costPrice} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Selling Price</label>
            <ProductField observable$={ui$.formData.sellingPrice} placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display text-orange-500 uppercase tracking-widest font-black">Margin (%)</label>
            <ProductField observable$={ui$.formData.profitMargin} readOnly className="bg-brand-steel/5 text-orange-500 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-brand-accent uppercase tracking-widest font-black">Calc. Price</label>
            <ProductField observable$={ui$.formData.finalPrice} readOnly className="bg-brand-steel/5 text-brand-accent font-bold" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <ProductSelect
              label="Category"
              observable$={ui$.formData.category}
              options={[
                { value: "CEMENT_AND_AGGREGATES", label: "CEMENT_AND_AGGREGATES" },
                { value: "STEEL_AND_METAL", label: "STEEL_AND_METAL" },
                { value: "ELECTRICAL_SUPPLIES", label: "ELECTRICAL_SUPPLIES" },
                { value: "PLUMBING_AND_WATER", label: "PLUMBING_AND_WATER" },
                { value: "PAINTS_AND_FINISHES", label: "PAINTS_AND_FINISHES" },
                { value: "TOOLS_AND_HARDWARE", label: "TOOLS_AND_HARDWARE" },
              ]}
            />
          </div>
          <div className="space-y-1">
            <ProductSelect
              label="Supplier"
              observable$={ui$.formData.supplierId}
              suppliers$={suppliers$}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <ProductSelect
              label="Unit"
              observable$={ui$.formData.unit}
              options={[
                { value: "PCS", label: "PCS" },
                { value: "BAGS", label: "BAGS" },
                { value: "MTRS", label: "MTRS" },
                { value: "KG", label: "KG" },
                { value: "LTRS", label: "LTRS" },
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Min Stock Alert</label>
            <ProductField observable$={ui$.formData.minStock} placeholder="5" />
          </div>
        </div>

        <AddModalSubmit ui$={ui$} isOffline$={isOffline$} />
      </form>
    </Modal>
  );
});

// ⚡ [ATOMIC] Isolated Submit Blade for Add Modal
const AddModalSubmit = observer(({ ui$, isOffline$ }: any) => {
  const isSubmitting = ui$?.isSubmitting?.get?.();
  const isOffline = isOffline$?.get?.();
  return (
    <button
      type="submit"
      disabled={isSubmitting || isOffline}
      className="btn-industrial btn-primary w-full py-3 flex items-center justify-center gap-2 font-display uppercase tracking-widest text-[10px]"
    >
      {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
      {isSubmitting ? "TRANSMITTING..." : "COMMIT_REGISTRATION"}
    </button>
  );
});

// ⚡ [ATOMIC] High-Performance Reactive Field
const ProductField = observer(({ observable$, ...props }: any) => {
  const value = observable$.get();
  return (
    <input
      {...props}
      className={cn("terminal-input w-full p-2 text-xs", props.className)}
      value={value}
      onChange={(e) => observable$.set(e.target.value)}
    />
  );
});

// ⚡ [ATOMIC] High-Performance Reactive Select
const ProductSelect = observer(({ observable$, label, options, suppliers$ }: any) => {
  const value = observable$.get();
  
  // Localized Reactive Intelligence: Suppliers mapping
  const selectOptions = options || suppliers$?.get()?.map((s: any) => ({ 
    value: s.id, 
    label: s.name 
  })) || [];

  return (
    <Select
      label={label}
      value={value}
      onChange={(val) => observable$.set(val)}
      options={selectOptions}
    />
  );
});

const EditProductModal = observer(({ ui$, suppliers$, isOffline$, onSubmit }: any) => {
  const editingProduct$ = ui$?.editingProduct;
  const isOpen = !!editingProduct$?.get?.();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.editingProduct.set(null)}
      title={<EditModalTitle editingProduct$={editingProduct$} />}
      maxWidth="max-w-lg"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Product Name</label>
              <ProductField observable$={ui$.editingFormData.name} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Barcode / SKU</label>
              <ProductField observable$={ui$.editingFormData.barcode} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Cost Price</label>
              <ProductField observable$={ui$.editingFormData.costPrice} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Selling Price</label>
              <ProductField observable$={ui$.editingFormData.sellingPrice} />
            </div>
          </div>

         <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <ProductSelect
              label="Category"
              observable$={ui$.editingFormData.category}
              options={[
                { value: "CEMENT_AND_AGGREGATES", label: "CEMENT_AND_AGGREGATES" },
                { value: "STEEL_AND_METAL", label: "STEEL_AND_METAL" },
                { value: "ELECTRICAL_SUPPLIES", label: "ELECTRICAL_SUPPLIES" },
                { value: "PLUMBING_AND_WATER", label: "PLUMBING_AND_WATER" },
                { value: "PAINTS_AND_FINISHES", label: "PAINTS_AND_FINISHES" },
                { value: "TOOLS_AND_HARDWARE", label: "TOOLS_AND_HARDWARE" },
              ]}
            />
          </div>
          <div className="space-y-1">
            <ProductSelect
              label="Supplier"
              observable$={ui$.editingFormData.supplierId}
              suppliers$={suppliers$}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <ProductSelect
              label="Unit"
              observable$={ui$.editingFormData.unit}
              options={[
                { value: "PCS", label: "PCS" },
                { value: "BAGS", label: "BAGS" },
                { value: "MTRS", label: "MTRS" },
                { value: "KG", label: "KG" },
                { value: "LTRS", label: "LTRS" },
              ]}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-[var(--text-main)] opacity-90 dark:opacity-60 uppercase tracking-widest">Min Stock alert</label>
            <ProductField observable$={ui$.editingFormData.minStock} />
          </div>
        </div>

        <EditModalSubmit ui$={ui$} isOffline$={isOffline$} />
      </form>
    </Modal>
  );
});

// ⚡ [ATOMIC] Isolated Title Blade
const EditModalTitle = observer(({ editingProduct$ }: any) => {
  const name = editingProduct$?.get?.()?.name || "PRODUCT";
  return <span>MANIPULATE_SPEC: {name}</span>;
});

// ⚡ [ATOMIC] Isolated Submit Blade
const EditModalSubmit = observer(({ ui$, isOffline$ }: any) => {
  const isSubmitting = ui$?.isSubmitting?.get?.();
  const isOffline = isOffline$?.get?.();
  return (
    <button
      type="submit"
      disabled={isSubmitting || isOffline}
      className="btn-industrial btn-primary w-full py-3 flex items-center justify-center gap-2 font-display uppercase tracking-widest text-[10px]"
    >
      {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
      COMMIT_SPEC_MODIFICATION
    </button>
  );
});

const RetireProductModal = observer(({ ui$, onExecute }: any) => {
  const isOpen = ui$?.isRetireModalOpen?.get?.();
  const isSubmitting = ui$?.isSubmitting?.get?.();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.isRetireModalOpen.set(false)}
      title="AUTHORIZE_RECORD_RETIREMENT"
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-danger/10 border border-danger/20 text-danger mx-auto flex items-center justify-center rounded">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-display uppercase tracking-tight text-[var(--text-main)] font-black">Destructive Action</h3>
          <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
            You are about to retire this product from the active registry. Existing sales records will be preserved.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => ui$.isRetireModalOpen.set(false)}
            className="btn-industrial bg-brand-steel/10 py-3 text-[10px]"
          >
            Cancel
          </button>
          <button 
            onClick={onExecute}
            disabled={isSubmitting}
            className="btn-industrial bg-danger text-white py-3 text-[10px] uppercase font-bold"
          >
            {isSubmitting ? "PROCESSING..." : "Retire_Asset"}
          </button>
        </div>
      </div>
    </Modal>
  );
});

const UploadBufferModal = observer(({ ui$, onDownloadTemplate }: any) => {
  const isOpen = ui$?.isUploadModalOpen?.get?.();
  const loading = ui$?.uploadLoading?.get?.();
  const uploadResult = ui$?.uploadResult?.get?.();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { refreshInventory } = useHardware();

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    ui$?.uploadLoading?.set?.(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await response.json();

      if (response.ok) {
        ui$?.uploadResult?.set?.({
          success: data.successCount,
          fail: 0,
          errors: [],
        });
        await refreshInventory(false);
      } else {
        toast.error(data.error || "UPLOAD_FAILED");
        ui$?.uploadResult?.set?.({
          success: 0,
          fail: 1,
          errors: [data.error || "The entire upload was rolled back to protect your data."],
        });
      }
    } catch (err) {
      toast.error("UPLOAD_FAILED_CHECK_NETWORK");
    } finally {
      ui$?.uploadLoading?.set?.(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        ui$?.isUploadModalOpen?.set?.(false);
        ui$?.uploadResult?.set?.(null);
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
              <div className="space-y-1">
                <p className="text-xs font-display uppercase tracking-widest text-[var(--text-main)] font-black">
                  Select Data Buffer to upload
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  SUPPORTED: .CSV, .XLSX, .XLS
                </p>
              </div>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="btn-industrial bg-brand-accent text-white w-full py-3 text-[11px] font-black tracking-[0.2em] uppercase"
              >
                {loading ? "TRANSMITTING..." : "CHOOSE_FILE"}
              </button>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
              <div className="space-y-3 pb-3 border-b border-orange-500/20">
                <p className="text-[10px] font-display text-orange-400 uppercase flex items-center gap-2 font-black tracking-widest">
                  <AlertCircle size={14} />
                  IMPORT_REQUIREMENTS
                </p>
                <button
                  onClick={onDownloadTemplate}
                  className="w-full text-[9px] font-display text-brand-accent hover:text-white transition-all uppercase tracking-widest border border-brand-accent/20 px-3 py-3 rounded bg-brand-accent/5 hover:bg-brand-accent text-center block font-bold"
                >
                  DOWNLOAD_SAMPLE_TEMPLATE.CSV
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-slate-800 dark:text-slate-400 font-mono leading-relaxed">
                  Rows must contain: <span className="text-[var(--text-main)] font-bold">Name</span>, <span className="text-[var(--text-main)] font-bold">Cost</span>, and <span className="text-[var(--text-main)] font-bold">Sales Price</span>.
                </p>
                <p className="text-[9px] text-slate-500 font-mono italic">
                  * Category, Barcode, and Stock are optional fields.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-success/10 border border-success/30 rounded">
                <p className="text-3xl font-display text-success font-black">
                  {uploadResult.success}
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-success/70 font-display">
                  SUCCESS
                </p>
              </div>
              <div className="text-center p-6 bg-danger/10 border border-danger/30 rounded">
                <p className="text-3xl font-display text-danger font-black">
                  {uploadResult.fail}
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-danger/70 font-display">
                  FAILED
                </p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-display text-slate-500 uppercase tracking-widest">
                  Error Details Report
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1 p-3 bg-black/40 border border-brand-steel/30 rounded custom-scrollbar">
                  {uploadResult.errors.map((err: string, i: number) => (
                    <p key={i} className="text-[8px] font-mono text-danger/80 break-words leading-relaxed">
                      [ERROR_{i}] {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                ui$?.isUploadModalOpen?.set?.(false);
                ui$?.uploadResult?.set?.(null);
              }}
              className="btn-industrial w-full py-4 bg-brand-steel/10 hover:bg-brand-steel/20 transition-all font-display uppercase tracking-[0.3em] text-[10px] text-[var(--text-main)] font-black"
            >
              CLOSE_COMMAND_CENTER
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
});
