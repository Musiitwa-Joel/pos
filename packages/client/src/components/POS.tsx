import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  UserPlus,
  X,
  Receipt,
  Loader2,
  PauseCircle,
  Clock,
} from "lucide-react";
// @ts-ignore
import { motion, AnimatePresence } from "motion/react";
import { useHardware } from "../HardwareContext";
import { usePOS } from "../POSContext";
import { formatCurrency, cn } from "../lib/utils";
import type { Product, CartItem, PaymentMethod } from "../types";
// @ts-ignore
import { createPortal } from "react-dom";
import ReceiptComp from "./Receipt";
import Select from "./Select";
import { toast } from "sonner";
import DiscountModal from "./pos/DiscountModal";
import { v7 as uuidv7 } from "uuid";

export default function POS({ onExit }: { onExit?: () => void }) {
  const {
    products,
    addSale,
    customers,
    currentUser,
    settings,
    addSystemLog,
    openShift,
    closeShift,
    getActiveShift,
    getShiftExpected,
    promotions,
    isOffline,
    activeShift,
    isReady,
    holdTransaction,
    refreshHeldSales,
    heldSales,
    deleteHeldTransaction,
  } = useHardware();

  const {
    cart,
    setCart,
    paymentMethod,
    setPaymentMethod,
    selectedCustomerId,
    setSelectedCustomerId,
    posDiscount: discount,
    setPosDiscount: setDiscount,
    clearPOS,
    resumedHeldSaleId,
    setResumedHeldSaleId,
  } = usePOS();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutTab, setCheckoutTab] = useState<'items' | 'settle'>('items');
  const [lastSale, setLastSale] = useState<any>(null);
  const [autoPrint, setAutoPrint] = useState(true);
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState("");
  const [closingCashInput, setClosingCashInput] = useState("");
  const [isShiftChecking, setIsShiftChecking] = useState(true);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [shiftStats, setShiftStats] = useState<any>(null);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [vetoedPromoIds, setVetoedPromoIds] = useState<string[]>([]);
  const [showHeldSales, setShowHeldSales] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery),
  );

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      const isMod = e.metaKey || e.ctrlKey;

      // CMD + K: Tactical Focus Search
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        (searchInputRef.current as any)?.focus();
        return;
      }

      // ENTER (while searching): Quick-Add first result to cart
      if (
        e.key === "Enter" &&
        document.activeElement === searchInputRef.current
      ) {
        const topResult = filteredProducts[0];
        if (topResult) {
          e.preventDefault();
          if (topResult.stock > 0) {
            addToCart(topResult);
            setSearchQuery(""); // Clear search for the next item
          } else {
            toast.error(`STOCK_VOID: ${topResult.name.toUpperCase()} IS OUT OF STOCK`);
          }
        }
        return;
      }

      // CMD + D: Discount Modal
      if (isMod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDiscountModalOpen(true);
      }

      // CMD + BACKSPACE: Clear Cart Hub
      if (isMod && e.key === "Backspace") {
        e.preventDefault();
        setCart([]);
        toast.info("CART_CLEARED");
      }

      // CMD + ENTER / CMD + S: Industrial Checkout
      if (isMod && (e.key === "Enter" || e.key.toLowerCase() === "s")) {
        e.preventDefault();
        handleCompleteSale();
      }
    };

    const g = globalThis as any;
    g.window?.addEventListener("keydown", handleKeyDown);
    return () => g.window?.removeEventListener("keydown", handleKeyDown);
  }, [
    cart,
    paymentMethod,
    discount,
    selectedCustomerId,
    isProcessing,
    filteredProducts,
  ]);

  useEffect(() => {
    if (!isReady) return;
    if (!currentUser?.id) return;
    setIsShiftChecking(false);
    setShowOpeningModal(!activeShift);
  }, [currentUser?.id, activeShift, isReady]);

  const handleOpenShift = async () => {
    const cash = parseFloat(openingCashInput) || 0;
    await openShift(cash);
    setShowOpeningModal(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (showClosingModal && activeShift) {
        setIsFetchingStats(true);
        const stats = await getShiftExpected(activeShift.id);
        setShiftStats(stats);
        setIsFetchingStats(false);
      }
    };
    fetchStats();
  }, [showClosingModal, activeShift]);

  const handleCloseShift = async () => {
    if (!activeShift?.id) return;
    const cash = parseFloat(closingCashInput) || 0;
    await closeShift(activeShift.id, cash);
    setShowClosingModal(false);
    setShowOpeningModal(true);
    setClosingCashInput("");
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`STOCK_VOID: ${product.name.toUpperCase()} IS OUT OF STOCK`);
      return;
    }

    const existing = cart.find((item) => item.id === product.id);
    if (existing && existing.quantity + 1 > product.stock) {
      toast.error(`INSUFFICIENT_STOCK: ONLY ${product.stock} ITEMS AVAILABLE`);
      return;
    }

    setCart((prev) => {
      const existingInCart = prev.find((item) => item.id === product.id);
      if (existingInCart) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
    setSearchQuery("");
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);
    if (newQty > (item.stock || 0)) {
      toast.error(`STOCK_LIMIT_REACHED: CANNOT EXCEED ${item.stock} ITEMS`);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const activePromos = useMemo(() => {
    const now = new Date().getTime();
    return promotions.filter((p) => {
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.endDate).getTime();
      return p.isActive && now >= start && now <= end;
    });
  }, [promotions]);

  const calculatePromoDiscount = () => {
    const livePromos = activePromos.filter(p => !vetoedPromoIds.includes(p.id));
    if (livePromos.length === 0) return 0;

    return cart.reduce((totalAcc, item) => {
      let bestItemDiscount = 0;
      livePromos.forEach((promo) => {
        const isGlobal = !promo.productIds || promo.productIds.length === 0;
        const isEligible = isGlobal || promo.productIds?.includes(item.id);
        if (isEligible) {
          let currentPromoVal = 0;
          if (promo.type === "percentage") {
            currentPromoVal = (item.price * item.quantity * promo.value) / 100;
          } else {
            if (!isGlobal) {
              currentPromoVal = Math.min(
                promo.value,
                item.price * item.quantity,
              );
            } else {
              currentPromoVal = promo.value / cart.length;
            }
          }
          if (currentPromoVal > bestItemDiscount)
            bestItemDiscount = currentPromoVal;
        }
      });
      return totalAcc + bestItemDiscount;
    }, 0);
  };

  const calculateActivePromoIds = () =>
    activePromos.map((p) => p.id).join(", ");
  const calculateActivePromoNames = () =>
    activePromos.map((p) => p.name).join(" + ");

  const promoDiscount = useMemo(
    () => calculatePromoDiscount(),
    [activePromos, cart, vetoedPromoIds],
  );

  const total = Math.max(0, subtotal - promoDiscount - discount);

  const isProcessingRef = useRef(false);

  const handleCompleteSale = async () => {
    if (cart.length === 0 || isProcessingRef.current || isSuccess || isOffline) return;
    if (paymentMethod === "credit" && !selectedCustomerId) {
      alert("Please select a customer for credit sale");
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const freshPromoDiscount = calculatePromoDiscount();
      const clientTxId = uuidv7();

      // [CLEAN PROMO] Refine promo names/IDs by checking actual eligibility in this specific cart
      const appliedPromos = activePromos.filter((promo) => {
        const isGlobal = !promo.productIds || promo.productIds.length === 0;
        return cart.some(
          (item) => isGlobal || promo.productIds?.includes(item.id),
        );
      });
      const refinedPromoId = appliedPromos.map((p) => p.id).join(", ");
      const refinedPromoName = appliedPromos.map((p) => p.name).join(" + ");

      const result = await addSale({
        items: cart,
        total: Math.max(0, subtotal - freshPromoDiscount - discount),
        subtotal,
        tax: 0,
        discount: discount + freshPromoDiscount,
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        cashierId: currentUser?.id || "unknown",
        shiftId: activeShift?.id || "unknown",
        promoId: refinedPromoId,
        promoName: refinedPromoName,
        clientTxId,
        heldSaleId: resumedHeldSaleId || undefined,
      });

      if (result) {
        setLastSale(result);
        setIsSuccess(true);

        // Auto-trigger print if enabled
        if (autoPrint) {
          setTimeout(() => {
            (globalThis as any).print?.();
          }, 100);
        }

        setTimeout(() => {
          setIsSuccess(false);
          clearPOS();
          setVetoedPromoIds([]);
          setLastSale(null);
        }, 5000);
      }
    } catch (e) {
      console.error('[handleCompleteSale] failure:', e);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  const handleHoldSale = async () => {
    if (cart.length === 0 || isOffline) return;
    try {
      await holdTransaction(
        JSON.stringify(cart),
        selectedCustomerId || undefined,
        discount
      );
      clearPOS();
    } catch (e) {
      console.error('[handleHoldSale] Failure:', e);
    }
  };

  const handleResumeSale = (held: any) => {
    try {
      const restoredItems = JSON.parse(held.cart);
      setCart(restoredItems);
      setSelectedCustomerId(held.customerId || '');
      setDiscount(held.discount || 0);
      setResumedHeldSaleId(held.id);
      setShowHeldSales(false);
      toast.success('TRANSACTION_RESUMED_FROM_PARKING_REGISTRY');
    } catch (e) {
      toast.error('RESUME_FAILED: MALFORMED_CART_STATE');
    }
  };

  const handleReprint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="relative h-[100dvh] lg:h-full overflow-hidden flex flex-col">
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={subtotal}
        currentDiscount={discount}
        onApply={(val, reason) => {
          setDiscount(val);
          addSystemLog({
            action: "PRICE_OVERRIDE",
            target: `CART_TOTAL: ${formatCurrency(subtotal)}`,
            oldValue: formatCurrency(discount),
            newValue: `${formatCurrency(val)} [REASON: ${reason.toUpperCase()}]`,
          });
          toast.success("PRICE_OVERRIDE_AUTHORIZED_AND_LOGGED");
        }}
      />

      {/* Shift Opening Modal */}
      {showOpeningModal && (
        <div className="absolute inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="industrial-panel p-5 sm:p-8 w-full max-w-md flex flex-col gap-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent mx-auto flex items-center justify-center rounded mb-4">
                <Smartphone size={window.innerWidth < 768 ? 24 : 32} />
              </div>
              <h2 className="text-lg md:text-2xl font-display text-[var(--text-main)] uppercase break-words leading-tight">
                Register_Locked
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-2 uppercase tracking-widest leading-relaxed">
                A shift must be opened before processing sales.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-display text-slate-800 dark:text-slate-400">
                  STARTING_CASH_FLOAT (USh)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="terminal-input w-full h-12 text-lg font-mono text-brand-accent text-center"
                  placeholder="0.00"
                  value={openingCashInput}
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setOpeningCashInput(val);
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={handleOpenShift}
                className="btn-industrial btn-primary w-full py-4 text-[9px] sm:text-[10px] font-display uppercase tracking-widest"
              >
                Open_Register_Terminal
              </button>

              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-2 border border-brand-steel/30 text-slate-900 dark:text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 text-[8px] font-display uppercase tracking-[0.2em] transition-all"
                >
                  Return_To_Intelligence_Hub
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Shift Closing Modal */}
      {showClosingModal && (
        <div className="absolute inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="industrial-panel p-5 sm:p-8 w-full max-w-md flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-lg md:text-2xl font-display text-[var(--text-main)] uppercase break-words leading-tight">
                Close_Register_Audit
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-2 uppercase tracking-widest leading-relaxed">
                Perform physical cash count for verification.
              </p>
            </div>

            <div className="space-y-4">
              {shiftStats && (
                <div className="p-4 bg-brand-steel/5 border border-brand-steel/20 rounded flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
                    System_Expected_Balance
                  </span>
                  <span className="text-2xl font-mono font-black text-brand-accent">
                    {isFetchingStats
                      ? "..."
                      : formatCurrency(shiftStats.expectedCash)}
                  </span>
                  <div className="flex gap-4 text-[8px] font-mono text-slate-400 mt-2">
                    <div className="flex flex-col items-center">
                      <span className="opacity-60">RECOVERY</span>
                      <span className="text-success font-bold">
                        {formatCurrency(shiftStats.recoveryTotal)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="opacity-60">REFUNDS</span>
                      <span className="text-danger font-bold">
                        -{formatCurrency(shiftStats.refundsTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-display text-slate-800 dark:text-slate-400">
                  PHYSICAL_CASH_ON_HAND (USh)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="terminal-input w-full h-12 text-lg font-mono text-success text-center"
                  placeholder="Count your cash..."
                  value={closingCashInput}
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setClosingCashInput(val);
                  }}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowClosingModal(false)}
                  className="btn-industrial btn-outline py-3 text-[10px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseShift}
                  className="btn-industrial bg-danger hover:bg-danger/80 text-white py-3 text-[10px] font-display uppercase"
                >
                  Finalize_&_Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* [VANGUARD] Parked Sales Recovery Portal */}
      <AnimatePresence>
        {showHeldSales && (
          <div className="absolute inset-0 z-[101] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="industrial-panel w-full max-w-2xl flex flex-col max-h-[80vh] bg-[var(--bg-panel)]"
            >
              <div className="industrial-panel-header">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-accent" />
                  <span className="text-[10px] font-display uppercase tracking-widest">
                    Parked_Transaction_Registry
                  </span>
                </div>
                <button 
                  onClick={() => setShowHeldSales(false)}
                  className="p-1 hover:text-brand-accent transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {heldSales.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-700 opacity-40 grayscale">
                    <PauseCircle size={48} strokeWidth={1} />
                    <p className="text-[10px] font-display tracking-[0.2em] uppercase mt-4">
                      Registry_Empty_No_Parked_Sales_Found
                    </p>
                  </div>
                ) : (
                  heldSales.map((held) => {
                    let itemsPreview = [];
                    try {
                      itemsPreview = JSON.parse(held.cart);
                    } catch (e) {
                      console.error('Cart parse failed:', e);
                    }
                    
                    return (
                      <div 
                        key={held.id} 
                        className="bg-brand-dark border border-brand-steel/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-brand-accent transition-all animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-brand-accent font-mono text-[10px] uppercase tracking-tighter">
                              TX_ID: {held.id.slice(-8).toUpperCase()}
                            </span>
                            <span className="text-slate-500 font-mono text-[9px]">
                              {new Date(held.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-800 dark:text-slate-400 uppercase font-display leading-tight line-clamp-1">
                            {itemsPreview.length} items: {itemsPreview.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => deleteHeldTransaction(held.id)}
                            className="p-2 border border-brand-steel text-danger hover:bg-danger/10 transition-all rounded"
                            title="Discard Transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleResumeSale(held)}
                            className="btn-industrial btn-primary px-4 py-2 text-[8px] font-display uppercase tracking-widest"
                          >
                            Resume_Sale
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 border-t border-brand-steel bg-black/10 flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  Total_Parked_Capacity: {heldSales.length} Transactions
                </span>
                <button 
                  onClick={() => refreshHeldSales(false)}
                  className="text-[8px] font-display text-brand-accent hover:underline uppercase tracking-widest"
                >
                  Force_Registry_Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col lg:flex-row gap-1 min-h-0 bg-brand-steel/20 p-1 overflow-hidden relative">
        {/* COLUMN 1: PRODUCT SELECTION */}
        <div
          className={cn(
            "flex-1 xl:flex-[1.2] w-full flex flex-col min-h-0 gap-1 transition-all",
            isCartMobileOpen ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="industrial-panel flex-1 flex flex-col min-h-0 bg-[var(--bg-panel)]">
            <div className="industrial-panel-header min-w-0">
              <div className="flex items-center gap-2 shrink-0 min-w-0 overflow-hidden">
                <Search size={14} className="text-brand-accent shrink-0" />
                <span className="text-[0.625rem] font-display uppercase tracking-widest truncate">
                  Product_Catalog
                </span>
              </div>
              <div className="flex items-center gap-2">
                {heldSales.length > 0 && (
                  <button
                    onClick={() => {
                      refreshHeldSales(false);
                      setShowHeldSales(true);
                    }}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent hover:bg-brand-accent hover:text-white transition-all rounded text-[8px] font-display uppercase animate-pulse"
                  >
                    <Clock size={10} />
                    <span>PARKED_SALES: {heldSales.length}</span>
                  </button>
                )}
                <span className="keyboard-hint shrink-0 whitespace-nowrap text-[8px] opacity-90 dark:opacity-60">
                  ^ F TO SEARCH
                </span>
              </div>
            </div>

            <div className="p-2 border-b border-brand-steel bg-black/5">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="SCAN OR TYPE PRODUCT NAME..."
                className="terminal-input w-full h-9 sm:h-10 text-sm"
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 pb-32 grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 content-start custom-scrollbar">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={cn(
                    "industrial-panel p-3 text-left group transition-all hover:border-brand-accent/50 active:scale-[0.98] bg-[var(--bg-panel)] flex flex-col h-full",
                    product.stock <= 0
                      ? "opacity-30 grayscale cursor-not-allowed"
                      : "",
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 uppercase truncate pr-2">
                      {product.category}
                    </span>
                    <span
                      className={cn(
                        "text-[7px] font-mono px-1 py-0.5 whitespace-nowrap",
                        product.stock < (product.minStock || 5)
                          ? "bg-danger/20 text-danger"
                          : "bg-brand-steel/20 text-slate-800 dark:text-slate-400",
                      )}
                    >
                      STK: {product.stock}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-[10px] sm:text-xs mb-1 group-hover:text-brand-accent transition-colors line-clamp-2 uppercase leading-tight h-8 sm:h-9 overflow-hidden">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-brand-accent font-display font-bold text-xs sm:text-sm mt-auto truncate">
                    {formatCurrency(product.price)}
                  </p>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-700 py-20 opacity-30 grayscale">
                  <Search size={40} className="mb-4" />
                  <p className="text-[10px] font-display uppercase tracking-widest text-center px-4">
                    No_System_Matches_Found_In_Local_Buffer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2 & 3: MOBILE DRAWER WRAPPER */}
        <div
          className={cn(
            "flex-none lg:w-[500px] xl:w-[600px] 2xl:w-[700px] flex flex-col lg:flex-row gap-1 transition-all duration-300 ease-in-out",
            "industrial-mobile-drawer",
            !isCartMobileOpen && "translate-x-full lg:translate-x-0"
          )}
        >
          {/* Mobile Header Toggle */}
          <div className="lg:hidden px-4 pb-4 border-b border-brand-steel flex items-center justify-between bg-brand-accent text-white shrink-0">
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} />
              <span className="font-display uppercase text-[10px] tracking-widest font-black leading-none pt-1">
                ACTIVE_SALE // {cart.reduce((s, i) => s + i.quantity, 0)}_ITEMS
              </span>
            </div>
            <button
              onClick={() => setIsCartMobileOpen(false)}
              className="p-1 hover:bg-black/10 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Industrial Tab Switcher (Mobile Only) */}
          <div className="lg:hidden flex bg-brand-dark border-b border-brand-steel divide-x divide-brand-steel shrink-0">
            <button
              onClick={() => setCheckoutTab('items')}
              className={cn(
                "flex-1 py-4 text-[10px] font-display uppercase tracking-[0.2em] transition-all",
                checkoutTab === 'items' ? "bg-brand-accent text-white" : "text-slate-900 dark:text-slate-500 hover:bg-brand-accent/10"
              )}
            >
              [ Items_Audit ]
            </button>
            <button
              onClick={() => setCheckoutTab('settle')}
              className={cn(
                "flex-1 py-4 text-[10px] font-display uppercase tracking-[0.2em] transition-all",
                checkoutTab === 'settle' ? "bg-brand-accent text-white" : "text-slate-900 dark:text-slate-500 hover:bg-brand-accent/10"
              )}
            >
              [ Settle_TX ]
            </button>
          </div>

          {/* COLUMN 2: ACTIVE_TRANSACTION */}
          <div className={cn(
            "flex-1 industrial-panel flex flex-col min-h-[200px] lg:min-h-0 bg-[var(--bg-panel)] lg:bg-transparent overflow-hidden",
            checkoutTab !== 'items' && "hidden lg:flex"
          )}>
            <div className="industrial-panel-header min-w-0">
              <div className="flex items-center gap-2 shrink-0 min-w-0 overflow-hidden">
                <ShoppingCart
                  size={14}
                  className="text-brand-accent shrink-0"
                />
                <span className="text-[0.625rem] font-display uppercase tracking-widest truncate">
                  Active_Transaction
                </span>
              </div>
              <span className="text-[0.55rem] font-mono text-slate-900 dark:text-slate-500 shrink-0 whitespace-nowrap ml-auto">
                {cart.length} LINE_ITEMS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-brand-dark/50 border border-brand-steel/50 p-2 flex flex-col gap-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold truncate pr-2 uppercase leading-tight">
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-900 dark:text-slate-500 hover:text-danger transition-colors shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-brand-dark border border-brand-steel px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)]"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[10px] font-mono w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)]"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-tight">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-30 py-20 grayscale">
                  <ShoppingCart size={40} strokeWidth={1} />
                  <p className="text-[9px] font-display tracking-[0.2em] uppercase">
                    Terminal_Idle_Buffer_Clear
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: TOTALS & CHECKOUT */}
          <div className={cn(
            "w-full lg:w-64 xl:w-80 flex flex-col flex-none min-h-0 gap-1 bg-[var(--bg-panel)] lg:bg-transparent overflow-visible custom-scrollbar pb-6 lg:pb-0",
            checkoutTab !== 'settle' && "hidden lg:flex"
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

              <div className="p-4 space-y-4 flex-none lg:flex-1 flex flex-col overflow-y-auto custom-scrollbar">
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
                        onClick={() =>
                          setPaymentMethod(method.id as PaymentMethod)
                        }
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
                    onClick={() => setAutoPrint(!autoPrint)}
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
                    onClick={() => setShowClosingModal(true)}
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
                        onClick={() => setIsDiscountModalOpen(true)}
                        className="p-1 hover:bg-brand-steel rounded text-brand-accent transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                      {discount > 0 && (
                        <button
                          onClick={() => {
                            setDiscount(0);
                            toast.info("MANUAL_OVERRIDE_CLEARED");
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
                                    setVetoedPromoIds(prev => prev.filter(vid => vid !== p.id));
                                  } else {
                                    setVetoedPromoIds(prev => [...prev, p.id]);
                                    addSystemLog({
                                      action: "PROMO_VETO",
                                      target: `PROMO: ${p.name.toUpperCase()}`,
                                      oldValue: "ACTIVE",
                                      newValue: "BYPASSED_MANUALLY"
                                    });
                                  }
                                }}
                                className="p-0.5 hover:bg-brand-steel rounded ml-1"
                                title={isVetoed ? "Restore Promotion" : "Veto Promotion"}
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
                         <div className="flex justify-between pt-1 border-t border-brand-accent/20 text-[10px] font-black text-brand-accent font-mono animate-pulse">
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
                        key={total}
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
                    onClick={handleHoldSale}
                    disabled={cart.length === 0 || isOffline || isProcessing || isSuccess}
                    className="flex flex-col items-center justify-center px-4 bg-brand-dark border border-brand-steel/30 text-slate-800 dark:text-slate-400 hover:text-brand-accent hover:border-brand-accent transition-all disabled:opacity-30 shrink-0 min-w-[64px]"
                    title="Park Transaction (Hold)"
                  >
                    <PauseCircle size={20} />
                    <span className="text-[7px] font-display uppercase tracking-widest mt-1.5">
                      HOLD
                    </span>
                  </button>

                  <button
                    onClick={handleCompleteSale}
                    disabled={
                      cart.length === 0 || isProcessing || isSuccess || isOffline
                    }
                    className={cn(
                      "btn-industrial py-5 flex-1 flex items-center justify-center gap-3 text-[11px] font-display tracking-[0.2em] transition-all border-brand-steel/30 min-h-full",
                      cart.length === 0 || isProcessing || isSuccess || isOffline
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
                        {resumedHeldSaleId ? "FINALIZE_PARKED_TX" : "AUTHORIZE_CHECKOUT"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart Floating Trigger */}
        <button
          onClick={() => setIsCartMobileOpen(true)}
          className={cn(
            "lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-accent text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all active:scale-90 border-4 border-brand-dark",
            isCartMobileOpen && "hidden",
          )}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-brand-accent text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
        </button>

        {/* Hidden printable receipt */}
        {lastSale && typeof document !== "undefined" && document.body &&
          createPortal(
            <ReceiptComp sale={lastSale} settings={settings} />,
            document.body,
          )}
      </div>
    </div>
  );
}
