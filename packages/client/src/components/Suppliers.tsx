import React, { useState, useMemo, useCallback } from 'react';
import { Truck, Phone, Mail, Plus, Search, ChevronRight, DollarSign, Upload, AlertTriangle, History, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useHardware, API_BASE_URL } from '../HardwareContext';
import { Supplier } from '../types';
import Modal from './Modal';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [poQuantities, setPoQuantities] = useState<Record<string, number>>({});
  const [isPOProcessing, setIsPOProcessing] = useState(false);
  const [historyTransactions, setHistoryTransactions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { suppliers, products, addSupplier, refreshSuppliers, adjustStock, updateSupplier, getInventoryTransactions, isOffline } = useHardware();

  const supplierProducts = useMemo(
    () => products.filter(p => p.supplierId === selectedSupplier?.id),
    [products, selectedSupplier]
  );

  const estimatedTotal = useMemo(() => {
    return Object.entries(poQuantities).reduce((sum, [id, qty]) => {
      const product = products.find(p => p.id === id);
      return sum + (product ? product.costPrice * qty : 0);
    }, 0);
  }, [poQuantities, products]);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
  });

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('BUSINESS_NAME_REQUIRED');
    if (!formData.contact) return toast.error('CONTACT_NAME_REQUIRED');
    if (!formData.phone) return toast.error('PHONE_NUMBER_REQUIRED');

    setIsSubmitting(true);
    try {
      await addSupplier({ name: formData.name, contact: formData.contact, phone: formData.phone, email: formData.email });
      setIsModalOpen(false);
      setFormData({ name: '', contact: '', phone: '', email: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const itemsToAdjust = Object.entries(poQuantities).filter(([_, qty]) => qty > 0);
    if (itemsToAdjust.length === 0) return toast.error('PLEASE_ENTER_QUANTITIES_FOR_AT_LEAST_ONE_ITEM');

    setIsPOProcessing(true);
    try {
      let totalValue = 0;
      for (const [id, qty] of itemsToAdjust) {
        const product = products.find(p => p.id === id);
        if (product) {
          totalValue += product.costPrice * qty;
          await adjustStock(id, qty, 'purchase', `PO: ${selectedSupplier.name}`);
        }
      }
      const newBalance = selectedSupplier.balance + totalValue;
      await updateSupplier(selectedSupplier.id, { balance: newBalance });
      setSelectedSupplier(prev => prev ? { ...prev, balance: newBalance } : prev);
      toast.success('PURCHASE_ORDER_EXECUTED_SUCCESSFULLY');
      setIsPOModalOpen(false);
      setPoQuantities({});
      await refreshSuppliers();
    } catch (err: any) {
      toast.error(`PO_EXECUTION_FAILED: ${err.message}`);
    } finally {
      setIsPOProcessing(false);
    }
  };

  const handleViewHistory = useCallback(async () => {
    if (!selectedSupplier || supplierProducts.length === 0) {
      setIsHistoryModalOpen(true);
      setHistoryTransactions([]);
      return;
    }
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryTransactions([]);
    try {
      const results = await Promise.all(
        supplierProducts.map(p => getInventoryTransactions(p.id))
      );
      const allTx = results.flatMap((txList, i) =>
        txList.map((tx: any) => ({ ...tx, productName: supplierProducts[i]?.name || 'Unknown' }))
      );
      allTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistoryTransactions(allTx);
    } catch (err: any) {
      toast.error(`HISTORY_LOAD_FAILED: ${err.message}`);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedSupplier, supplierProducts, getInventoryTransactions]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('ENTER_A_VALID_PAYMENT_AMOUNT');
    if (amount > selectedSupplier.balance) return toast.error('PAYMENT_EXCEEDS_OUTSTANDING_BALANCE');

    setIsPaymentProcessing(true);
    try {
      const newBalance = selectedSupplier.balance - amount;
      await updateSupplier(selectedSupplier.id, { balance: newBalance });
      setSelectedSupplier(prev => prev ? { ...prev, balance: newBalance } : prev);
      toast.success(`PAYMENT_OF_UGX_${amount.toLocaleString()}_RECORDED`);
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      await refreshSuppliers();
    } catch (err: any) {
      toast.error(`PAYMENT_FAILED: ${err.message}`);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.includes(searchTerm)
  );

  const txTypeColor = (type: string) => {
    if (type === 'purchase') return 'text-brand-accent';
    if (type === 'sale') return 'text-success';
    if (type === 'adjustment') return 'text-yellow-400';
    return 'text-[var(--text-muted)]';
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-6 gap-6 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[var(--text-main)]">Procurement Hub</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">SUPPLY_CHAIN_MANAGEMENT // ACTIVE_VENDORS: {suppliers.length}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isOffline}
            className={cn("btn-industrial bg-brand-steel/20 border-brand-steel/50 flex items-center justify-center gap-2 hover:bg-brand-steel/40 py-2.5 sm:py-2 text-[9px] sm:text-[10px]", isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed")}
          >
            <Upload size={14} />IMPORT_VENDORS
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isOffline}
            className={cn("btn-industrial btn-primary flex items-center justify-center gap-2 py-2.5 sm:py-2 text-[9px] sm:text-[10px]", isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed")}
          >
            <Plus size={14} />{isOffline ? 'OFFLINE_LOCKED' : 'ONBOARD_SUPPLIER'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:flex-1 lg:overflow-hidden lg:min-h-0">
        {/* Vendor Directory */}
        <div className={cn(
          "col-span-1 lg:col-span-4 industrial-panel flex flex-col lg:overflow-hidden",
          selectedSupplier && "hidden lg:flex"
        )}>
          <div className="industrial-panel-header border-b border-brand-steel pb-2">
            <span className="text-[10px] font-display text-[var(--text-muted)]">VENDOR_DIRECTORY</span>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-500 dark:text-slate-900 dark:text-slate-500" size={12} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="SEARCH_VENDORS..." className="terminal-input pl-8 py-1 text-[10px] w-full sm:w-40" />
            </div>
          </div>
          <div className="lg:flex-1 lg:overflow-y-auto">
            {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
              <button
                key={supplier.id}
                onClick={() => setSelectedSupplier(supplier)}
                className={`w-full text-left p-4 border-b border-brand-steel/30 transition-all hover:bg-brand-steel/10 flex items-center justify-between group ${selectedSupplier?.id === supplier.id ? 'bg-brand-steel/20 border-l-2 border-l-brand-accent' : ''}`}
              >
                <div>
                  <div className="text-xs font-display text-[var(--text-main)] group-hover:text-brand-accent transition-colors">{supplier.name}</div>
                  <div className="text-[10px] font-mono text-slate-900 dark:text-slate-500 mt-1">{supplier.phone}</div>
                  {supplier.balance > 0 && (
                    <div className="text-[9px] font-mono text-danger mt-0.5">BAL: UGX {supplier.balance.toLocaleString()}</div>
                  )}
                </div>
                <ChevronRight size={14} className={`text-slate-900 dark:text-slate-500 group-hover:text-brand-accent transition-all ${selectedSupplier?.id === supplier.id ? 'translate-x-1' : ''}`} />
              </button>
            )) : (
              <div className="p-8 text-center text-slate-900 dark:text-slate-500 font-display text-[10px]">NO_VENDORS_FOUND</div>
            )}
          </div>
        </div>

        {/* Supplier Detail Panel */}
        <div className={cn(
          "col-span-1 lg:col-span-8 flex flex-col gap-6 lg:overflow-hidden",
          !selectedSupplier && "hidden lg:flex"
        )}>
          {selectedSupplier ? (
            <>
              {/* Intelligence Header */}
              <div className="industrial-panel p-6">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="lg:hidden flex items-center gap-2 text-[10px] font-display text-brand-accent mb-4 border border-brand-accent/30 px-3 py-1 bg-brand-accent/5"
                >
                  <ChevronRight className="rotate-180" size={12} /> BACK_TO_DIRECTORY
                </button>
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-steel/30 flex items-center justify-center text-brand-accent">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display text-[var(--text-main)]">{selectedSupplier.name}</h2>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] font-medium"><Phone size={10} /> {selectedSupplier.phone}</span>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] font-medium"><Mail size={10} /> {selectedSupplier.contact}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-0 border-brand-steel/30 pt-4 sm:pt-0">
                    <div className="text-[9px] font-display text-[var(--text-muted)] mb-1">OUTSTANDING_BALANCE</div>
                    <div className={`text-2xl font-display ${selectedSupplier.balance > 0 ? 'text-danger' : 'text-success'}`}>
                      UGX {selectedSupplier.balance.toLocaleString()}
                    </div>
                    {selectedSupplier.balance > 0 && (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        disabled={isOffline}
                        className={cn("mt-2 btn-industrial text-[8px] py-1 px-3 flex items-center gap-1 sm:ml-auto border-success/40 text-success hover:bg-success/10", isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed")}
                      >
                        <ArrowDownLeft size={10} />{isOffline ? 'LOCKED' : 'RECORD_PAYMENT'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-brand-dark/50 border border-brand-steel p-3">
                    <div className="text-[8px] font-display text-[var(--text-muted)] mb-1 uppercase tracking-widest">Total Orders</div>
                    <div className="text-lg font-display text-[var(--text-main)]">{selectedSupplier.totalOrders || 0}</div>
                  </div>
                  <div className="bg-brand-dark/50 border border-brand-steel p-3 overflow-hidden">
                    <div className="text-[8px] font-display text-[var(--text-muted)] mb-1 uppercase tracking-widest">Last Delivery</div>
                    <div className="text-xs font-display text-[var(--text-main)] truncate" title={selectedSupplier.lastDelivery ? new Date(selectedSupplier.lastDelivery).toLocaleDateString() : 'NEVER'}>
                      {selectedSupplier.lastDelivery
                        ? new Date(selectedSupplier.lastDelivery).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_').toUpperCase()
                        : 'NEVER'}
                    </div>
                  </div>
                  <div className="bg-brand-dark/50 border border-brand-steel p-3">
                    <div className="text-[8px] font-display text-[var(--text-muted)] mb-1 uppercase tracking-widest">Reliability</div>
                    <div className="text-lg font-display text-success">
                      {selectedSupplier.reliabilityScore ? `${selectedSupplier.reliabilityScore}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplied Inventory Table */}
              <div className="industrial-panel lg:flex-1 flex flex-col overflow-visible">
                <div className="industrial-panel-header border-b border-brand-steel py-3 sm:py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4">
                  <span className="text-[10px] font-display text-[var(--text-muted)]">SUPPLIED_INVENTORY</span>
                  <div className="flex gap-2 w-full sm:w-auto min-w-0">
                    <button onClick={handleViewHistory} className="btn-industrial btn-outline py-2 sm:py-1 px-3 text-[9px] sm:text-[8px] flex-1 sm:flex-none flex items-center justify-center gap-1 min-w-0 overflow-hidden">
                      <History size={10} className="shrink-0" /><span className="truncate">VIEW_HISTORY</span>
                    </button>
                    <button
                      onClick={() => setIsPOModalOpen(true)}
                      disabled={isOffline}
                      className={cn("btn-industrial btn-primary py-2 sm:py-1 px-3 text-[9px] sm:text-[8px] flex-1 sm:flex-none min-w-0 overflow-hidden", isOffline && "opacity-80 dark:opacity-50 grayscale cursor-not-allowed")}
                    >
                      <span className="truncate">{isOffline ? 'SYNC_PAUSED' : 'NEW_PURCHASE_ORDER'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                  <table className="data-table min-w-[800px]">
                    <thead>
                      <tr>
                        <th>ITEM_ID</th>
                        <th>PRODUCT_NAME</th>
                        <th>CURRENT_STOCK</th>
                        <th>UNIT_COST</th>
                        <th>TOTAL_VALUE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierProducts.map(product => (
                        <tr key={product.id}>
                          <td className="font-mono text-[var(--text-main)] font-bold" title={product.id}>#{product.id.slice(0, 8)}...</td>
                          <td className="font-display text-[10px] text-[var(--text-main)] font-black">{product.name.toUpperCase()}</td>
                          <td className="font-mono text-[var(--text-main)] font-bold">{product.stock} {product.unit}</td>
                          <td className="font-mono text-[var(--text-main)] font-bold">UGX {product.costPrice.toLocaleString()}</td>
                          <td className="font-mono text-[var(--text-main)] font-black tracking-tight">UGX {(product.stock * product.costPrice).toLocaleString()}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className={`status-indicator ${product.stock <= product.minStock ? 'bg-danger animate-pulse' : 'bg-success'}`} />
                              <span className="text-[9px] font-display text-[var(--text-main)]">{product.stock <= product.minStock ? 'CRITICAL' : 'OPTIMAL'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {supplierProducts.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-8 text-[var(--text-muted)] font-display text-[10px]">NO_PRODUCTS_LINKED_TO_VENDOR</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 industrial-panel flex flex-col items-center justify-center text-slate-900 dark:text-slate-500">
              <Truck size={48} className="mb-4 opacity-20" />
              <div className="font-display text-xs uppercase tracking-widest">SELECT_VENDOR_FOR_INTELLIGENCE</div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => { setIsUploadModalOpen(false); setUploadResult(null); }} title="BULK_VENDOR_IMPORT" maxWidth="max-w-md">
        <div className="space-y-6">
          {!uploadResult ? (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-brand-steel/50 rounded bg-brand-dark/30 text-center space-y-4">
                <div className="w-12 h-12 bg-brand-steel/20 rounded-full flex items-center justify-center mx-auto text-brand-accent"><Upload size={24} /></div>
                <div>
                  <p className="text-xs font-display uppercase tracking-widest">Select vendor file</p>
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 mt-1 font-mono">SUPPORTED: .CSV, .XLSX</p>
                </div>
                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" id="supplier-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadLoading(true);
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/inventory/upload-suppliers`, { method: 'POST', body: fd });
                      const contentType = response.headers.get("content-type");
                      if (contentType && contentType.includes("application/json")) {
                        const data = await response.json();
                        if (response.ok) { setUploadResult({ success: data.successCount, errors: [] }); await refreshSuppliers(); }
                        else toast.error(data.error || 'IMPORT_FAILED');
                      } else toast.error('SERVER_ERROR_NOT_JSON');
                    } catch { toast.error('CONNECTION_FAIL_CHECK_NETWORK'); }
                    finally { setUploadLoading(false); }
                  }}
                />
                <button disabled={uploadLoading} onClick={() => document.getElementById('supplier-upload')?.click()} className="btn-industrial btn-primary w-full py-2">
                  {uploadLoading ? 'PROCESSING...' : 'CHOOSE_VENDOR_FILE'}
                </button>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
                <p className="text-[10px] font-display text-orange-400 uppercase flex items-center gap-2 font-bold tracking-tighter"><AlertTriangle size={14} />IMPORT_REQUIREMENTS</p>
                <button onClick={() => {
                  const blob = new Blob(["Name,Contact Person,Phone,Email,Balance\nUganda Baati,John Doe,+256700000000,sales@ugandabaati.com,1500000"], { type: 'text/csv' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hardware_suppliers_template.csv'; a.click();
                }} className="w-full text-[9px] font-display text-brand-accent border border-brand-accent/30 px-3 py-2 bg-brand-accent/5 hover:bg-brand-accent hover:text-white transition-colors text-center block">
                  DOWNLOAD_VENDOR_TEMPLATE.CSV
                </button>
                <p className="text-[9px] text-slate-800 dark:text-slate-400 font-mono">Rows must contain: <span className="text-[var(--text-main)]">Name</span> and <span className="text-[var(--text-main)]">Phone</span>. Others optional.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-8 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-4xl font-display text-success mb-2">{uploadResult.success}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-success/70 font-display">VENDORS_ONBOARDED_SUCCESSFULLY</p>
              </div>
              <button onClick={() => { setIsUploadModalOpen(false); setUploadResult(null); }} className="btn-industrial w-full py-2">CLOSE_AND_PROCEED</button>
            </div>
          )}
        </div>
      </Modal>

      {/* New Purchase Order Modal */}
      <Modal isOpen={isPOModalOpen} onClose={() => setIsPOModalOpen(false)} title={`NEW_PURCHASE_ORDER // ${selectedSupplier?.name}`} maxWidth="max-w-lg">
        <form className="space-y-6" onSubmit={handlePOSubmit}>
          <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 text-[10px] font-mono text-brand-accent">
            GENERATING_PO_FOR_VENDOR_ID: {selectedSupplier?.id.slice(0, 8)}...
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[9px] font-display text-slate-900 dark:text-slate-500 border-b border-brand-steel pb-1">
              <span>ITEM_DESCRIPTION</span>
              <div className="flex gap-8"><span>QUANTITY</span><span>LINE_TOTAL</span></div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto px-1">
              {supplierProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-brand-dark/30 p-2 border border-brand-steel/30 rounded">
                  <div className="flex flex-col">
                    <span className="text-xs text-black dark:text-[var(--text-main)] font-display">{p.name}</span>
                    <span className="text-[8px] font-mono text-slate-700 dark:text-slate-900 dark:text-slate-500">#{p.id.slice(0, 8)}... | STK: {p.stock} | COST: UGX {p.costPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input type="number" min="0" className="terminal-input w-20 p-2 text-xs text-right border-brand-accent/30" placeholder="0"
                      value={poQuantities[p.id] || ''}
                      onChange={e => { const v = parseInt(e.target.value); setPoQuantities(prev => ({ ...prev, [p.id]: isNaN(v) ? 0 : v })); }}
                    />
                    <span className="text-[10px] font-mono text-brand-accent w-28 text-right">UGX {(p.costPrice * (poQuantities[p.id] || 0)).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {supplierProducts.length === 0 && <div className="text-center py-8 opacity-40 text-[10px] font-display">NO_PRODUCTS_AVAILABLE_FOR_RESTOCK</div>}
            </div>
          </div>
          <div className="pt-4 border-t border-brand-steel flex justify-between items-center">
            <div>
              <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Estimated Total (Credit)</div>
              <div className="text-xl font-display text-brand-accent">UGX {estimatedTotal.toLocaleString()}</div>
            </div>
            <button type="submit" disabled={isPOProcessing || estimatedTotal === 0}
              className={cn("btn-industrial px-8 py-3 flex items-center justify-center gap-2", isPOProcessing ? "opacity-80 dark:opacity-50 cursor-wait" : "btn-primary")}
            >
              {isPOProcessing ? <Loader2 size={14} className="animate-spin" /> : null}
              {isPOProcessing ? 'PROCESSING_ORDER...' : 'COMMENCE_PROCUREMENT'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaction History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`TRANSACTION_HISTORY // ${selectedSupplier?.name}`} maxWidth="max-w-2xl">
        {historyLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-90 dark:opacity-60">
            <div className="w-8 h-8 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
            <p className="text-[10px] font-display tracking-widest">LOADING_TRANSACTION_LEDGER...</p>
          </div>
        ) : historyTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
            <History size={40} strokeWidth={1} />
            <p className="text-[10px] font-display tracking-widest">NO_TRANSACTIONS_ON_RECORD</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar max-h-[60vh]">
            <table className="data-table min-w-[600px]">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>PRODUCT</th>
                  <th>TYPE</th>
                  <th>QTY</th>
                  <th>UNIT_COST</th>
                  <th>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {historyTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="font-mono text-[9px] text-[var(--text-main)]">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="font-display text-[10px] text-[var(--text-main)]">{tx.productName}</td>
                    <td><span className={cn('text-[9px] font-mono font-bold uppercase', txTypeColor(tx.type))}>{tx.type}</span></td>
                    <td className="font-mono text-[var(--text-main)] font-bold">{tx.quantity}</td>
                    <td className="font-mono text-[var(--text-main)]">UGX {tx.unitCost ? parseFloat(tx.unitCost).toLocaleString() : '—'}</td>
                    <td className="text-[9px] text-[var(--text-main)] max-w-[140px] truncate" title={tx.notes}>{tx.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => { setIsPaymentModalOpen(false); setPaymentAmount(''); }} title={`RECORD_PAYMENT // ${selectedSupplier?.name}`} maxWidth="max-w-sm">
        <form className="space-y-6" onSubmit={handleRecordPayment}>
          <div className="p-4 bg-danger/5 border border-danger/20 space-y-1">
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 dark:text-slate-900 dark:text-slate-500 uppercase tracking-widest">OUTSTANDING_BALANCE</div>
            <div className="text-2xl font-display text-danger">UGX {selectedSupplier?.balance.toLocaleString()}</div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Payment Amount (UGX)</label>
            <input type="number" min="1" max={selectedSupplier?.balance} className="terminal-input w-full p-3 text-lg font-display text-right"
              placeholder="0" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} autoFocus
            />
            {paymentAmount && !isNaN(parseFloat(paymentAmount)) && (
              <div className="text-[9px] font-mono text-success text-right">
                NEW_BALANCE: UGX {Math.max(0, (selectedSupplier?.balance || 0) - parseFloat(paymentAmount)).toLocaleString()}
              </div>
            )}
          </div>
          <button type="submit" disabled={isPaymentProcessing || !paymentAmount}
            className={cn("btn-industrial w-full py-3 flex items-center justify-center gap-2", isPaymentProcessing ? "opacity-80 dark:opacity-50 cursor-wait" : "btn-primary")}
          >
            {isPaymentProcessing ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
            {isPaymentProcessing ? 'PROCESSING_PAYMENT...' : 'CONFIRM_PAYMENT'}
          </button>
        </form>
      </Modal>

      {/* Onboard Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="ONBOARD_NEW_SUPPLIER" maxWidth="max-w-md">
        <form className="space-y-4" onSubmit={handleOnboardSubmit}>
          {[
            { label: 'BUSINESS_NAME *', key: 'name', placeholder: 'e.g. Uganda Baati Ltd' },
            { label: 'CONTACT_PERSON *', key: 'contact', placeholder: 'e.g. John Doe' },
            { label: 'PHONE_NUMBER *', key: 'phone', placeholder: 'e.g. +256 700 000 000' },
            { label: 'EMAIL_ADDRESS', key: 'email', placeholder: 'e.g. orders@supplier.com' },
          ].map(field => (
            <div key={field.key} className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 dark:text-slate-900 dark:text-slate-500 uppercase">{field.label}</label>
              <input type={field.key === 'email' ? 'email' : 'text'} className="terminal-input w-full p-2 text-black dark:text-[var(--text-main)]" placeholder={field.placeholder}
                value={(formData as any)[field.key]} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          ))}
          <button type="submit" disabled={isSubmitting} className="btn-industrial btn-primary w-full py-2 flex items-center justify-center gap-2 mt-2">
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {isSubmitting ? 'PROCESSING...' : 'ONBOARD_SUPPLIER'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
