import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Package,
  PlusCircle,
  Users,
  Settings,
  ChevronLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { pendingOrders } = useOrders();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Pending Approval',
      href: '/pending',
      icon: Clock,
      badge: pendingOrders.filter(o => !o.isDuplicate).length,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: Package,
    },
    {
      name: 'Create Order',
      href: '/create-order',
      icon: PlusCircle,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      adminOnly: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const filteredNavigation = navigation.filter(
    item => !item.adminOnly || hasPermission(['admin'])
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 lg:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Collapse toggle - desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 hidden h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-soft lg:flex"
          onClick={onToggleCollapse}
        >
          <ChevronLeft
            className={cn(
              'h-3 w-3 transition-transform',
              isCollapsed && 'rotate-180'
            )}
          />
        </Button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 pt-8 lg:pt-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-foreground')} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={cn(
                        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                        isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Version info */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
              <p className="text-xs text-muted-foreground">PrintFlow v1.0.0</p>
              <p className="text-xs text-muted-foreground">Demo Mode</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
