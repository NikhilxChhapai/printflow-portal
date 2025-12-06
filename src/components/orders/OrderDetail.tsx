import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Package, Clock, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, ORDER_STAGES, STAGE_COLORS, OrderStage, User as UserType } from '@/lib/types';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import * as api from '@/lib/api';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose }) => {
  const { updateOrder, updateOrderStage } = useOrders();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState({
    notes: order.notes || '',
    assignedTo: order.assignedTo || '',
  });

  useEffect(() => {
    const loadUsers = async () => {
      const data = await api.fetchUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  const canEdit = hasPermission(['admin', 'sales']);

  const handleStageChange = async (newStage: OrderStage) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateOrderStage(order.id, newStage, user.id, user.name);
      toast({
        title: 'Stage updated',
        description: `Order moved to ${ORDER_STAGES.find(s => s.value === newStage)?.label}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update order stage.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const assignedUser = users.find(u => u.id === formData.assignedTo);
      await updateOrder(order.id, {
        notes: formData.notes,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: assignedUser?.name,
      });
      toast({
        title: 'Order updated',
        description: 'Changes have been saved.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update order.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-elevated slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card p-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{order.orderId}</h2>
              {order.source === 'woocommerce' && (
                <Badge variant="secondary">WooCommerce</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{order.clientName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Priority & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Priority</p>
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium',
                order.priority === 'high' && 'bg-priority-high/10 text-priority-high',
                order.priority === 'medium' && 'bg-priority-medium/10 text-priority-medium',
                order.priority === 'low' && 'bg-priority-low/10 text-priority-low'
              )}>
                {order.remainingDays <= 0 ? 'Overdue' : `${order.remainingDays} days left`}
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(order.deliveryDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Products</h3>
            <div className="space-y-2">
              {order.products.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{product.name}</span>
                  </div>
                  <Badge variant="outline">×{product.qty}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Current Stage</h3>
            <Select
              value={order.stage}
              onValueChange={(value) => handleStageChange(value as OrderStage)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STAGES.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', STAGE_COLORS[stage.value])} />
                      {stage.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Assignment</h3>
              {canEdit && !isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign to</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isUpdating}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 text-foreground mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {order.assignedToName || 'Unassigned'}
                </div>
                {order.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{order.notes}</p>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Timeline</h3>
            <div className="space-y-4">
              {order.timeline.slice().reverse().map((entry, idx) => {
                const stageInfo = ORDER_STAGES.find(s => s.value === entry.stage);
                return (
                  <div key={entry.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={cn('h-3 w-3 rounded-full', STAGE_COLORS[entry.stage])} />
                      {idx < order.timeline.length - 1 && (
                        <div className="h-full w-px bg-border absolute top-4" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">{stageInfo?.label}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                        <span>•</span>
                        {entry.userName}
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
