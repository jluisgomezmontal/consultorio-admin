'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/auth.service';
import { offlineAuth } from '@/lib/offline-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchUser();
      } else {
        checkOfflineAuth();
      }
    }
  }, []);

  const checkOfflineAuth = async () => {
    try {
      if (!navigator.onLine) {
        const offlineUser = await offlineAuth.getOfflineUser();
        if (offlineUser) {
          setUser(offlineUser as User);
        }
      }
    } catch (error) {
      console.error('Error checking offline auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      
      // Check if user account is active
      if (response.data.isActive === false) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setLoading(false);
        if (typeof window !== 'undefined') {
          window.location.href = '/login?deactivated=true';
        }
        return;
      }
      
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    setUser(response.data.user);
    
    await offlineAuth.saveAuthData(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.user
    );
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      
      await offlineAuth.clearAuthData();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
