import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Users, Palette, FileText, Factory } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/types';
import { Sun, Moon } from 'lucide-react';

const roles: { role: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  {
    role: 'admin',
    label: 'Admin',
    description: 'Full access to all features',
    icon: Users,
  },
  {
    role: 'sales',
    label: 'Sales',
    description: 'Manage orders and clients',
    icon: FileText,
  },
  {
    role: 'design',
    label: 'Design',
    description: 'Handle design tasks',
    icon: Palette,
  },
  {
    role: 'prepress',
    label: 'Prepress',
    description: 'Prepare files for print',
    icon: FileText,
  },
  {
    role: 'production',
    label: 'Production',
    description: 'Manage printing & finishing',
    icon: Factory,
  },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className={`h-5 w-5 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
          <Moon className={`absolute h-5 w-5 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-elevated mb-4">
              <Printer className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">PrintFlow</h1>
            <p className="text-muted-foreground mt-2">Order Management Portal</p>
          </div>

          {/* Role selection card */}
          <Card className="shadow-card border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Demo Login</CardTitle>
              <CardDescription>
                Select a role to explore the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {roles.map(({ role, label, description, icon: Icon }) => (
                  <Button
                    key={role}
                    variant="outline"
                    className="h-auto p-4 justify-start gap-4 hover:bg-accent hover:border-primary/50 transition-all group"
                    onClick={() => handleLogin(role)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demo notice */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            This is a demo. No real authentication is performed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
