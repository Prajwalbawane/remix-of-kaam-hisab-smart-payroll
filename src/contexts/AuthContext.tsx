import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, setAuthToken } from '@/services/api';

export type UserRole = 'owner' | 'worker';

export interface ApiUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  worker_id?: string;
}

interface AuthContextType {
  user: ApiUser | null;
  isLoggedIn: boolean;
  isOwner: boolean;
  isWorker: boolean;
  isLoading: boolean;
  error: string | null;
  register: (name: string, phone: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(() => {
    const stored = localStorage.getItem('kaam-hisab-api-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('kaam-hisab-api-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kaam-hisab-api-user');
    }
  }, [user]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('kaam-hisab-token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await authApi.me();
        setUser(response.user);
      } catch (err) {
        // Token invalid or expired
        setAuthToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = useCallback(async (
    name: string,
    phone: string,
    password: string,
    role: UserRole
  ) => {
    setError(null);
    try {
      const response = await authApi.register({ name, phone, password, role });
      setAuthToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    setError(null);
    try {
      const response = await authApi.login(phone, password);
      setAuthToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const isLoggedIn = !!user;
  const isOwner = user?.role === 'owner';
  const isWorker = user?.role === 'worker';

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isOwner,
      isWorker,
      isLoading,
      error,
      register,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
