import React, { useState } from 'react';
import { User, Mail, Briefcase, Building2, LogOut, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as api from '@/lib/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [onLeave, setOnLeave] = useState(user?.onLeave || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLeaveToggle = async (checked: boolean) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await api.updateUser(user.id, { onLeave: checked });
      setOnLeave(checked);
      toast({
        title: checked ? 'On Leave Enabled' : 'On Leave Disabled',
        description: checked 
          ? 'Your orders will show a warning to other team members.'
          : 'You are now marked as available.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update leave status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-primary text-primary-foreground',
    sales: 'bg-blue-500 text-white',
    design: 'bg-purple-500 text-white',
    prepress: 'bg-cyan-500 text-white',
    production: 'bg-orange-500 text-white',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('capitalize', roleColors[user.role])}>
                  {user.role}
                </Badge>
                {onLeave && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    On Leave
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-foreground">{user.department}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Status */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Leave Status</CardTitle>
          <CardDescription>
            Toggle this when you're on leave. Orders assigned to you will show a warning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="on-leave" className="text-base">On Leave</Label>
              <p className="text-sm text-muted-foreground">
                {onLeave 
                  ? 'You are currently marked as on leave' 
                  : 'You are currently available'}
              </p>
            </div>
            <Switch
              id="on-leave"
              checked={onLeave}
              onCheckedChange={handleLeaveToggle}
              disabled={isUpdating}
            />
          </div>
          {onLeave && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Leave Mode Active</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders assigned to you will display a red warning label. 
                    Team members in your department can click "Take Over" to reassign orders.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <Separator className="mb-6" />
          <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
