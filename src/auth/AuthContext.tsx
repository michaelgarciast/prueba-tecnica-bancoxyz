import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api';

interface Session {
  token: string;
  user: api.User;
}

interface AuthContextValue {
  user: api.User | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const STORAGE_KEY = 'session';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): Session | null {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Session | null;
    api.setToken(session?.token ?? null);
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [sessionExpired, setSessionExpired] = useState(false);

  const signOut = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      signOut();
      setSessionExpired(true);
    });
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    api.setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    setSessionExpired(false);
    setSession({ token, user });
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isAuthenticated: !!session, sessionExpired, signIn, signOut }),
    [session, sessionExpired, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
