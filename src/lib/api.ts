/**
 * API Wrapper for Order Management Portal
 * 
 * This file contains all data-modifying functions as placeholders.
 * Currently operates on local state with simulated network latency.
 * 
 * TODO: Replace these implementations with real Firebase/Firestore calls:
 * - Replace localStorage with Firestore collections
 * - Add proper authentication checks
 * - Implement real-time listeners where needed
 */

import { Order, PendingWooOrder, User, OrderStage, Product } from './types';
import { mockOrders, mockPendingWooOrders, mockUsers } from './mockData';

// Simulated network delay (ms)
const NETWORK_DELAY = 300;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize local storage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(mockOrders));
  }
  if (!localStorage.getItem('pendingWooOrders')) {
    localStorage.setItem('pendingWooOrders', JSON.stringify(mockPendingWooOrders));
  }
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
};

initializeStorage();

// Helper to calculate priority
export const calculatePriority = (deliveryDate: string): { priority: 'high' | 'medium' | 'low'; remainingDays: number } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  const diffTime = delivery.getTime() - today.getTime();
  const remainingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (remainingDays <= 2) return { priority: 'high', remainingDays };
  if (remainingDays <= 5) return { priority: 'medium', remainingDays };
  return { priority: 'low', remainingDays };
};

// Sort orders by priority (high first, then by remaining days ascending)
export const sortOrdersByPriority = (orders: Order[]): Order[] => {
  const priorityWeight = { high: 0, medium: 1, low: 2 };
  return [...orders].sort((a, b) => {
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    return a.remainingDays - b.remainingDays;
  });
};

/**
 * Fetch all orders
 * TODO: Replace with Firestore query
 */
export const fetchOrders = async (): Promise<Order[]> => {
  await delay(NETWORK_DELAY);
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  // Recalculate priorities in case dates have changed
  const updatedOrders = orders.map((order: Order) => {
    const { priority, remainingDays } = calculatePriority(order.deliveryDate);
    return { ...order, priority, remainingDays };
  });
  return sortOrdersByPriority(updatedOrders);
};

/**
 * Create a new manual order
 * TODO: Replace with Firestore add operation
 */
export const createOrder = async (payload: {
  orderId: string;
  clientName: string;
  products: Product[];
  deliveryDate: string;
  notes?: string;
  assignedTo?: string;
  assignedToName?: string;
  paymentStatus?: 'fully_paid' | 'partial_paid' | 'pending';
  department?: string;
}): Promise<Order> => {
  await delay(NETWORK_DELAY);
  
  const { priority, remainingDays } = calculatePriority(payload.deliveryDate);
  
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderId: payload.orderId,
    clientName: payload.clientName,
    products: payload.products,
    deliveryDate: payload.deliveryDate,
    receivedAt: new Date().toISOString(),
    notes: payload.notes || '',
    stage: 'sales_received',
    assignedTo: payload.assignedTo,
    assignedToName: payload.assignedToName,
    source: 'manual',
    timeline: [
      {
        id: `tl-${Date.now()}`,
        stage: 'sales_received',
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        userName: 'Current User',
      },
    ],
    priority,
    remainingDays,
    paymentStatus: payload.paymentStatus || 'pending',
    department: payload.department || 'Sales',
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  return newOrder;
};

/**
 * Update an existing order
 * TODO: Replace with Firestore update operation
 */
export const updateOrder = async (orderId: string, patch: Partial<Order>): Promise<Order> => {
  await delay(NETWORK_DELAY);
  
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const index = orders.findIndex((o: Order) => o.id === orderId);
  
  if (index === -1) {
    throw new Error('Order not found');
  }

  // If delivery date changed, recalculate priority
  if (patch.deliveryDate) {
    const { priority, remainingDays } = calculatePriority(patch.deliveryDate);
    patch.priority = priority;
    patch.remainingDays = remainingDays;
  }

  orders[index] = { ...orders[index], ...patch };
  localStorage.setItem('orders', JSON.stringify(orders));

  return orders[index];
};

/**
 * Update order stage and add timeline entry
 * TODO: Replace with Firestore transaction
 */
export const updateOrderStage = async (
  orderId: string, 
  newStage: OrderStage,
  userId: string,
  userName: string
): Promise<Order> => {
  await delay(NETWORK_DELAY);
  
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const index = orders.findIndex((o: Order) => o.id === orderId);
  
  if (index === -1) {
    throw new Error('Order not found');
  }

  const timelineEntry = {
    id: `tl-${Date.now()}`,
    stage: newStage,
    timestamp: new Date().toISOString(),
    userId,
    userName,
  };

  orders[index].stage = newStage;
  orders[index].timeline.push(timelineEntry);
  localStorage.setItem('orders', JSON.stringify(orders));

  return orders[index];
};

/**
 * Fetch pending WooCommerce orders
 * TODO: Replace with Cloud Function call that fetches from WooCommerce API
 */
export const fetchPendingWooOrders = async (): Promise<PendingWooOrder[]> => {
  await delay(NETWORK_DELAY);
  return JSON.parse(localStorage.getItem('pendingWooOrders') || '[]');
};

/**
 * Sync WooCommerce orders
 * NOTE: In production, this should call a Cloud Function that:
 * 1. Has the API keys stored securely in environment variables
 * 2. Calls the WooCommerce REST API
 * 3. Stores results in Firestore
 * 
 * @param settings - WooCommerce settings (FOR DEMO ONLY - never use real keys in frontend)
 */
export const syncWooOrders = async (settings?: { siteUrl: string; consumerKey: string; consumerSecret: string }): Promise<PendingWooOrder[]> => {
  await delay(NETWORK_DELAY * 3); // Simulate longer API call
  
  // In demo mode, return mock data
  // TODO: Replace with Cloud Function call:
  // const response = await fetch('/api/sync-woo', { method: 'POST' });
  // return response.json();
  
  const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const existingPending = JSON.parse(localStorage.getItem('pendingWooOrders') || '[]');
  
  // Check for duplicates
  const markedOrders = mockPendingWooOrders.map(order => ({
    ...order,
    isDuplicate: existingOrders.some((o: Order) => o.orderId === order.orderId) ||
                 existingPending.some((o: PendingWooOrder) => o.orderId === order.orderId),
  }));

  localStorage.setItem('pendingWooOrders', JSON.stringify(markedOrders));
  return markedOrders;
};

/**
 * Approve a WooCommerce order and move to main workflow
 * TODO: Replace with Firestore transaction
 */
export const approveWooOrder = async (
  pendingOrder: PendingWooOrder,
  deliveryDate: string,
  assignedTo?: string,
  assignedToName?: string
): Promise<Order> => {
  await delay(NETWORK_DELAY);
  
  const { priority, remainingDays } = calculatePriority(deliveryDate);
  
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderId: pendingOrder.orderId,
    clientName: pendingOrder.clientName,
    products: pendingOrder.products,
    deliveryDate,
    receivedAt: pendingOrder.receivedAt,
    stage: 'sales_received',
    assignedTo,
    assignedToName,
    source: 'woocommerce',
    timeline: [
      {
        id: `tl-${Date.now()}`,
        stage: 'sales_received',
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        userName: 'Current User',
        note: 'Imported from WooCommerce',
      },
    ],
    priority,
    remainingDays,
    paymentStatus: pendingOrder.paymentStatus || 'pending',
    department: 'Sales',
  };

  // Add to orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Remove from pending
  const pending = JSON.parse(localStorage.getItem('pendingWooOrders') || '[]');
  const filtered = pending.filter((o: PendingWooOrder) => o.orderId !== pendingOrder.orderId);
  localStorage.setItem('pendingWooOrders', JSON.stringify(filtered));

  return newOrder;
};

/**
 * Ignore/dismiss a pending WooCommerce order
 * TODO: Replace with Firestore delete or status update
 */
export const ignorePendingOrder = async (orderId: string): Promise<void> => {
  await delay(NETWORK_DELAY);
  
  const pending = JSON.parse(localStorage.getItem('pendingWooOrders') || '[]');
  const filtered = pending.filter((o: PendingWooOrder) => o.orderId !== orderId);
  localStorage.setItem('pendingWooOrders', JSON.stringify(filtered));
};

/**
 * Fetch all users
 * TODO: Replace with Firestore query
 */
export const fetchUsers = async (): Promise<User[]> => {
  await delay(NETWORK_DELAY);
  return JSON.parse(localStorage.getItem('users') || '[]');
};

/**
 * Create a new user
 * TODO: Replace with Firebase Auth + Firestore
 */
export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  await delay(NETWORK_DELAY);
  
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
  };

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  return newUser;
};

/**
 * Update an existing user
 * TODO: Replace with Firestore update
 */
export const updateUser = async (userId: string, patch: Partial<User>): Promise<User> => {
  await delay(NETWORK_DELAY);
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const index = users.findIndex((u: User) => u.id === userId);
  
  if (index === -1) {
    throw new Error('User not found');
  }

  users[index] = { ...users[index], ...patch };
  localStorage.setItem('users', JSON.stringify(users));

  return users[index];
};

/**
 * Delete a user
 * TODO: Replace with Firebase Auth + Firestore delete
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await delay(NETWORK_DELAY);
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const filtered = users.filter((u: User) => u.id !== userId);
  localStorage.setItem('users', JSON.stringify(filtered));
};

// Export the API object for easy replacement
export const api = {
  fetchOrders,
  createOrder,
  updateOrder,
  updateOrderStage,
  fetchPendingWooOrders,
  syncWooOrders,
  approveWooOrder,
  ignorePendingOrder,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default api;
