import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { ShoppingCart, Printer } from "lucide-react";
// @ts-ignore
import { useHardware } from "../HardwareContext";
import { usePOS } from "../POSContext";
import { cn } from "../lib/utils";
import type { Product } from "../types";
// @ts-ignore
import { createPortal } from "react-dom";
import { toast } from "sonner";
import DiscountModal from "./pos/DiscountModal";
import ConfirmDialog from "./ConfirmDialog";
import { v7 as uuidv7 } from "uuid";
import { observer, useObservable } from "@legendapp/state/react";

// ⚛️ Atomic Vanguard POS Components
import { POSCatalog } from "./pos/POSCatalog";
import { POSTransaction } from "./pos/POSTransaction";
import { POSCheckout } from "./pos/POSCheckout";
import { POSToolbar } from "./pos/POSToolbar";
import { ShiftModals } from "./pos/ShiftModals";
import { HeldSalesRegistry } from "./pos/HeldSalesRegistry";
import ReceiptComp from "./Receipt";

// 🛰️ [VANGUARD] Hardened POS Terminal:
// This component is now a high-performance 'Command Base'. 
// It utilizes memoized handles to ensure child components remain idle 
// during high-frequency barcode streaming.
export default observer(function POS({ onExit }: { onExit?: () => void }) {
  const hardware = useHardware();
  const {
    products, addSale, currentUser, settings, addSystemLog,
    openShift, closeShift, getShiftExpected, isOffline,
    activeShift, isReady, holdTransaction, refreshHeldSales, heldSales,
    deleteHeldTransaction,
  } = hardware;

  const {
    setCart, setSelectedCustomerId,
    setPosDiscount: setDiscount,
    clearPOS, resumedHeldSaleId, setResumedHeldSaleId, posState$
  } = usePOS();

  // 🛰️ [VANGUARD] Zero-Render UI Pulse:
  // Replacing useState with observables to prevent parent re-renders.
  const ui$ = useObservable({
    isSuccess: false,
    isProcessing: false,
    checkoutTab: 'items' as 'items' | 'settle',
    lastSale: null as any,
    autoPrint: true,
    showOpeningModal: false,
    showClosingModal: false,
    openingCashInput: "",
    closingCashInput: "",
    isDiscountModalOpen: false,
    isCartMobileOpen: false,
    shiftStats: null as any,
    isFetchingStats: false,
    vetoedPromoIds: [] as string[],
    showHeldSales: false
  });

  const confirm$ = useObservable({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: () => { }
  });

  const searchInputRef = useRef<HTMLInputElement>(null);


  // 🛰️ Atomic Handler Handles
  const addToCart = useCallback((product: Product) => {
    const currentCart = posState$.cart.get();
    const existing = currentCart.find((item: any) => item.id === product.id);

    if (product.stock <= 0) {
      toast.error(`STOCK_VOID: ${product.name.toUpperCase()} IS OUT OF STOCK`);
      return;
    }
    if (existing && existing.quantity + 1 > product.stock) {
      toast.error(`INSUFFICIENT_STOCK: ONLY ${product.stock} ITEMS AVAILABLE`);
      return;
    }

    setCart((prev: any) => {
      const exists = prev.find((item: any) => item.id === product.id);
      if (exists) {
        return prev.map((item: any) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
  }, [setCart, posState$]);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev: any) => prev.filter((item: any) => item.id !== id));
  }, [setCart]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev: any) =>
      prev.map((i: any) => {
        if (i.id !== id) return i;
        const newQty = Math.max(1, i.quantity + delta);
        if (newQty > (i.stock || 0)) {
          toast.error(`STOCK_LIMIT_REACHED: MAX ${i.stock} ITEMS`);
          return i;
        }
        return { ...i, quantity: newQty };
      })
    );
  }, [setCart]);

  const handleCompleteSale = useCallback(async () => {
    const currentCart = posState$.cart.get();
    const total = posState$.total.get();
    const subtotal = posState$.subtotal.get();
    const promoDiscount = posState$.promoDiscount.get();
    const currentPaymentMethod = posState$.paymentMethod.get();
    const currentSelectedCustomer = posState$.selectedCustomerId.get();
    const currentDiscount = posState$.posDiscount.get();

    if (currentCart.length === 0 || ui$.isProcessing.peek() || isOffline) return;
    if (currentPaymentMethod === "credit" && !currentSelectedCustomer) {
      toast.error("IDENTIFICATION_REQUIRED: SELECT_CUSTOMER_FOR_CREDIT");
      return;
    }

    ui$.isProcessing.set(true);
    try {
      const result = await addSale({
        items: currentCart,
        total,
        subtotal,
        tax: 0,
        discount: currentDiscount + promoDiscount,
        paymentMethod: currentPaymentMethod,
        customerId: currentSelectedCustomer || undefined,
        cashierId: currentUser?.id || "unknown",
        shiftId: activeShift?.id || "unknown",
        clientTxId: uuidv7(),
        heldSaleId: resumedHeldSaleId || undefined,
      });

      if (result) {
        // 🛰️ [VANGUARD] Institutional Audit Pulse:
        // Ensuring high-transparency for the Security Audit Trail.
        await addSystemLog({
          action: "TRANSACTION_AUTHORIZED",
          target: `SALE_${result.id}`,
          newValue: `TOTAL: ${result.total} | METHOD: ${result.paymentMethod} | ITEMS: ${result.items?.length || 0}`,
        });

        // 🛰️ [VANGUARD] Instant Institutional Reset:
        ui$.lastSale.set(result);
        ui$.isSuccess.set(true);

        // Trigger print protocol automatically if enabled
        if (ui$.autoPrint.peek()) setTimeout(() => { (window as any).print?.(); }, 300);

        // Clear items after a brief human-readable pulse
        setTimeout(() => {
          ui$.isSuccess.set(false);
          clearPOS();
          ui$.vetoedPromoIds.set([]);
          refreshHeldSales(true);
          ui$.lastSale.set(null);
          setResumedHeldSaleId(null);
        }, 5000);
      }
    } finally {
      ui$.isProcessing.set(false);
    }
  }, [posState$, isOffline, addSale, currentUser, activeShift, resumedHeldSaleId, ui$, clearPOS, refreshHeldSales]);

  const handleHoldSale = useCallback(async (manualDiscount: number) => {
    const currentCart = posState$.cart.get();
    const currentSelectedCustomer = posState$.selectedCustomerId.get();
    if (currentCart.length === 0 || isOffline || ui$.isProcessing.peek()) return;

    ui$.isProcessing.set(true);
    try {
      await holdTransaction(JSON.stringify(currentCart), currentSelectedCustomer || undefined, manualDiscount);
      clearPOS();
      ui$.showHeldSales.set(false);
      toast.success("TX_PARKED_SUCCESSFULLY");
    } finally {
      ui$.isProcessing.set(false);
    }
  }, [posState$, isOffline, holdTransaction, clearPOS, ui$]);

  // 🛰️ Industrial Keybinding Matrix
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (isMod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        ui$.isDiscountModalOpen.set(true);
      }
      if (isMod && e.key === "Backspace") {
        e.preventDefault();
        const currentCart = posState$.cart.get();
        if (currentCart.length > 0) {
          confirm$.set({
            isOpen: true,
            title: "AUTHORIZE_CART_PURGE",
            message: "You are about to clear all items from the active transaction. This action cannot be undone.",
            onConfirm: () => {
              setCart([]);
              toast.info("CART_CLEARED");
            },
            confirmText: "CLEAR_CART",
            type: "danger"
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addToCart, posState$, setCart, ui$, confirm$]);

  useEffect(() => {
    if (!isReady || !currentUser?.id) return;
    ui$.showOpeningModal.set(!activeShift);
  }, [currentUser?.id, activeShift, isReady, ui$]);

  const handleOpenShift = async () => {
    const cash = parseFloat(ui$.openingCashInput.get()) || 0;
    await openShift(cash);
    ui$.showOpeningModal.set(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (ui$.showClosingModal.get() && activeShift) {
        ui$.isFetchingStats.set(true);
        const stats = await getShiftExpected(activeShift.id);
        ui$.shiftStats.set(stats);
        ui$.isFetchingStats.set(false);
      }
    };
    fetchStats();
  }, [ui$, activeShift, getShiftExpected]);

  const handleCloseShift = async () => {
    if (!activeShift?.id) return;
    const cash = parseFloat(ui$.closingCashInput.get()) || 0;
    const result = await closeShift(activeShift.id, cash);
    
    if (result) {
      const varVal = result.variance || 0;
      const status = varVal < 0 ? 'SHORTAGE' : varVal > 0 ? 'SURPLUS' : 'BALANCED';
      toast.success(`SHIFT_CLOSED: ${status} of ${Math.abs(varVal).toLocaleString()} UGX detected.`);
    }

    ui$.showClosingModal.set(false);
    ui$.showOpeningModal.set(true);
    ui$.closingCashInput.set("");
  };

  return (
    <div className="relative h-[100dvh] lg:h-full flex flex-col overflow-hidden bg-brand-dark">
      <DiscountModal
        ui$={ui$}
        subtotal={posState$.subtotal}
        currentDiscount={posState$.posDiscount}
        onApply={(val, reason) => {
          setDiscount(val);
          addSystemLog({
            action: "PRICE_OVERRIDE",
            target: `CART_TOTAL_REVISION`,
            oldValue: "STIRCT",
            newValue: `${val} [${reason}]`,
          });
          toast.success("PRICE_OVERRIDE_AUTHORIZED");
        }}
      />

      <ShiftModals
        ui$={ui$}
        confirm$={confirm$}
        shiftStats={ui$.shiftStats}
        handleOpenShift={handleOpenShift}
        handleCloseShift={handleCloseShift}
        onExit={onExit}
      />

      <HeldSalesRegistry
        ui$={ui$}
        onRefreshRegistry={() => refreshHeldSales(false)}
        onDecommissionSale={(id) => deleteHeldTransaction(id)}
        onResumeSale={(held) => {
          setCart(JSON.parse(held.cart));
          setSelectedCustomerId(held.customerId || '');
          setDiscount(held.discount || 0);
          setResumedHeldSaleId(held.id);
          ui$.showHeldSales.set(false);
          deleteHeldTransaction(held.id);
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row gap-1 min-h-0 bg-brand-steel/20 p-1 overflow-hidden relative">
        {/* COLUMN 1: PRODUCT SELECTION */}
        <div className={cn(
          "flex-[2.5] flex flex-col min-h-0 gap-1 transition-all",
          ui$.isCartMobileOpen.get() ? "hidden md:flex" : "flex"
        )}>
          <POSCatalog
            addToCart={addToCart}
            searchInputRef={searchInputRef}
            products={products}
            ui$={ui$}
          />
        </div>

        {/* COLUMN 2: ACTIVE TRANSACTION */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0 gap-1 transition-all",
          (!ui$.isCartMobileOpen.get() || ui$.checkoutTab.get() !== 'items') ? "hidden md:flex" : "flex",
          "industrial-mobile-drawer"
        )}>
          <POSToolbar ui$={ui$} />
          <POSTransaction
            ui$={ui$}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
          />
        </div>

        {/* COLUMN 3: CHECKOUT CONTROL */}
        <div className={cn(
          "flex-none md:w-[280px] lg:w-[320px] xl:w-[380px] flex flex-col min-h-0 gap-1 transition-all",
          (!ui$.isCartMobileOpen.get() || ui$.checkoutTab.get() !== 'settle') ? "hidden md:flex" : "flex",
          "industrial-mobile-drawer"
        )}>
          <POSToolbar ui$={ui$} />
          <POSCheckout
            ui$={ui$}
            onCompleteSale={handleCompleteSale}
            onHoldSale={handleHoldSale}
          />
        </div>

        {/* 🛰️ Mobile Cart Floating Trigger */}
        <button
          onClick={() => ui$.isCartMobileOpen.set(true)}
          className={cn(
            "lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-accent text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all active:scale-90 border-4 border-brand-dark",
            ui$.isCartMobileOpen.get() && "hidden",
          )}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <CartBadge posState$={posState$} />
          </div>
        </button>

        <ConfirmDialog
          ui$={confirm$}
        />

        {/* 📋 Silent Print Portal (Body Root via createPortal) */}
        <PrintPortal ui$={ui$} settings={settings} />
      </div>
    </div>
  );
});

// 🛰️ [VANGUARD] Isolated Print Pulse:
// This component manages the print portal without touching the POS shell.
const PrintPortal = observer(({ ui$, settings }: { ui$: any; settings: any }) => {
  const lastSale = ui$.lastSale.get();
  if (!lastSale) return null;

  return createPortal(
    <div className="printable-receipt">
      <ReceiptComp sale={lastSale} settings={settings} />
    </div>,
    document.body
  );
});

// 🛰️ [VANGUARD] Isolated Cart Pulse:
const CartBadge = observer(({ posState$ }: { posState$: any }) => {
  const count = posState$.cart.get().reduce((s: number, i: any) => s + i.quantity, 0);
  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-white text-brand-accent text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
      {count}
    </span>
  );
});
