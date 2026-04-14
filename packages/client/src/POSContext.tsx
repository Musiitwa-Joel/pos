import React, { createContext, useContext, useState, useMemo } from 'react';
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
  clearPOS: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const clearPOS = () => {
    setCart([]);
    setPosDiscount(0);
    setSelectedCustomerId('');
    setPaymentMethod('cash');
  };

  const contextValue = useMemo(() => ({
    cart,
    setCart,
    posDiscount,
    setPosDiscount,
    selectedCustomerId,
    setSelectedCustomerId,
    paymentMethod,
    setPaymentMethod,
    clearPOS,
  }), [cart, posDiscount, selectedCustomerId, paymentMethod]);

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
