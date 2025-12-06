import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((role: UserRole) => {
    // Find a mock user with the selected role
    const matchingUser = mockUsers.find(u => u.role === role) || {
      id: `demo-${role}`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@printco.com`,
      role,
      department: role.charAt(0).toUpperCase() + role.slice(1),
    };
    
    setUser(matchingUser);
    localStorage.setItem('currentUser', JSON.stringify(matchingUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const hasPermission = useCallback((allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
