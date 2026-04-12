import React, { useState, useEffect } from 'react';
import { RotateCcw, X, Package, Minus, Plus, Loader2, ShieldAlert } from 'lucide-react';
import { useHardware } from '../HardwareContext';
import { formatCurrency, cn, getLocalDateString } from '../lib/utils';
import DatePicker from './DatePicker';
import { toast } from 'sonner';

interface ReturnsProcessingModalProps {
  initialSale?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReturnsProcessingModal({ initialSale, onClose, onSuccess }: ReturnsProcessingModalProps) {
  const { recordReturn, isOffline, searchSaleByInvoice, activeShift } = useHardware();
  const today = getLocalDateString();
  const [returnDate, setReturnDate] = useState(today);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [returnState, setReturnState] = useState<Record<string, { qty: number, reason: string }>>({});

  const [sale, setSale] = useState<any>(initialSale);
  const [invoiceSearchText, setInvoiceSearchText] = useState('');
  const [isSearchingInvoice, setIsSearchingInvoice] = useState(false);

  useEffect(() => {
    if (sale) {
      const initial: any = {};
      sale.items?.forEach((item: any) => {
        initial[item.id] = { qty: 0, reason: 'Wrong Item' };
      });
      setReturnState(initial);
    }
  }, [sale]);

  const handleSearchInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceSearchText.trim()) return;
    setIsSearchingInvoice(true);
    try {
      const result = await searchSaleByInvoice(invoiceSearchText.trim());
      if (result) {
        setSale(result);
      } else {
        toast.error('Invoice not found or invalid reference');
      }
    } finally {
      setIsSearchingInvoice(false);
    }
  };

  const handleCompleteReturn = async () => {
    setIsProcessingReturn(true);
    try {
      const effectiveRate = sale.subtotal > 0 ? sale.total / sale.subtotal : 1;

      for (const [itemId, state] of Object.entries(returnState)) {
        if (state.qty > 0) {
          const item = sale.items?.find((i: any) => i.id === itemId);
          if (item) {
            // Combine selected date with current time for high-precision audit trail
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            const fullTimestamp = `${returnDate}T${timeStr}`;

            await recordReturn({
              saleId: sale.id,
              productId: item.productId,
              quantity: state.qty,
              amount: state.qty * (item.unitPrice * effectiveRate),
              reason: state.reason,
              date: fullTimestamp,
              shiftId: activeShift?.id // CRITICAL_LINK
            });
          }
        }
      }
      toast.success('TRANSACTION_FINALIZED: Stock & Cash Records Updated');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`TRANSACTION_FAILED: ${err.message}`);
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const totalRefund = Object.entries(returnState).reduce((acc, [itemId, state]) => {
    const item = sale.items?.find((i: any) => i.id === itemId);
    if (!item) return acc;
    const effectiveRate = sale.total / sale.subtotal;
    return acc + (state.qty * (item.unitPrice * effectiveRate));
  }, 0);

  return (
    <div className="industrial-modal-overlay">
      <div 
        className="industrial-modal-backdrop" 
        onClick={onClose}
      />
      <div className="industrial-modal-content !max-w-6xl h-[100dvh] sm:h-[90vh] !rounded-2xl sm:!rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 transform-gpu shadow-2xl">
        {/* Modal Header */}
        <div className="px-4 sm:px-10 py-3 sm:py-7 border-b border-brand-steel bg-[var(--bg-inset)]">
          {/* Title Row — always full width with X always visible */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-inner">
                <RotateCcw size={18} className="sm:hidden" />
                <RotateCcw size={24} className="hidden sm:block" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[10px] sm:text-sm font-display uppercase tracking-[0.15em] text-[var(--text-main)] font-bold truncate">Process Sales Return</h3>
                {sale && (
                  <span className="text-[7px] sm:text-[9px] font-mono text-slate-900 dark:text-slate-500 tracking-widest uppercase truncate block">
                    TRANS_ID: {sale.id.slice(0, 10)}...
                  </span>
                )}
              </div>
            </div>
            {/* Date picker — visible only on sm+ in the title row */}
            <div className="hidden sm:flex items-center gap-2 ml-auto mr-3 shrink-0">
              <span className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Processing Date:</span>
              <DatePicker value={returnDate} onChange={setReturnDate} />
            </div>
            {/* X button — always accessible */}
            <button
              onClick={onClose}
              className="shrink-0 hover:bg-brand-steel/50 p-2 rounded-full transition-colors text-slate-900 dark:text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          {/* Date picker row — below on mobile only */}
          <div className="flex items-center gap-2 mt-2 sm:hidden">
            <span className="text-[8px] font-display text-slate-500 uppercase tracking-widest">Processing Date:</span>
            <DatePicker value={returnDate} onChange={setReturnDate} />
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 md:overflow-hidden overflow-y-auto flex flex-col bg-[var(--bg-main)] custom-scrollbar">
          {!sale ? (
            /* Search Form View */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-steel/10 rounded-full flex items-center justify-center text-slate-900 dark:text-slate-500 mb-6 sm:mb-8 border border-brand-steel/50">
                <RotateCcw size={28} className="opacity-80 dark:opacity-50" />
              </div>
              <h4 className="text-base sm:text-lg font-display text-[var(--text-main)] uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 font-bold text-center">LOCATE RECIEPT</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-900 dark:text-slate-500 mb-8 sm:mb-10 max-w-xs sm:max-w-sm text-center font-mono uppercase leading-relaxed">
                Enter the transaction reference from the customer's receipt to begin the refund process.
              </p>

              <form onSubmit={handleSearchInvoice} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg px-4">
                <input
                  type="text"
                  className="terminal-input w-full flex-1 py-4 text-xs font-mono"
                  placeholder="ENTER TRANSACTION ID..."
                  value={invoiceSearchText}
                  onChange={(e) => setInvoiceSearchText(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearchingInvoice || !invoiceSearchText.trim()}
                  className="btn-industrial bg-brand-accent/10 text-brand-accent border border-brand-accent/30 hover:bg-brand-accent hover:text-white flex items-center justify-center gap-2 px-10 py-4 sm:py-0 text-[10px] font-bold transition-all disabled:opacity-30"
                >
                  {isSearchingInvoice ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  LOCATE
                </button>
              </form>
            </div>
          ) : (
            /* Process Return View (Approved) */
            <div className="flex flex-col flex-1 min-h-0">
              {/* Sale Summary Banner */}
              <div className="p-4 sm:p-6 bg-brand-steel/5 border-b border-brand-steel shrink-0 overflow-x-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6">
                  <div className="industrial-panel p-2.5 md:p-4 bg-[var(--bg-inset)]">
                    <span className="text-[7px] md:text-[9px] text-slate-900 dark:text-slate-500 uppercase tracking-widest block mb-1 font-display">Original_Subtotal</span>
                    <span className="text-xs md:text-sm font-mono font-bold">{formatCurrency(sale.subtotal)}</span>
                  </div>
                  <div className="industrial-panel p-2.5 md:p-4 bg-[var(--bg-inset)]">
                    <span className="text-[7px] md:text-[9px] text-slate-900 dark:text-slate-500 uppercase tracking-widest block mb-1 font-display">Applied_Discounts</span>
                    <span className="text-xs md:text-sm font-mono font-bold text-orange-500">-{formatCurrency(sale.discount)}</span>
                  </div>
                  <div className="industrial-panel p-2.5 md:p-4 bg-brand-accent/5 border-brand-accent/20">
                    <span className="text-[7px] md:text-[9px] text-brand-accent uppercase tracking-widest block mb-1 font-display">Amount_Actually_Paid</span>
                    <span className="text-base md:text-lg font-mono font-bold text-brand-accent leading-none">{formatCurrency(sale.total || 0)}</span>
                  </div>
                  <div className="industrial-panel p-2.5 md:p-4 bg-[var(--bg-inset)]">
                    <span className="text-[7px] md:text-[9px] text-slate-900 dark:text-slate-500 uppercase tracking-widest block mb-1 font-display">Processor_Method</span>
                    <span className="text-xs md:text-sm font-bold uppercase text-slate-800 dark:text-slate-400">{sale.paymentMethod?.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Return Item List */}
              <div className="md:flex-1 flex flex-col p-2 sm:p-4 md:overflow-hidden">
                <div className="flex md:grid md:grid-cols-12 justify-between items-center gap-4 px-3 md:px-6 py-2.5 md:py-4 bg-brand-steel/10 border border-brand-steel border-b-0 rounded-t-xl md:rounded-t-2xl text-[6px] md:text-[10px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest font-bold overflow-x-hidden">
                  <div className="md:col-span-5 text-left shrink-0">ITEM_PARTICULARS</div>
                  <div className="md:col-span-1 text-center hidden md:block">QTY</div>
                  <div className="md:col-span-2 text-right hidden md:block">PAID_PRICE</div>
                  <div className="md:col-span-2 text-center shrink-0">RETURN_QTY</div>
                  <div className="md:col-span-2 text-right md:text-left shrink-0">REASON</div>
                </div>

                <div className="md:flex-1 md:overflow-y-auto border border-brand-steel rounded-b-3xl divide-y divide-brand-steel/30 bg-brand-steel/5 custom-scrollbar">
                  {sale.items?.map((item: any) => {
                    const state = returnState[item.id] || { qty: 0, reason: 'Wrong Item' };
                    const effectiveRate = sale.subtotal > 0 ? sale.total / sale.subtotal : 1;
                    const pricePaid = (item.unitPrice || item.price) * effectiveRate;

                    return (
                      <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:p-5 items-center group hover:bg-brand-steel/10 transition-all border-b border-brand-steel/20 last:border-b-0 bg-[var(--bg-panel)]">
                        {/* Hero Section: Item Details */}
                        <div className="w-full md:col-span-5 flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-brand-steel/5 border border-brand-steel/50 rounded-lg sm:rounded-xl flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform duration-300">
                            <Package size={20} strokeWidth={1.5} className="sm:hidden" />
                            <Package size={24} strokeWidth={1.5} className="hidden sm:block" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-[var(--text-main)] uppercase tracking-tight line-clamp-1">{item.productName || item.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[9px] sm:text-[11px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 px-2 py-0.5 rounded">ID: {item.productId.slice(-8).toUpperCase()}</span>
                              {(item.returnedQuantity || 0) > 0 && (
                                <span className={cn(
                                  "text-[8px] sm:text-[10px] px-2 py-0.5 rounded uppercase font-bold border tracking-tighter",
                                  (item.returnedQuantity || 0) >= item.quantity
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                )}>
                                  {(item.returnedQuantity || 0) >= item.quantity ? 'FULLY_REFUNDED' : `PARTIAL_REFUND: ${item.returnedQuantity}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price & Quantity Info */}
                        <div className="w-full md:col-span-1 flex md:justify-center items-center gap-2">
                          <span className="md:hidden text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Purchased_Qty:</span>
                          <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-400">{item.quantity}</span>
                        </div>

                        <div className="w-full md:col-span-2 flex md:flex-col justify-between md:text-right items-center md:items-end gap-1">
                          <span className="md:hidden text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Adjusted_Price:</span>
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-mono font-bold text-brand-accent">{formatCurrency(pricePaid)}</span>
                            {effectiveRate < 0.99 && (
                              <p className="text-[8px] sm:text-[11px] font-mono text-orange-600 uppercase font-black tracking-widest italic opacity-80 leading-none">
                                PROPORTIONAL_ADJUSTMENT
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Zone: Return Qty Controls */}
                        <div className="w-full md:col-span-2 flex justify-between md:justify-center items-center gap-4">
                          <span className="md:hidden text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Return_Amount:</span>
                          <div className="flex items-center gap-3 sm:gap-4 bg-[var(--bg-inset)] border border-brand-steel rounded-xl p-1 shadow-inner md:scale-110">
                            <button
                              type="button"
                              onClick={() => setReturnState(prev => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], qty: Math.max(0, state.qty - 1) }
                              }))}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded hover:bg-brand-steel/50 flex items-center justify-center text-slate-900 dark:text-slate-500 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold font-mono text-brand-accent">{state.qty}</span>
                            <button
                              type="button"
                              disabled={(item.returnedQuantity || 0) + state.qty >= item.quantity}
                              onClick={() => setReturnState(prev => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], qty: Math.min(item.quantity - (item.returnedQuantity || 0), state.qty + 1) }
                              }))}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded hover:bg-brand-steel/50 flex items-center justify-center text-slate-800 dark:text-slate-400 hover:text-white transition-all active:scale-90 disabled:opacity-20"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Reason Selection */}
                        <div className="w-full md:col-span-2">
                          <select
                            value={state.reason}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReturnState(prev => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], reason: val }
                              }));
                            }}
                            className="w-full text-[10px] bg-brand-steel/5 border border-brand-steel/50 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-brand-accent outline-none transition-all cursor-pointer font-bold uppercase tracking-wider"
                          >
                            {['Wrong Item', 'Defective', 'Over_Ordered', 'Expired', 'Customer_Regret'].map(reason => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Footer */}
              <div className="p-4 sm:p-6 bg-brand-steel/10 border-t border-brand-steel md:mt-auto shrink-0 md:overflow-y-auto">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 lg:gap-10">
                  <div className="hidden lg:block flex-1 space-y-4">
                    <div className="bg-orange-500/5 border-l-4 border-orange-500 p-4 sm:p-6 rounded-r-xl shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert size={16} className="text-orange-600" />
                        <span className="text-[10px] sm:text-[12px] font-display font-bold text-orange-600 uppercase tracking-[0.2em]">Compliance & Audit Protocol</span>
                      </div>
                      <p className="text-[9px] sm:text-[11px] text-slate-900 dark:text-slate-500 font-medium leading-relaxed uppercase max-w-2xl">
                        Reversing a sale triggers automatic inventory re-entry. The financial impact will be reflected across all operational reports immediately.
                        Processor_Auth: <span className="text-orange-500">AUTHORIZED</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full lg:w-[450px] space-y-4">
                    <div className="industrial-panel p-4 sm:p-6 bg-[var(--bg-inset)] border-brand-steel/50 space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-900 dark:text-slate-500 font-mono uppercase tracking-[0.2em]">
                        <span>Gross_Item_Refund</span>
                        <span className="font-bold underline">{formatCurrency(Object.entries(returnState).reduce((acc, [itemId, state]) => {
                          const item = sale.items?.find((i: any) => i.id === itemId);
                          return acc + (state.qty * (item?.unitPrice || item?.price || 0));
                        }, 0))}</span>
                      </div>
                      <div className="h-px bg-brand-steel/30" />
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-display text-slate-900 dark:text-slate-500">Total Refund Due</span>
                          {sale.discount > 0 && (
                            <span className="text-[8px] sm:text-[9px] text-orange-500 font-mono italic font-bold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/20 w-fit uppercase">Discount_Corrected</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl text-orange-600 font-mono font-bold block leading-none tracking-tight">
                            {formatCurrency(totalRefund)}
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-slate-900 dark:text-slate-500 font-mono uppercase tracking-widest mt-1.5 block opacity-80 dark:opacity-50">Authorized_Payout</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={onClose}
                        className="flex-1 py-4 sm:py-5 border border-brand-steel rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-display font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-brand-steel/20 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isProcessingReturn || Object.values(returnState).every((s: any) => s.qty === 0) || isOffline}
                        onClick={handleCompleteReturn}
                        className={cn(
                          "flex-[1.8] py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-display font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95",
                          isProcessingReturn || Object.values(returnState).every((s: any) => s.qty === 0) || isOffline
                            ? "bg-brand-steel/30 text-slate-900 dark:text-slate-500 cursor-not-allowed grayscale"
                            : "btn-primary shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                        )}
                      >
                        {isProcessingReturn ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                        COMPLETE_AUDIT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
