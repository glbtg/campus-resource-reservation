import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LoginUser } from '../types';

interface AuthState {
  user: LoginUser | null;
  token: string | null;
  setAuth: (user: LoginUser, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

function loadUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadToken(): string | null {
  return localStorage.getItem('token');
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(loadUser);
  const [token, setToken] = useState<string | null>(loadToken);

  const setAuth = useCallback((u: LoginUser, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      setAuth,
      logout,
      isAdmin: user?.role === 'ADMIN',
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
