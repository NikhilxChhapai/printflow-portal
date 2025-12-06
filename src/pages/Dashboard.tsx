import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { getActivityFeed } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { orders, isLoading } = useOrders();
  const { user } = useAuth();
  const activityFeed = getActivityFeed();

  const stats = useMemo(() => {
    const total = orders.length;
    const urgent = orders.filter(o => o.remainingDays <= 2).length;
    const medium = orders.filter(o => o.remainingDays > 2 && o.remainingDays <= 5).length;
    const safe = orders.filter(o => o.remainingDays > 5).length;

    return { total, urgent, medium, safe };
  }, [orders]);

  const urgentOrders = useMemo(() => {
    return orders.filter(o => o.priority === 'high').slice(0, 5);
  }, [orders]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Due 0-2 Days',
      value: stats.urgent,
      icon: AlertTriangle,
      color: 'text-priority-high',
      bgColor: 'bg-priority-high/10',
      priority: 'high',
    },
    {
      title: 'Due 3-5 Days',
      value: stats.medium,
      icon: Clock,
      color: 'text-priority-medium',
      bgColor: 'bg-priority-medium/10',
      priority: 'medium',
    },
    {
      title: 'Due 5+ Days',
      value: stats.safe,
      icon: CheckCircle,
      color: 'text-priority-low',
      bgColor: 'bg-priority-low/10',
      priority: 'low',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        <Button asChild>
          <Link to="/create-order">
            Create Order
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="shadow-card border-border/50 transition-all hover:shadow-elevated"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.bgColor)}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Orders */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Urgent Orders</CardTitle>
              <CardDescription>Orders due within 2 days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : urgentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-priority-low mb-2" />
                <p className="text-muted-foreground">No urgent orders!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentOrders.map(order => (
                  <Link
                    key={order.id}
                    to="/orders"
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-soft',
                      order.priority === 'high' && 'priority-strip-high',
                      order.priority === 'medium' && 'priority-strip-medium',
                      order.priority === 'low' && 'priority-strip-low'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{order.orderId}</p>
                      <p className="text-sm text-muted-foreground truncate">{order.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-medium',
                        order.remainingDays <= 0 ? 'text-priority-high' : 'text-muted-foreground'
                      )}>
                        {order.remainingDays <= 0 ? 'Overdue' : `${order.remainingDays}d left`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.stage.replace('_', ' ')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest updates across the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityFeed.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    {index < activityFeed.length - 1 && (
                      <div className="absolute left-4 top-8 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
