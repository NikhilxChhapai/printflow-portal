/**
 * Mock WooCommerce Data
 * Simulates WooCommerce REST API responses.
 * Replace this with actual API calls later.
 */

import { WooOrder, PaymentStatus } from './types';

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const mockWooOrders: WooOrder[] = [
  {
    orderNumber: 'WC-53201',
    clientName: 'Ankit Sharma',
    items: [
      { productName: 'Soft Suede Business Cards', qty: 500 }
    ],
    paymentStatus: 'fully_paid',
    deliveryDate: daysFromNow(1),
    currentStage: 'printing',
    department: 'Production',
    priority: 'high',
    receivedAt: daysAgo(3),
    source: 'woocommerce',
  },
  {
    orderNumber: 'WC-53208',
    clientName: 'Harshita Creations',
    items: [
      { productName: 'Wedding Invitation Box', qty: 120 },
      { productName: 'Envelope A5', qty: 120 }
    ],
    paymentStatus: 'partial_paid',
    deliveryDate: daysFromNow(4),
    currentStage: 'design',
    department: 'Design',
    priority: 'medium',
    receivedAt: daysAgo(2),
    source: 'woocommerce',
  },
  {
    orderNumber: 'WC-53223',
    clientName: 'Raghav Traders',
    items: [
      { productName: 'NFC Card Black Edition', qty: 50 }
    ],
    paymentStatus: 'pending',
    deliveryDate: daysFromNow(7),
    currentStage: 'sales_received',
    department: 'Sales',
    priority: 'low',
    receivedAt: daysAgo(1),
    source: 'woocommerce',
  },
  {
    orderNumber: 'WC-53245',
    clientName: 'Metro Events Co.',
    items: [
      { productName: 'Event Banners 6x3ft', qty: 5 },
      { productName: 'Standee Display', qty: 10 }
    ],
    paymentStatus: 'fully_paid',
    deliveryDate: daysFromNow(2),
    currentStage: 'prepress',
    department: 'Prepress',
    priority: 'high',
    receivedAt: daysAgo(4),
    source: 'woocommerce',
  },
  {
    orderNumber: 'WC-53267',
    clientName: 'Sunrise Academy',
    items: [
      { productName: 'Student ID Cards', qty: 200 },
      { productName: 'Staff ID Cards', qty: 50 }
    ],
    paymentStatus: 'fully_paid',
    deliveryDate: daysFromNow(5),
    currentStage: 'design',
    department: 'Design',
    priority: 'medium',
    receivedAt: daysAgo(1),
    source: 'woocommerce',
  },
];

export const mockPendingWooOrders: WooOrder[] = [
  {
    orderNumber: 'WC-53280',
    clientName: 'John Smith',
    items: [
      { productName: 'Flyers (1000)', qty: 1 }
    ],
    paymentStatus: 'fully_paid',
    deliveryDate: daysFromNow(3),
    currentStage: 'pending',
    department: 'Sales',
    priority: 'medium',
    receivedAt: daysAgo(1),
    source: 'woocommerce',
  },
  {
    orderNumber: 'WC-53281',
    clientName: 'Mary Johnson',
    items: [
      { productName: 'Posters (50)', qty: 2 },
      { productName: 'Banners (2)', qty: 1 }
    ],
    paymentStatus: 'partial_paid',
    deliveryDate: daysFromNow(6),
    currentStage: 'pending',
    department: 'Sales',
    priority: 'low',
    receivedAt: daysAgo(2),
    source: 'woocommerce',
  },
  {
    orderNumber: 'WC-53282',
    clientName: 'Corporate Solutions',
    items: [
      { productName: 'Annual Report (500)', qty: 1 }
    ],
    paymentStatus: 'pending',
    deliveryDate: daysFromNow(1),
    currentStage: 'pending',
    department: 'Sales',
    priority: 'high',
    receivedAt: new Date().toISOString(),
    source: 'woocommerce',
  },
];
