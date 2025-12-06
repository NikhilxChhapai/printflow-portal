/**
 * WooCommerce Mock API Layer
 * 
 * All functions simulate WooCommerce REST API calls.
 * Replace implementations with real API calls when ready.
 * 
 * TODO: Replace with actual WooCommerce REST API:
 * GET https://{siteUrl}/wp-json/wc/v3/orders?status=processing,pending
 */

import { WooOrder, PaymentStatus } from './types';
import { mockWooOrders, mockPendingWooOrders } from './mockData';

// Simulate network delay
const delay = (ms: number = 400) => new Promise(res => setTimeout(res, ms));

// In-memory store for demo
let ordersStore: WooOrder[] = [...mockWooOrders];
let pendingOrdersStore: WooOrder[] = [...mockPendingWooOrders];

/**
 * Initialize from localStorage if available
 */
const initializeStore = () => {
  const storedOrders = localStorage.getItem('wc_orders');
  const storedPending = localStorage.getItem('wc_pending_orders');
  
  if (storedOrders) {
    ordersStore = JSON.parse(storedOrders);
  } else {
    localStorage.setItem('wc_orders', JSON.stringify(mockWooOrders));
  }
  
  if (storedPending) {
    pendingOrdersStore = JSON.parse(storedPending);
  } else {
    localStorage.setItem('wc_pending_orders', JSON.stringify(mockPendingWooOrders));
  }
};

initializeStore();

/**
 * Fetch all orders from WooCommerce
 * TODO: Replace with real API call
 */
export async function wcFetchOrders(): Promise<WooOrder[]> {
  await delay();
  const stored = localStorage.getItem('wc_orders');
  return stored ? JSON.parse(stored) : ordersStore;
}

/**
 * Fetch single order by ID
 * TODO: Replace with real API call
 */
export async function wcFetchOrder(orderNumber: string): Promise<WooOrder | null> {
  await delay();
  const orders = await wcFetchOrders();
  return orders.find(o => o.orderNumber === orderNumber) || null;
}

/**
 * Get payment status for an order
 * TODO: Replace with real API call
 */
export async function wcGetPaymentStatus(orderNumber: string): Promise<PaymentStatus | null> {
  await delay(200);
  const order = await wcFetchOrder(orderNumber);
  return order?.paymentStatus || null;
}

/**
 * Sync new orders from WooCommerce
 * TODO: Replace with Cloud Function that holds API keys
 */
export async function wcSyncNewOrders(): Promise<WooOrder[]> {
  await delay(800);
  // In production, this would call a secure backend endpoint
  // that fetches from WooCommerce with proper credentials
  return pendingOrdersStore;
}

/**
 * Fetch pending orders awaiting approval
 */
export async function wcFetchPendingOrders(): Promise<WooOrder[]> {
  await delay();
  const stored = localStorage.getItem('wc_pending_orders');
  return stored ? JSON.parse(stored) : pendingOrdersStore;
}

/**
 * Approve a pending order and move to main workflow
 */
export async function wcApproveOrder(orderNumber: string, updates?: Partial<WooOrder>): Promise<WooOrder | null> {
  await delay();
  
  const pending = await wcFetchPendingOrders();
  const orderIndex = pending.findIndex(o => o.orderNumber === orderNumber);
  
  if (orderIndex === -1) return null;
  
  const order = { ...pending[orderIndex], ...updates, currentStage: 'sales_received' };
  
  // Remove from pending
  pending.splice(orderIndex, 1);
  localStorage.setItem('wc_pending_orders', JSON.stringify(pending));
  
  // Add to main orders
  const orders = await wcFetchOrders();
  orders.push(order);
  localStorage.setItem('wc_orders', JSON.stringify(orders));
  
  return order;
}

/**
 * Ignore/dismiss a pending order
 */
export async function wcIgnoreOrder(orderNumber: string): Promise<boolean> {
  await delay();
  
  const pending = await wcFetchPendingOrders();
  const filtered = pending.filter(o => o.orderNumber !== orderNumber);
  localStorage.setItem('wc_pending_orders', JSON.stringify(filtered));
  
  return true;
}

/**
 * Update an existing order
 */
export async function wcUpdateOrder(orderNumber: string, updates: Partial<WooOrder>): Promise<WooOrder | null> {
  await delay();
  
  const orders = await wcFetchOrders();
  const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
  
  if (orderIndex === -1) return null;
  
  orders[orderIndex] = { ...orders[orderIndex], ...updates };
  localStorage.setItem('wc_orders', JSON.stringify(orders));
  
  return orders[orderIndex];
}

/**
 * Update order stage
 */
export async function wcUpdateOrderStage(
  orderNumber: string,
  stage: string,
  department: string
): Promise<WooOrder | null> {
  return wcUpdateOrder(orderNumber, { currentStage: stage, department });
}

// Export all functions
export const woocommerceApi = {
  fetchOrders: wcFetchOrders,
  fetchOrder: wcFetchOrder,
  getPaymentStatus: wcGetPaymentStatus,
  syncNewOrders: wcSyncNewOrders,
  fetchPendingOrders: wcFetchPendingOrders,
  approveOrder: wcApproveOrder,
  ignoreOrder: wcIgnoreOrder,
  updateOrder: wcUpdateOrder,
  updateOrderStage: wcUpdateOrderStage,
};

export default woocommerceApi;

export * from './types';
