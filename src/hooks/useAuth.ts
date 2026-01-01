import { useLocalStorage } from './useLocalStorage';

export type UserRole = 'owner' | 'worker';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  workerId?: string; // For worker role - links to their worker profile
}

export function useAuth() {
  const [user, setUser] = useLocalStorage<AuthUser | null>('kaam-hisab-user', null);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('kaam-hisab-logged-in', false);

  const loginAsOwner = (name: string, phone: string) => {
    const newUser: AuthUser = {
      id: `owner-${Date.now()}`,
      name,
      phone,
      role: 'owner',
    };
    setUser(newUser);
    setIsLoggedIn(true);
    return newUser;
  };

  const loginAsWorker = (name: string, phone: string, workerId: string) => {
    const newUser: AuthUser = {
      id: `worker-${Date.now()}`,
      name,
      phone,
      role: 'worker',
      workerId,
    };
    setUser(newUser);
    setIsLoggedIn(true);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const isOwner = user?.role === 'owner';
  const isWorker = user?.role === 'worker';

  return {
    user,
    isLoggedIn,
    isOwner,
    isWorker,
    loginAsOwner,
    loginAsWorker,
    logout,
  };
}
