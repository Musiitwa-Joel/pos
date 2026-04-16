import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useHardware } from './HardwareContext';
import { CartItem, PaymentMethod } from './types';

interface POSContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  posDiscount: number;
  setPosDiscount: React.Dispatch<React.SetStateAction<number>>;
  selectedCustomerId: string;
  setSelectedCustomerId: React.Dispatch<React.SetStateAction<string>>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
  resumedHeldSaleId: string | null;
  setResumedHeldSaleId: React.Dispatch<React.SetStateAction<string | null>>;
  clearPOS: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [resumedHeldSaleId, setResumedHeldSaleId] = useState<string | null>(null);

  const clearPOS = () => {
    setCart([]);
    setPosDiscount(0);
    setSelectedCustomerId('');
    setPaymentMethod('cash');
    setResumedHeldSaleId(null);
  };

  const { currentUser } = useHardware();

  // 🛡️ [VANGUARD] Session Isolation Protocol:
  // Automatically purge POS state whenever the institutional context shifts or session expires.
  useEffect(() => {
    clearPOS();
  }, [currentUser?.id]);

  const contextValue = useMemo(() => ({
    cart,
    setCart,
    posDiscount,
    setPosDiscount,
    selectedCustomerId,
    setSelectedCustomerId,
    paymentMethod,
    setPaymentMethod,
    resumedHeldSaleId,
    setResumedHeldSaleId,
    clearPOS,
  }), [cart, posDiscount, selectedCustomerId, paymentMethod, resumedHeldSaleId]);

  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
