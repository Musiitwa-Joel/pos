import React, { useMemo } from 'react';
import {
  Receipt,
  Banknote,
  Smartphone,
  CreditCard,
  UserPlus,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from '@legendapp/state/react';
import { usePOS } from '../../POSContext';
import { useHardware } from '../../HardwareContext';
import { formatCurrency, cn } from '../../lib/utils';
import Select from '../Select';
import { PaymentMethod } from '../../types';

interface POSCheckoutProps {
  ui$: any;
  onCompleteSale: () => void;
  onHoldSale: (manualDiscount: number) => void;
}

// 🛰️ [VANGUARD] Checkout Control Center:
// Isolated reactive component for payment, loyalty, and final settlement.
export const POSCheckout = observer(({
  ui$,
  onCompleteSale,
  onHoldSale
}: POSCheckoutProps) => {
  const { posState$, setPosDiscount, setPaymentMethod, setSelectedCustomerId } = usePOS();
  const { customers, currentUser, activeShift, isOffline, addSystemLog, promotions } = useHardware();

  const cart = posState$.cart.get();
  const paymentMethod = posState$.paymentMethod.get();
  const discount = posState$.posDiscount.get();
  const selectedCustomerId = posState$.selectedCustomerId.get();
  const autoPrint = ui$.autoPrint.get();
  const isSuccess = ui$.isSuccess.get();
  const isProcessing = ui$.isProcessing.get();
  const vetoedPromoIds = ui$.vetoedPromoIds.get();

  // 💰 Internal Financial Intelligence
  const subtotal = useMemo(() =>
    cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
    [cart]);

  const activePromos = useMemo(() => {
    const now = Date.now();
    return promotions.filter((p) => {
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.endDate).getTime();
      return p.isActive && now >= start && now <= end;
    });
  }, [promotions]);

  const promoDiscount = useMemo(() => {
    const livePromos = activePromos.filter(p => !vetoedPromoIds.includes(p.id));
    if (livePromos.length === 0) return 0;

    return cart.reduce((totalAcc: number, item: any) => {
      let bestItemDiscount = 0;
      livePromos.forEach((promo) => {
        const isGlobal = !promo.productIds || promo.productIds.length === 0;
        const isEligible = isGlobal || promo.productIds?.includes(item.id);
        if (isEligible) {
          let currentPromoVal = 0;
          if (promo.type === "percentage") {
            currentPromoVal = (item.price * item.quantity * promo.value) / 100;
          } else {
            currentPromoVal = isGlobal ? (promo.value / cart.length) : Math.min(promo.value, item.price * item.quantity);
          }
          if (currentPromoVal > bestItemDiscount) bestItemDiscount = currentPromoVal;
        }
      });
      return totalAcc + bestItemDiscount;
    }, 0);
  }, [activePromos, cart, vetoedPromoIds]);

  const total = Math.max(0, subtotal - promoDiscount - discount);

  return (
    <div className={cn(
      "w-full flex flex-col md:flex-none flex-1 min-h-0 gap-1 bg-[var(--bg-panel)] overflow-visible custom-scrollbar pb-6 lg:pb-0",
      ui$.checkoutTab.get() !== 'settle' && "hidden md:flex"
    )}>
      <div className="industrial-panel flex flex-col min-h-0 h-full bg-[var(--bg-panel)] lg:bg-transparent overflow-visible">
        <div className="industrial-panel-header shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-brand-accent" />
            <span className="text-[10px] font-display uppercase tracking-widest">
              Checkout_Control
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar min-h-0">
          {/* Payment Selection */}
          <div className="space-y-2">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              PAYMENT_METHOD
            </label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: "cash", icon: Banknote, label: "CASH" },
                { id: "mobile_money", icon: Smartphone, label: "MOBILE" },
                { id: "bank", icon: CreditCard, label: "BANK" },
                { id: "credit", icon: UserPlus, label: "CREDIT" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={cn(
                    "flex items-center gap-2 p-2 border transition-all text-[10px] font-bold",
                    paymentMethod === method.id
                      ? "bg-brand-accent/10 border-brand-accent text-brand-accent"
                      : "bg-brand-dark border-brand-steel text-slate-900 dark:text-slate-500 hover:border-slate-400",
                  )}
                >
                  <method.icon size={14} />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "credit" && (
            <div className="space-y-2">
              <Select
                label="CUSTOMER_FOR_CREDIT"
                options={customers.map((c) => ({
                  label: `${c.name} (${formatCurrency(c.balance)})`,
                  value: c.id,
                }))}
                value={selectedCustomerId}
                onChange={(val) => setSelectedCustomerId(val)}
                placeholder="SELECT_CUSTOMER..."
              />
            </div>
          )}

          {/* Print Toggle */}
          <div className="flex items-center justify-between p-2 bg-brand-dark/30 border border-brand-steel rounded-none mt-2">
            <label className="text-[10px] font-display text-slate-800 dark:text-slate-400 uppercase tracking-widest leading-none pt-1">
              PRINT_RECEIPT
            </label>
            <button
              onClick={() => ui$.autoPrint.set(!ui$.autoPrint.peek())}
              className={cn(
                "w-10 h-5 rounded-full relative transition-all",
                autoPrint ? "bg-brand-accent" : "bg-slate-700",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  autoPrint ? "right-1" : "left-1",
                )}
              />
            </button>
          </div>

          {/* Shift Summary */}
          <div className="p-3 bg-brand-dark/40 border-y border-brand-steel/50 my-2 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-900 dark:text-slate-500 uppercase tracking-tighter">
                OPERATOR_ID
              </span>
              <span className="text-brand-accent uppercase">
                {currentUser?.name || "ADMIN_USER"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-900 dark:text-slate-500 uppercase tracking-tighter">
                SHIFT_COMMENCED
              </span>
              <span className="text-slate-800 dark:text-slate-400">
                {activeShift
                  ? new Date(activeShift.startTime).toLocaleTimeString()
                  : "--:--"}
              </span>
            </div>
            <button
              onClick={() => ui$.showClosingModal.set(true)}
              className="w-full mt-2 py-2 border border-danger/40 text-danger hover:bg-danger/10 text-[8px] font-display uppercase tracking-widest transition-all"
            >
              Terminate_Shift_Protocol
            </button>
          </div>

          <div className="flex-1" />

          {/* Summary Totals */}
          <div className="space-y-2 pt-4 border-t border-brand-steel">
            <div className="flex justify-between text-[10px] text-slate-900 dark:text-slate-500 font-mono tracking-tighter">
              <span>SUBTOTAL</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-900 dark:text-slate-500 font-mono tracking-tighter">
              <div className="flex items-center gap-1">
                <span>MANUAL_OVERRIDE</span>
                <button
                  onClick={() => ui$.isDiscountModalOpen.set(true)}
                  className="p-1 hover:bg-brand-steel rounded text-brand-accent transition-colors"
                >
                  <Plus size={10} />
                </button>
                {discount > 0 && (
                  <button
                    onClick={() => {
                      setPosDiscount(0);
                    }}
                    className="p-1 hover:bg-danger/20 rounded text-danger transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              <span className="text-danger">
                {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
              </span>
            </div>

            {activePromos.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-brand-accent font-mono font-black tracking-tighter uppercase mb-1">
                  SYSTEM_PROMOTIONS:
                </div>
                {activePromos.map((p) => {
                  const isVetoed = vetoedPromoIds.includes(p.id);
                  return (
                    <div key={p.id} className={cn(
                      "flex justify-between items-center text-[9px] font-mono tracking-tighter transition-all",
                      isVetoed ? "opacity-30 line-through" : "text-brand-accent"
                    )}>
                      <div className="flex items-center gap-1">
                        <span>- {p.name}</span>
                        <button
                          onClick={() => {
                            if (isVetoed) {
                              ui$.vetoedPromoIds.set(prev => (prev as string[]).filter(vid => vid !== p.id));
                            } else {
                              ui$.vetoedPromoIds.set(prev => [...(prev as string[]), p.id]);
                              addSystemLog({
                                action: "PROMO_VETO",
                                target: `PROMO: ${p.name.toUpperCase()}`,
                                oldValue: "ACTIVE",
                                newValue: "BYPASSED_MANUALLY"
                              });
                            }
                          }}
                          className="p-0.5 hover:bg-brand-steel rounded ml-1"
                        >
                          {isVetoed ? <Plus size={8} /> : <X size={8} />}
                        </button>
                      </div>
                      {!isVetoed && (
                        <span>- APPLYING_LIVE</span>
                      )}
                    </div>
                  );
                })}
                {promoDiscount > 0 && (
                  <div className="flex justify-between pt-1 border-t border-brand-accent/20 text-[10px] font-black text-brand-accent font-mono">
                    <span>TOTAL_SAVINGS</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-brand-steel/50">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 block mb-2 uppercase tracking-[0.2em]">
                GRAND_TOTAL
              </label>
              <div className="relative">
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-success/20 blur-2xl rounded-full z-0"
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={
                    isSuccess
                      ? {
                        scale: [1, 1.05, 1],
                        color: ["#F97316", "#22C55E", "#F97316"],
                      }
                      : {}
                  }
                  className="text-3xl font-mono font-black text-brand-accent text-right relative z-10 leading-none"
                >
                  {formatCurrency(total)}
                </motion.div>
              </div>
            </div>
          </div>

          <div className="flex items-stretch gap-1">
            <button
              onClick={() => onHoldSale(discount)}
              disabled={subtotal === 0 || isOffline || isProcessing || isSuccess}
              className="flex flex-col items-center justify-center px-4 bg-brand-dark border border-brand-steel/30 text-slate-800 dark:text-slate-400 hover:text-brand-accent hover:border-brand-accent transition-all disabled:opacity-30 shrink-0 min-w-[64px]"
              title="Park Transaction (Hold)"
            >
              <Plus size={20} />
              <span className="text-[7px] font-display uppercase tracking-widest mt-1.5">
                HOLD
              </span>
            </button>

            <button
              onClick={() => onCompleteSale()}
              disabled={subtotal === 0 || isProcessing || isSuccess || isOffline}
              className={cn(
                "btn-industrial py-5 flex-1 flex items-center justify-center gap-3 text-[11px] font-display tracking-[0.2em] transition-all border-brand-steel/30 min-h-full",
                subtotal === 0 || isProcessing || isSuccess || isOffline
                  ? "bg-brand-steel/10 text-slate-900 dark:text-slate-500 cursor-not-allowed opacity-80 dark:opacity-50 grayscale"
                  : "btn-primary shadow-[0_0_30px_rgba(249,115,22,0.2)] text-white",
              )}
            >
              {isOffline ? (
                <>
                  <X size={16} />
                  LOCAL_BUFFER_LOCKED
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  PROCESS_TX...
                </>
              ) : isSuccess ? (
                <>
                  <Receipt size={16} />
                  TX_AUTHORIZED
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  AUTHORIZE_CHECKOUT
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
