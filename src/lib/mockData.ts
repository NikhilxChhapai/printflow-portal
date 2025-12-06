import { User, Order, PendingWooOrder, OrderStage } from './types';

// Helper to calculate days from now
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

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@printco.com',
    role: 'admin',
    department: 'Administration',
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah@printco.com',
    role: 'sales',
    department: 'Sales',
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@printco.com',
    role: 'sales',
    department: 'Sales',
  },
  {
    id: 'user-4',
    name: 'Emma Wilson',
    email: 'emma@printco.com',
    role: 'design',
    department: 'Design',
  },
  {
    id: 'user-5',
    name: 'James Brown',
    email: 'james@printco.com',
    role: 'production',
    department: 'Production',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderId: 'ORD-2024-001',
    clientName: 'Acme Corporation',
    products: [
      { name: 'Business Cards (500)', qty: 2 },
      { name: 'Letterheads (1000)', qty: 1 },
    ],
    deliveryDate: daysFromNow(1),
    receivedAt: daysAgo(3),
    notes: 'Rush order - priority client',
    stage: 'printing',
    assignedTo: 'user-5',
    assignedToName: 'James Brown',
    source: 'manual',
    timeline: [
      {
        id: 'tl-1',
        stage: 'sales_received',
        timestamp: daysAgo(3),
        userId: 'user-2',
        userName: 'Sarah Johnson',
      },
      {
        id: 'tl-2',
        stage: 'design',
        timestamp: daysAgo(2),
        userId: 'user-4',
        userName: 'Emma Wilson',
      },
      {
        id: 'tl-3',
        stage: 'printing',
        timestamp: daysAgo(1),
        userId: 'user-5',
        userName: 'James Brown',
      },
    ],
    priority: 'high',
    remainingDays: 1,
  },
  {
    id: 'ord-2',
    orderId: 'ORD-2024-002',
    clientName: 'Tech Startup Inc',
    products: [
      { name: 'Brochures (500)', qty: 1 },
    ],
    deliveryDate: daysFromNow(4),
    receivedAt: daysAgo(2),
    notes: '',
    stage: 'design',
    assignedTo: 'user-4',
    assignedToName: 'Emma Wilson',
    source: 'woocommerce',
    timeline: [
      {
        id: 'tl-4',
        stage: 'sales_received',
        timestamp: daysAgo(2),
        userId: 'user-2',
        userName: 'Sarah Johnson',
      },
      {
        id: 'tl-5',
        stage: 'design',
        timestamp: daysAgo(1),
        userId: 'user-4',
        userName: 'Emma Wilson',
      },
    ],
    priority: 'medium',
    remainingDays: 4,
  },
  {
    id: 'ord-3',
    orderId: 'ORD-2024-003',
    clientName: 'Local Restaurant',
    products: [
      { name: 'Menus (200)', qty: 1 },
      { name: 'Table Tents (50)', qty: 2 },
    ],
    deliveryDate: daysFromNow(7),
    receivedAt: daysAgo(1),
    notes: 'New customer',
    stage: 'sales_received',
    assignedTo: 'user-2',
    assignedToName: 'Sarah Johnson',
    source: 'manual',
    timeline: [
      {
        id: 'tl-6',
        stage: 'sales_received',
        timestamp: daysAgo(1),
        userId: 'user-2',
        userName: 'Sarah Johnson',
      },
    ],
    priority: 'low',
    remainingDays: 7,
  },
  {
    id: 'ord-4',
    orderId: 'ORD-2024-004',
    clientName: 'Wedding Planners LLC',
    products: [
      { name: 'Invitations (150)', qty: 1 },
      { name: 'Thank You Cards (150)', qty: 1 },
    ],
    deliveryDate: daysFromNow(2),
    receivedAt: daysAgo(5),
    notes: 'Premium paper requested',
    stage: 'finishing',
    assignedTo: 'user-5',
    assignedToName: 'James Brown',
    source: 'manual',
    timeline: [
      {
        id: 'tl-7',
        stage: 'sales_received',
        timestamp: daysAgo(5),
        userId: 'user-3',
        userName: 'Mike Chen',
      },
      {
        id: 'tl-8',
        stage: 'design',
        timestamp: daysAgo(4),
        userId: 'user-4',
        userName: 'Emma Wilson',
      },
      {
        id: 'tl-9',
        stage: 'prepress',
        timestamp: daysAgo(3),
        userId: 'user-4',
        userName: 'Emma Wilson',
      },
      {
        id: 'tl-10',
        stage: 'printing',
        timestamp: daysAgo(2),
        userId: 'user-5',
        userName: 'James Brown',
      },
      {
        id: 'tl-11',
        stage: 'finishing',
        timestamp: daysAgo(1),
        userId: 'user-5',
        userName: 'James Brown',
      },
    ],
    priority: 'high',
    remainingDays: 2,
  },
];

export const mockPendingWooOrders: PendingWooOrder[] = [
  {
    orderId: 'WOO-5001',
    clientName: 'John Smith',
    products: [
      { name: 'Flyers (1000)', qty: 1 },
    ],
    receivedAt: daysAgo(1),
    source: 'woocommerce',
  },
  {
    orderId: 'WOO-5002',
    clientName: 'Mary Johnson',
    products: [
      { name: 'Posters (50)', qty: 2 },
      { name: 'Banners (2)', qty: 1 },
    ],
    receivedAt: daysAgo(2),
    source: 'woocommerce',
  },
  {
    orderId: 'WOO-5003',
    clientName: 'Corporate Solutions',
    products: [
      { name: 'Annual Report (500)', qty: 1 },
    ],
    receivedAt: new Date().toISOString(),
    source: 'woocommerce',
  },
];

export const getActivityFeed = () => [
  {
    id: 'act-1',
    message: 'Order ORD-2024-001 moved to Printing stage',
    timestamp: daysAgo(0.1),
    user: 'James Brown',
  },
  {
    id: 'act-2',
    message: 'New order ORD-2024-004 created',
    timestamp: daysAgo(0.5),
    user: 'Mike Chen',
  },
  {
    id: 'act-3',
    message: 'WooCommerce sync completed - 3 new orders',
    timestamp: daysAgo(1),
    user: 'System',
  },
  {
    id: 'act-4',
    message: 'Order ORD-2024-002 assigned to Emma Wilson',
    timestamp: daysAgo(1.5),
    user: 'Sarah Johnson',
  },
  {
    id: 'act-5',
    message: 'New user James Brown added to Production',
    timestamp: daysAgo(2),
    user: 'Admin User',
  },
];
