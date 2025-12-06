import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Package, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrders } from '@/contexts/OrderContext';
import OrderCard from '@/components/orders/OrderCard';
import OrderTableRow from '@/components/orders/OrderTableRow';
import OrderDetail from '@/components/orders/OrderDetail';
import { Order, ORDER_STAGES, OrderStage, Priority, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as api from '@/lib/api';

type ViewMode = 'card' | 'table';

const Orders: React.FC = () => {
  const { orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<OrderStage | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('ordersViewMode') as ViewMode) || 'card';
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await api.fetchUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem('ordersViewMode', viewMode);
  }, [viewMode]);

  // Check if assigned user is on leave
  const getUserOnLeaveStatus = (assignedTo?: string): boolean => {
    if (!assignedTo) return false;
    const user = users.find(u => u.id === assignedTo);
    return user?.onLeave || false;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        order.orderId.toLowerCase().includes(searchLower) ||
        order.clientName.toLowerCase().includes(searchLower) ||
        order.products.some(p => p.name.toLowerCase().includes(searchLower));
      const matchesStage = stageFilter === 'all' || order.stage === stageFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      return matchesSearch && matchesStage && matchesPriority;
    });
  }, [orders, searchQuery, stageFilter, priorityFilter]);

  // Sort by delivery date (closest first)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => a.remainingDays - b.remainingDays);
  }, [filteredOrders]);

  // Find the updated order when orders change
  const currentSelectedOrder = selectedOrder 
    ? orders.find(o => o.id === selectedOrder.id) || selectedOrder
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all orders ({sortedOrders.length})
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order #, client, or product..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as OrderStage | 'all')}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {ORDER_STAGES.map(stage => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-priority-high" />
                  High (0-2d)
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-priority-medium" />
                  Medium (3-5d)
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-priority-low" />
                  Low (5+d)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Display */}
      {isLoading ? (
        viewMode === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <div className="h-64 animate-pulse bg-muted" />
          </div>
        )
      ) : sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No orders found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery || stageFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here when imported from WooCommerce'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedOrders.map((order, index) => (
            <div
              key={order.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <OrderCard
                order={order}
                onClick={() => setSelectedOrder(order)}
                assignedUserOnLeave={getUserOnLeaveStatus(order.assignedTo)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                    assignedUserOnLeave={getUserOnLeaveStatus(order.assignedTo)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Order Detail Slide-over */}
      {currentSelectedOrder && (
        <OrderDetail
          order={currentSelectedOrder}
          onClose={() => setSelectedOrder(null)}
          users={users}
        />
      )}
    </div>
  );
};

export default Orders;
