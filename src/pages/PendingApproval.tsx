import React, { useState } from 'react';
import { RefreshCw, Check, X, AlertCircle, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/hooks/use-toast';
import { PendingWooOrder } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const PendingApproval: React.FC = () => {
  const { pendingOrders, syncWooOrders, approveWooOrder, ignorePendingOrder } = useOrders();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingWooOrder | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [approvedOrderId, setApprovedOrderId] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWooOrders();
      toast({
        title: 'Sync complete',
        description: 'WooCommerce orders have been fetched.',
      });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Could not fetch orders from WooCommerce.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApproveClick = (order: PendingWooOrder) => {
    setSelectedOrder(order);
    // Default to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDeliveryDate(defaultDate.toISOString().split('T')[0]);
  };

  const handleApproveConfirm = async () => {
    if (!selectedOrder || !deliveryDate) return;

    setIsApproving(true);
    try {
      await approveWooOrder(selectedOrder, deliveryDate);
      setApprovedOrderId(selectedOrder.orderId);
      
      toast({
        title: 'Order approved!',
        description: `${selectedOrder.orderId} has been added to the workflow.`,
      });

      // Reset animation state after animation completes
      setTimeout(() => {
        setApprovedOrderId(null);
      }, 600);

      setSelectedOrder(null);
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: 'Could not approve the order.',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleIgnore = async (orderId: string) => {
    try {
      await ignorePendingOrder(orderId);
      toast({
        title: 'Order ignored',
        description: 'The order has been dismissed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not ignore the order.',
        variant: 'destructive',
      });
    }
  };

  const validOrders = pendingOrders.filter(o => !o.isDuplicate);
  const duplicateOrders = pendingOrders.filter(o => o.isDuplicate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approval</h1>
          <p className="text-muted-foreground">
            Review and approve WooCommerce orders
          </p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing && 'animate-spin')} />
          Sync Now
        </Button>
      </div>

      {/* Info banner */}
      <Card className="border-info/50 bg-info/5">
        <CardContent className="flex items-start gap-4 p-4">
          <AlertCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">WooCommerce Integration (Demo Mode)</p>
            <p className="text-muted-foreground mt-1">
              Orders shown are mock data. In production, connect via Settings to fetch real orders.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Orders list */}
      {validOrders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No pending orders</h3>
            <p className="text-muted-foreground mt-1">
              Click "Sync Now" to fetch orders from WooCommerce
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {validOrders.map(order => (
            <Card
              key={order.orderId}
              className={cn(
                'shadow-card transition-all',
                approvedOrderId === order.orderId && 'animate-success-pulse'
              )}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{order.orderId}</h3>
                      <Badge variant="secondary">WooCommerce</Badge>
                    </div>
                    <p className="text-muted-foreground">{order.clientName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.products.map((product, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {product.name} × {product.qty}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Received: {format(new Date(order.receivedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIgnore(order.orderId)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Ignore
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveClick(order)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Duplicate orders notice */}
      {duplicateOrders.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Duplicates Detected
            </CardTitle>
            <CardDescription>
              {duplicateOrders.length} order(s) already exist in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {duplicateOrders.map(order => (
                <Badge key={order.orderId} variant="secondary">
                  {order.orderId}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
            <DialogDescription>
              Set the delivery date for {selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {selectedOrder && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Order Details</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedOrder.clientName}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedOrder.products.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {p.name} × {p.qty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleApproveConfirm} disabled={isApproving || !deliveryDate}>
              {isApproving ? 'Approving...' : 'Approve Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingApproval;
