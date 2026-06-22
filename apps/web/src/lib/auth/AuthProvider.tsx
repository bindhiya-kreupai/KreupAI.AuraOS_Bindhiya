'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CurrentUser {
  userId: string;
  email: string;
  tenantId: string;
  sessionId: string | null;
  // Temporary alias — until the Employee model lands, employeeId === userId.
  // Interns: read `employeeId` from this object instead of hardcoding 'EMP001'.
  employeeId: string;
}

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<CurrentUser | null> {
  const res = await fetch('/api/v1/me', {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Failed to load session (${res.status})`);

  const body = await res.json();
  return body?.data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await fetchMe();
      setUser(me);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } finally {
      setUser(null);
      // Hard redirect so any in-memory React Query / Zustand state is dropped.
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, refresh, logout }),
    [user, loading, error, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns the currently authenticated user, or `null` while loading /
 * unauthenticated. Components should guard on `loading` before assuming
 * `user` is populated.
 *
 * @example
 * const { user, loading } = useCurrentUser();
 * if (loading) return <Spinner />;
 * if (!user) return <RedirectToLogin />;
 * await fetch(`/api/foo?employeeId=${user.employeeId}`);
 */
export function useCurrentUser(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useCurrentUser must be used inside <AuthProvider>');
  }
  return ctx;
}
