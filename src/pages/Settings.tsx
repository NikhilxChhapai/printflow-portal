import React, { useState } from 'react';
import { Sun, Moon, AlertTriangle, Link, Key, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [wooSettings, setWooSettings] = useState({
    siteUrl: '',
    consumerKey: '',
    consumerSecret: '',
  });

  const handleSaveWooSettings = () => {
    // In demo mode, just show a toast
    toast({
      title: 'Settings saved (Demo)',
      description: 'In production, these would be stored securely on the backend.',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and integrations
        </p>
      </div>

      {/* Theme Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-warning" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* WooCommerce Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            <CardTitle>WooCommerce Connection</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">Security Notice</p>
                <p className="text-sm">
                  Do not place production API keys in frontend. Use a backend service (Cloud Function) to hold keys and perform sync.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Connect to your WooCommerce store for automatic order sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="border-warning/50 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Demo Mode Warning</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              This is a frontend-only demo. Never store real API credentials in the browser.
              In production, use Firebase Cloud Functions to securely handle WooCommerce API calls.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={wooSettings.siteUrl}
                onChange={(e) => setWooSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                placeholder="https://your-store.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <Input
                id="consumerKey"
                value={wooSettings.consumerKey}
                onChange={(e) => setWooSettings(prev => ({ ...prev, consumerKey: e.target.value }))}
                placeholder="ck_xxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumerSecret">Consumer Secret</Label>
              <Input
                id="consumerSecret"
                type="password"
                value={wooSettings.consumerSecret}
                onChange={(e) => setWooSettings(prev => ({ ...prev, consumerSecret: e.target.value }))}
                placeholder="cs_xxxxxxxxxxxxxxxx"
              />
            </div>
          </div>

          <Button onClick={handleSaveWooSettings} disabled>
            Save Settings (Disabled in Demo)
          </Button>

          {/* Production Setup Instructions */}
          <div className="rounded-xl border border-border p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-4 w-4 text-primary" />
              <p className="font-medium text-foreground">Production Setup Steps</p>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Create WooCommerce REST API keys (Read permissions) in your store's settings</li>
              <li>Deploy a Firebase Cloud Function that uses the keys to fetch orders</li>
              <li>Store API keys in Cloud Function environment variables</li>
              <li>Create a secure endpoint <code className="text-primary">/sync-woo</code> that the frontend can call</li>
              <li>Optionally, set up a Cloud Scheduler to run sync automatically</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="font-medium text-foreground">Demo (Frontend Only)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium text-muted-foreground">Not Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
