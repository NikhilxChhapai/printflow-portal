import React from 'react';
import { Calendar, User, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, ORDER_STAGES, STAGE_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const stageLabel = ORDER_STAGES.find(s => s.value === order.stage)?.label || order.stage;
  const stageColor = STAGE_COLORS[order.stage];

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
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">{order.orderId}</h3>
              {order.source === 'woocommerce' && (
                <Badge variant="secondary" className="text-xs">WC</Badge>
              )}
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

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          {/* Stage badge */}
          <Badge className={cn('text-xs text-white', stageColor)}>
            {stageLabel}
          </Badge>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
