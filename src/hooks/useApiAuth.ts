import { useState, useEffect, useCallback } from 'react';
import { authApi, setAuthToken } from '@/services/api';
import { useLocalStorage } from './useLocalStorage';

export type UserRole = 'owner' | 'worker';

export interface ApiUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  worker_id?: string;
}

export function useApiAuth() {
  const [user, setUser] = useLocalStorage<ApiUser | null>('kaam-hisab-api-user', null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [setUser]);

  const register = useCallback(async (
    name: string,
    phone: string,
    password: string,
    role: 'owner' | 'worker'
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.register({ name, phone, password, role });
      setAuthToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const login = useCallback(async (phone: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login(phone, password);
      setAuthToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, [setUser]);

  const isLoggedIn = !!user;
  const isOwner = user?.role === 'owner';
  const isWorker = user?.role === 'worker';

  return {
    user,
    isLoggedIn,
    isOwner,
    isWorker,
    isLoading,
    error,
    register,
    login,
    logout,
  };
}
