import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { apolloClient as client } from '../lib/apollo';
import { observable } from "@legendapp/state";
import { Product, Supplier, Promotion } from '../types';
import { GET_SUPPLIERS, GET_PRODUCTS, GET_PROMOTIONS, GET_INVENTORY_TRANSACTIONS } from '../gql/queries/inventory';
import {
  ADD_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
  ADD_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  ADJUST_STOCK,
  ADD_PROMOTION,
  UPDATE_PROMOTION,
  DELETE_PROMOTION,
  TOGGLE_PROMOTION,
} from '../gql/mutations/inventory';
import { toast } from 'sonner';
import { useIdentity } from './IdentityContext';

// 🚀 [VANGUARD] Inventory Store:
// High-density data management using observables for zero-render filtering and list updates.
export const inventoryState$ = observable({
  products: [] as Product[],
  suppliers: [] as Supplier[],
  promotions: [] as Promotion[],
});

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  promotions: Promotion[];
  fetchProducts: (silent?: boolean) => Promise<void>;
  fetchSuppliers: (silent?: boolean) => Promise<void>;
  fetchPromotions: (silent?: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'stock'> & { initialStock?: number }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  retireProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, quantity: number, type: string, notes?: string) => Promise<void>;
  addSupplier: (supplier: { name: string; contact?: string; phone?: string; email?: string; }) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getInventoryTransactions: (productId?: string, startDate?: string, endDate?: string) => Promise<any[]>;
  addPromotion: (promo: Omit<Promotion, 'id' | 'isActive'>) => Promise<void>;
  updatePromotion: (id: string, updates: Partial<Promotion>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  togglePromotion: (id: string) => Promise<void>;
  inventoryState$: any;
}

import { observer } from '@legendapp/state/react';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = observer(({ children }: { children: React.ReactNode }) => {
  const { withLoading } = useIdentity();

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_PRODUCTS,
        fetchPolicy: 'network-only'
      });
      if (data?.products) inventoryState$.products.set(data.products);
    } catch (err: any) {
      if (!err.message?.includes('Store reset')) {
        console.error('Fetch products error:', err);
        toast.error(`Products Sync Failed: ${err.message || 'Cannot reach server'}`);
      }
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_SUPPLIERS,
        fetchPolicy: 'network-only'
      });
      if (data?.suppliers) inventoryState$.suppliers.set(data.suppliers);
    } catch (err) {
      console.error('Fetch suppliers error:', err);
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_PROMOTIONS,
        fetchPolicy: 'network-only'
      });
      if (data?.promotions) inventoryState$.promotions.set(data.promotions);
    } catch (err) {
      console.error('Fetch promotions error:', err);
    }
  }, []);

  const addProduct = async (p: Omit<Product, 'id' | 'stock'> & { initialStock?: number }) => {
    await withLoading('SAVING_PRODUCT', async () => {
      await client.mutate({
        mutation: ADD_PRODUCT,
        variables: { ...p }
      });
      await fetchProducts();
    }, true);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await withLoading('UPDATING_PRODUCT', async () => {
      await client.mutate({
        mutation: UPDATE_PRODUCT,
        variables: { id, ...updates }
      });
      await fetchProducts();
    }, true);
  };

  const retireProduct = async (id: string) => {
    await withLoading('RETIRING_PRODUCT', async () => {
      await client.mutate({
        mutation: DELETE_PRODUCT,
        variables: { id }
      });
      await fetchProducts();
      toast.success('Product retired from active circulation');
    }, true);
  };

  const adjustStock = async (productId: string, quantity: number, type: string, notes?: string) => {
    await withLoading('ADJUSTING_STOCK', async () => {
      await client.mutate({
        mutation: ADJUST_STOCK,
        variables: { productId, quantity, type, notes }
      });
      await fetchProducts();
      toast.success('Stock levels adjusted successfully');
    }, true);
  };

  const addSupplier = async (s: { name: string; contact?: string; phone?: string; email?: string; }) => {
    await withLoading('SAVING_SUPPLIER', async () => {
      await client.mutate({
        mutation: ADD_SUPPLIER,
        variables: { ...s }
      });
      await fetchSuppliers();
    }, true);
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    await withLoading('UPDATING_SUPPLIER', async () => {
      await client.mutate({
        mutation: UPDATE_SUPPLIER,
        variables: { id, ...updates }
      });
      await fetchSuppliers();
    }, true);
  };

  const deleteSupplier = async (id: string) => {
    await withLoading('DELETING_SUPPLIER', async () => {
      await client.mutate({
        mutation: DELETE_SUPPLIER,
        variables: { id }
      });
      await fetchSuppliers();
      toast.success('Supplier record decommissioned');
    }, true);
  };

  const getInventoryTransactions = async (productId?: string, startDate?: string, endDate?: string) => {
    const { data } = await client.query({
      query: GET_INVENTORY_TRANSACTIONS,
      variables: { productId, startDate, endDate },
      fetchPolicy: 'network-only'
    });
    return data?.inventoryTransactions || [];
  };

  const addPromotion = async (promo: Omit<Promotion, 'id' | 'isActive'>) => {
    await withLoading('SAVING_PROMOTION', async () => {
      await client.mutate({
        mutation: ADD_PROMOTION,
        variables: { ...promo, startDate: promo.startDate, endDate: promo.endDate }
      });
      await fetchPromotions();
    }, true);
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>) => {
    await withLoading('UPDATING_PROMOTION', async () => {
      await client.mutate({
        mutation: UPDATE_PROMOTION,
        variables: { id, ...updates }
      });
      await fetchPromotions();
    }, true);
  };

  const deletePromotion = async (id: string) => {
    await withLoading('DELETING_PROMOTION', async () => {
      await client.mutate({
        mutation: DELETE_PROMOTION,
        variables: { id }
      });
      await fetchPromotions();
    }, true);
  };

  const togglePromotion = async (id: string) => {
    await withLoading('TOGGLING_PROMOTION', async () => {
      await client.mutate({
        mutation: TOGGLE_PROMOTION,
        variables: { id }
      });
      await fetchPromotions();
    }, true);
  };

  const value: InventoryContextType = useMemo(() => ({
    get products() { return inventoryState$.products.get(); },
    get suppliers() { return inventoryState$.suppliers.get(); },
    get promotions() { return inventoryState$.promotions.get(); },
    fetchProducts,
    fetchSuppliers,
    fetchPromotions,
    addProduct,
    updateProduct,
    retireProduct,
    adjustStock,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getInventoryTransactions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    inventoryState$
  }), [fetchProducts, fetchSuppliers, fetchPromotions]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
});

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
