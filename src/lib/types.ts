export type UserRole = 'admin' | 'sales' | 'design' | 'prepress' | 'production';

export type PaymentStatus = 'fully_paid' | 'partial_paid' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  onLeave?: boolean;
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
  paymentStatus: PaymentStatus;
  department: string;
}

export interface PendingWooOrder {
  orderId: string;
  clientName: string;
  products: Product[];
  receivedAt: string;
  source: 'woocommerce';
  isDuplicate?: boolean;
  paymentStatus: PaymentStatus;
  deliveryDate?: string;
}

export interface WooCommerceSettings {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export const ORDER_STAGES: { value: OrderStage; label: string; department: string }[] = [
  { value: 'sales_received', label: 'Sales Received', department: 'Sales' },
  { value: 'design', label: 'Design', department: 'Design' },
  { value: 'client_approval', label: 'Client Approval', department: 'Sales' },
  { value: 'prepress', label: 'Prepress', department: 'Prepress' },
  { value: 'printing', label: 'Printing', department: 'Production' },
  { value: 'finishing', label: 'Finishing', department: 'Production' },
  { value: 'packing', label: 'Packing', department: 'Production' },
  { value: 'dispatch', label: 'Dispatch', department: 'Production' },
  { value: 'delivered', label: 'Delivered', department: 'Sales' },
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

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  fully_paid: 'Fully Paid',
  partial_paid: 'Partial Paid',
  pending: 'Pending',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  fully_paid: { bg: 'bg-success/10', text: 'text-success' },
  partial_paid: { bg: 'bg-warning/10', text: 'text-warning' },
  pending: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

export const DEPARTMENT_TO_ROLE: Record<string, UserRole> = {
  'Sales': 'sales',
  'Design': 'design',
  'Prepress': 'prepress',
  'Production': 'production',
  'Administration': 'admin',
};

export const ROLE_TO_DEPARTMENT: Record<UserRole, string> = {
  'sales': 'Sales',
  'design': 'Design',
  'prepress': 'Prepress',
  'production': 'Production',
  'admin': 'Administration',
};
