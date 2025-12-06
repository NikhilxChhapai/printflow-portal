/**
 * WooCommerce API Types
 * These types match the WooCommerce REST API structure
 * for easy replacement with real API later.
 */

export type PaymentStatus = 'fully_paid' | 'partial_paid' | 'pending';

export interface WooOrderItem {
  productName: string;
  qty: number;
}

export interface WooOrder {
  orderNumber: string;
  clientName: string;
  items: WooOrderItem[];
  paymentStatus: PaymentStatus;
  deliveryDate: string;
  currentStage: string;
  department: string;
  priority: string;
  receivedAt: string;
  source: 'woocommerce';
}

export interface WooOrderRaw {
  id: number;
  order_key: string;
  status: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: string;
  }>;
  payment_method: string;
  payment_method_title: string;
  date_paid: string | null;
  total: string;
  currency: string;
}

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
