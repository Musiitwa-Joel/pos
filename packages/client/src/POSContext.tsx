import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { observable, computed } from "@legendapp/state";
import { useIdentity } from './contexts/IdentityContext';
import { CartItem, PaymentMethod } from './types';

// 🚀 [VANGUARD] Performance Engine:
// Using Legend-State observables for zero-rendering state management.
export const posState$ = observable({
  cart: [] as CartItem[],
  posDiscount: 0,
  selectedCustomerId: '',
  paymentMethod: 'cash' as PaymentMethod,
  resumedHeldSaleId: null as string | null,

  // 🛰️ [ATOMIC] Financial Intelligence:
  // Using lazy-evaluated computed properties directly within the state proxy.
  subtotal: computed(() => (posState$.cart.get() || []).reduce((acc: number, item: any) => acc + (item.quantity * (item.unitPrice || item.price || 0)), 0)),
  promoDiscount: computed(() => (posState$.cart.get() || []).reduce((acc: number, item: any) => acc + (item.discount || 0), 0)),
  total: computed(() => {
    const sub = (posState$ as any).subtotal.get();
    const promo = (posState$ as any).promoDiscount.get();
    const manual = posState$.posDiscount.get();
    return Math.max(0, sub - promo - manual);
  })
});

interface POSContextType {
  // We keep the interface similar for backward compatibility
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  posDiscount: number;
  setPosDiscount: (discount: number) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  resumedHeldSaleId: string | null;
  setResumedHeldSaleId: (id: string | null) => void;
  clearPOS: () => void;
  posState$: any;
}

import { observer } from '@legendapp/state/react';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useIdentity();

  const clearPOS = () => {
    posState$.assign({
      cart: [],
      posDiscount: 0,
      selectedCustomerId: '',
      paymentMethod: 'cash',
      resumedHeldSaleId: null,
    });
  };

  // Automatically purge POS state on session shift
  useEffect(() => {
    clearPOS();
  }, [currentUser?.id]);

  const value: POSContextType = useMemo(() => ({
    // 🛡️ Note: We use .get() for the context value to support existing hooks,
    // but components can also import posState$ directly for fine-grained updates.
    get cart() { return posState$.cart.get(); },
    setCart: (val) => {
      if (typeof val === 'function') {
        posState$.cart.set(val(posState$.cart.get()));
      } else {
        posState$.cart.set(val);
      }
    },
    get posDiscount() { return posState$.posDiscount.get(); },
    setPosDiscount: (val) => posState$.posDiscount.set(val),
    get selectedCustomerId() { return posState$.selectedCustomerId.get(); },
    setSelectedCustomerId: (val) => posState$.selectedCustomerId.set(val),
    get paymentMethod() { return posState$.paymentMethod.get(); },
    setPaymentMethod: (val) => posState$.paymentMethod.set(val),
    get resumedHeldSaleId() { return posState$.resumedHeldSaleId.get(); },
    setResumedHeldSaleId: (val) => posState$.resumedHeldSaleId.set(val),
    clearPOS,
    posState$: posState$,
  }), []);

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
});

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
