import React, { useState } from 'react';
import { 
  X, Calendar, User, Package, Clock, Edit2, Check, 
  FileText, Paperclip, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Order, 
  ORDER_STAGES, 
  STAGE_COLORS, 
  OrderStage, 
  User as UserType,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  DEPARTMENT_TO_ROLE,
} from '@/lib/types';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  users: UserType[];
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose, users }) => {
  const { updateOrder, updateOrderStage } = useOrders();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    notes: order.notes || '',
    assignedTo: order.assignedTo || '',
  });

  const canEdit = hasPermission(['admin']);
  const paymentColors = PAYMENT_STATUS_COLORS[order.paymentStatus];

  // Check if user can update this stage (admin or same department)
  const canUpdateStage = (stage: OrderStage): boolean => {
    if (hasPermission(['admin'])) return true;
    const stageInfo = ORDER_STAGES.find(s => s.value === stage);
    if (!stageInfo) return false;
    const requiredRole = DEPARTMENT_TO_ROLE[stageInfo.department];
    return user?.role === requiredRole;
  };

  // Check if assigned user is on leave
  const assignedUser = users.find(u => u.id === order.assignedTo);
  const isAssignedUserOnLeave = assignedUser?.onLeave || false;

  // Can take over - admin or same department members
  const canTakeOver = (): boolean => {
    if (!isAssignedUserOnLeave) return false;
    if (hasPermission(['admin'])) return true;
    return user?.department === assignedUser?.department;
  };

  const handleStageChange = async (newStage: OrderStage) => {
    if (!user || !canUpdateStage(newStage)) {
      toast({
        title: 'Permission Denied',
        description: 'You can only update stages for your department.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      const stageInfo = ORDER_STAGES.find(s => s.value === newStage);
      await updateOrderStage(order.id, newStage, user.id, user.name);
      
      // Update department based on stage
      if (stageInfo) {
        await updateOrder(order.id, { department: stageInfo.department });
      }
      
      toast({
        title: 'Stage updated',
        description: `Order moved to ${stageInfo?.label}`,
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
      const assignedUserData = users.find(u => u.id === formData.assignedTo);
      await updateOrder(order.id, {
        notes: formData.notes,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: assignedUserData?.name,
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

  const handleTakeOver = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateOrder(order.id, {
        assignedTo: user.id,
        assignedToName: user.name,
      });
      toast({
        title: 'Order Reassigned',
        description: `Order is now assigned to you.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not reassign order.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get current stage index for progress
  const currentStageIndex = ORDER_STAGES.findIndex(s => s.value === order.stage);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border shadow-elevated slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-foreground">{order.orderId}</h2>
              {order.source === 'woocommerce' && (
                <Badge variant="secondary">WC</Badge>
              )}
              <Badge className={cn('text-xs', paymentColors.bg, paymentColors.text)}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{order.clientName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* On Leave Warning */}
          {isAssignedUserOnLeave && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Assigned User On Leave</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignedUser?.name} is currently on leave.
                  </p>
                  {canTakeOver() && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={handleTakeOver}
                      disabled={isUpdating}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Take Over
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Priority & Dates */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-border p-3 sm:p-4">
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
            <div className="rounded-xl border border-border p-3 sm:p-4">
              <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(order.deliveryDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Stage Progress */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Stage Progress</h3>
            <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
              {ORDER_STAGES.slice(0, 5).map((stage, idx) => (
                <div
                  key={stage.value}
                  className={cn(
                    'flex-1 h-2 rounded-full min-w-8',
                    idx <= currentStageIndex 
                      ? STAGE_COLORS[stage.value]
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
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
                  <SelectItem 
                    key={stage.value} 
                    value={stage.value}
                    disabled={!canUpdateStage(stage.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', STAGE_COLORS[stage.value])} />
                      {stage.label}
                      <span className="text-xs text-muted-foreground">({stage.department})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Tabs for Notes/Files */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                <FileText className="h-4 w-4 mr-1.5" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="files" className="flex-1">
                <Paperclip className="h-4 w-4 mr-1.5" />
                Files
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      placeholder="Add notes about this order..."
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-4 min-h-[100px]">
                  {order.notes ? (
                    <p className="text-foreground whitespace-pre-wrap">{order.notes}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No notes added</p>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="files" className="mt-4">
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  File attachments will be available when connected to backend
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Assignment */}
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
                          <div className="flex items-center gap-2">
                            {u.name} ({u.role})
                            {u.onLeave && (
                              <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                                On Leave
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <div className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {order.assignedToName || 'Unassigned'}
                  {isAssignedUserOnLeave && (
                    <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive">
                      On Leave
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Department: {order.department}</p>
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
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
