import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export const DEMO_USER: User = {
  id: 'usr_admin_demo',
  name: 'Admin Developer',
  email: 'admin@railsjobflow.io',
  role: 'Principal System Engineer',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('railsjobflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('railsjobflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('railsjobflow_user');
    }
  }, [user]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock authentication verifying basic presence
    if (email.trim()) {
      const authenticatedUser: User = {
        ...DEMO_USER,
        email: email.trim(),
        name: email.split('@')[0] || 'System Operator',
      };
      setUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const loginAsDemo = async (): Promise<boolean> => {
    setUser(DEMO_USER);
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('railsjobflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
