import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api';

interface Session {
  token: string;
  user: api.User;
}

interface AuthContextValue {
  user: api.User | null;
  isAuthenticated: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  const signOut = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(signOut);
  }, [signOut]);

  const signIn = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    api.setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    setSession({ token, user });
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, isAuthenticated: !!session, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
