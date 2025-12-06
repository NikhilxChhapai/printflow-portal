import React from 'react';
import { Calendar, User, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { 
  Order, 
  ORDER_STAGES, 
  STAGE_COLORS, 
  PAYMENT_STATUS_LABELS, 
  PAYMENT_STATUS_COLORS 
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderTableRowProps {
  order: Order;
  onClick: () => void;
  assignedUserOnLeave?: boolean;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({ 
  order, 
  onClick,
  assignedUserOnLeave = false,
}) => {
  const stageLabel = ORDER_STAGES.find(s => s.value === order.stage)?.label || order.stage;
  const stageColor = STAGE_COLORS[order.stage];
  const paymentColors = PAYMENT_STATUS_COLORS[order.paymentStatus];

  return (
    <TableRow 
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/50',
        order.priority === 'high' && 'border-l-4 border-l-[hsl(var(--priority-high))]',
        order.priority === 'medium' && 'border-l-4 border-l-[hsl(var(--priority-medium))]',
        order.priority === 'low' && 'border-l-4 border-l-[hsl(var(--priority-low))]'
      )}
      onClick={onClick}
    >
      <TableCell className="font-medium">{order.orderId}</TableCell>
      <TableCell>
        <div className="max-w-[150px] truncate">{order.clientName}</div>
      </TableCell>
      <TableCell>
        <div className="max-w-[200px]">
          {order.products.slice(0, 2).map((p, i) => (
            <span key={i} className="text-sm">
              {p.name} ×{p.qty}
              {i < Math.min(order.products.length, 2) - 1 && ', '}
            </span>
          ))}
          {order.products.length > 2 && (
            <span className="text-muted-foreground"> +{order.products.length - 2}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', paymentColors.bg, paymentColors.text)}>
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {format(new Date(order.deliveryDate), 'MMM d')}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">{order.department}</span>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs text-white', stageColor)}>
          {stageLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {order.assignedToName ? (
            <>
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{order.assignedToName.split(' ')[0]}</span>
              {assignedUserOnLeave && (
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  On Leave
                </Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Unassigned</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className={cn(
          'inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-md text-xs font-medium',
          order.priority === 'high' && 'bg-priority-high/10 text-priority-high',
          order.priority === 'medium' && 'bg-priority-medium/10 text-priority-medium',
          order.priority === 'low' && 'bg-priority-low/10 text-priority-low'
        )}>
          {order.remainingDays <= 0 ? 'Overdue' : `${order.remainingDays}d`}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
