import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Order, PendingWooOrder } from '@/lib/types';
import * as api from '@/lib/api';

interface OrderContextType {
  orders: Order[];
  pendingOrders: PendingWooOrder[];
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  refreshPendingOrders: () => Promise<void>;
  createOrder: typeof api.createOrder;
  updateOrder: typeof api.updateOrder;
  updateOrderStage: typeof api.updateOrderStage;
  approveWooOrder: typeof api.approveWooOrder;
  ignorePendingOrder: typeof api.ignorePendingOrder;
  syncWooOrders: typeof api.syncWooOrders;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingWooOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPendingOrders = useCallback(async () => {
    try {
      const data = await api.fetchPendingWooOrders();
      setPendingOrders(data);
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
    }
  }, []);

  const createOrder = useCallback(async (...args: Parameters<typeof api.createOrder>) => {
    const result = await api.createOrder(...args);
    await refreshOrders();
    return result;
  }, [refreshOrders]);

  const updateOrder = useCallback(async (...args: Parameters<typeof api.updateOrder>) => {
    const result = await api.updateOrder(...args);
    await refreshOrders();
    return result;
  }, [refreshOrders]);

  const updateOrderStage = useCallback(async (...args: Parameters<typeof api.updateOrderStage>) => {
    const result = await api.updateOrderStage(...args);
    await refreshOrders();
    return result;
  }, [refreshOrders]);

  const approveWooOrder = useCallback(async (...args: Parameters<typeof api.approveWooOrder>) => {
    const result = await api.approveWooOrder(...args);
    await refreshOrders();
    await refreshPendingOrders();
    return result;
  }, [refreshOrders, refreshPendingOrders]);

  const ignorePendingOrder = useCallback(async (...args: Parameters<typeof api.ignorePendingOrder>) => {
    await api.ignorePendingOrder(...args);
    await refreshPendingOrders();
  }, [refreshPendingOrders]);

  const syncWooOrders = useCallback(async (...args: Parameters<typeof api.syncWooOrders>) => {
    const result = await api.syncWooOrders(...args);
    setPendingOrders(result);
    return result;
  }, []);

  useEffect(() => {
    refreshOrders();
    refreshPendingOrders();
  }, [refreshOrders, refreshPendingOrders]);

  return (
    <OrderContext.Provider value={{
      orders,
      pendingOrders,
      isLoading,
      error,
      refreshOrders,
      refreshPendingOrders,
      createOrder,
      updateOrder,
      updateOrderStage,
      approveWooOrder,
      ignorePendingOrder,
      syncWooOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
