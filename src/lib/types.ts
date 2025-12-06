export type UserRole = 'admin' | 'sales' | 'design' | 'prepress' | 'production';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type OrderStage = 
  | 'sales_received'
  | 'design'
  | 'client_approval'
  | 'prepress'
  | 'printing'
  | 'finishing'
  | 'packing'
  | 'dispatch'
  | 'delivered';

export type Priority = 'high' | 'medium' | 'low';

export interface Product {
  name: string;
  qty: number;
}

export interface TimelineEntry {
  id: string;
  stage: OrderStage;
  timestamp: string;
  userId: string;
  userName: string;
  note?: string;
}

export interface Order {
  id: string;
  orderId: string;
  clientName: string;
  products: Product[];
  deliveryDate: string;
  receivedAt: string;
  notes?: string;
  stage: OrderStage;
  assignedTo?: string;
  assignedToName?: string;
  source: 'manual' | 'woocommerce';
  timeline: TimelineEntry[];
  priority: Priority;
  remainingDays: number;
}

export interface PendingWooOrder {
  orderId: string;
  clientName: string;
  products: Product[];
  receivedAt: string;
  source: 'woocommerce';
  isDuplicate?: boolean;
}

export interface WooCommerceSettings {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export const ORDER_STAGES: { value: OrderStage; label: string }[] = [
  { value: 'sales_received', label: 'Sales Received' },
  { value: 'design', label: 'Design' },
  { value: 'client_approval', label: 'Client Approval' },
  { value: 'prepress', label: 'Prepress' },
  { value: 'printing', label: 'Printing' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'packing', label: 'Packing' },
  { value: 'dispatch', label: 'Dispatch' },
  { value: 'delivered', label: 'Delivered' },
];

export const STAGE_COLORS: Record<OrderStage, string> = {
  sales_received: 'bg-blue-500',
  design: 'bg-purple-500',
  client_approval: 'bg-amber-500',
  prepress: 'bg-cyan-500',
  printing: 'bg-indigo-500',
  finishing: 'bg-pink-500',
  packing: 'bg-orange-500',
  dispatch: 'bg-teal-500',
  delivered: 'bg-green-500',
};
