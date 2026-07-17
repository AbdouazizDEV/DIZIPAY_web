import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MerchantSession } from '../../domain/entities/MerchantSession';
import {
  getServices,
  setUnauthorizedHandler,
} from '../../infrastructure/repositories/container';

interface AuthContextValue {
  session: MerchantSession | null;
  isAuthenticated: boolean;
  setSession: (session: MerchantSession) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { sessionStorage } = getServices();
  const [session, setSessionState] = useState<MerchantSession | null>(() =>
    sessionStorage.get(),
  );

  const clearSession = useCallback(() => {
    sessionStorage.clear();
    setSessionState(null);
  }, [sessionStorage]);

  const setSession = useCallback(
    (next: MerchantSession) => {
      sessionStorage.set(next);
      setSessionState(next);
    },
    [sessionStorage],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      setSession,
      clearSession,
    }),
    [session, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}
