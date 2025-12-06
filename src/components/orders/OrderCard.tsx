import React from 'react';
import { Calendar, User, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Order, 
  ORDER_STAGES, 
  STAGE_COLORS, 
  PAYMENT_STATUS_LABELS, 
  PAYMENT_STATUS_COLORS 
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  assignedUserOnLeave?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, assignedUserOnLeave = false }) => {
  const stageLabel = ORDER_STAGES.find(s => s.value === order.stage)?.label || order.stage;
  const stageColor = STAGE_COLORS[order.stage];
  const paymentColors = PAYMENT_STATUS_COLORS[order.paymentStatus];

  return (
    <Card
      className={cn(
        'cursor-pointer shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5',
        order.priority === 'high' && 'priority-strip-high',
        order.priority === 'medium' && 'priority-strip-medium',
        order.priority === 'low' && 'priority-strip-low'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{order.orderId}</h3>
              {order.source === 'woocommerce' && (
                <Badge variant="secondary" className="text-xs">WC</Badge>
              )}
              <Badge className={cn('text-xs', paymentColors.bg, paymentColors.text)}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
            </div>

            {/* Client */}
            <p className="text-muted-foreground truncate">{order.clientName}</p>

            {/* Products */}
            <div className="flex flex-wrap gap-1 mt-2">
              {order.products.slice(0, 2).map((product, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-normal">
                  <Package className="mr-1 h-3 w-3" />
                  {product.name} × {product.qty}
                </Badge>
              ))}
              {order.products.length > 2 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{order.products.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Priority indicator */}
          <div className="text-right shrink-0">
            <div className={cn(
              'inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-lg text-sm font-medium',
              order.priority === 'high' && 'bg-priority-high/10 text-priority-high',
              order.priority === 'medium' && 'bg-priority-medium/10 text-priority-medium',
              order.priority === 'low' && 'bg-priority-low/10 text-priority-low'
            )}>
              {order.remainingDays <= 0 ? 'Overdue' : `${order.remainingDays}d`}
            </div>
          </div>
        </div>

        {/* Assigned User On Leave Warning */}
        {assignedUserOnLeave && (
          <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Assigned user on leave</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 flex-wrap gap-2">
          {/* Stage badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs text-white', stageColor)}>
              {stageLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">{order.department}</span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(order.deliveryDate), 'MMM d')}
            </div>
            {order.assignedToName && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.assignedToName.split(' ')[0]}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
