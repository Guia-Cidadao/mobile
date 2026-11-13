import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { setAuthToken, setSessionExpiredHandler } from '@/services/api/httpClient';
import { authService } from '@/services/authService';
import { sessionStore } from '@/services/storage/sessionStore';
import type { LoginCredentials, Session } from '@/types/auth';
import type { User, UserPayload } from '@/types/user';
import { isTokenExpired } from '@/utils/jwt';

import { useToast } from './ToastContext';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRestoring: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (payload: UserPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateSessionUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provedor de autenticação e sessão do usuário.
 * Sincroniza o token JWT com o `httpClient` e persiste a sessão no `SecureStore`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const { showToast } = useToast();

  const applySession = useCallback(async (nextSession: Session | null) => {
    sessionRef.current = nextSession;
    setAuthToken(nextSession?.token ?? null);
    setSession(nextSession);
    if (nextSession) {
      await sessionStore.save(nextSession);
    } else {
      await sessionStore.clear();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const stored = await sessionStore.load();
        if (!isMounted) {
          return;
        }
        if (stored && !isTokenExpired(stored.token)) {
          sessionRef.current = stored;
          setAuthToken(stored.token);
          setSession(stored);
        } else if (stored) {
          await sessionStore.clear();
        }
      } finally {
        if (isMounted) {
          setIsRestoring(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void applySession(null);
      showToast('Sua sessão expirou. Faça login novamente.', 'info');
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, [applySession, showToast]);

  const signIn = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await authService.login({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });
      await applySession({ token: response.token, user: response.user });
    },
    [applySession],
  );

  const signUp = useCallback(
    async (payload: UserPayload) => {
      const normalizedEmail = payload.email.trim().toLowerCase();
      await authService.register({
        nome: payload.nome.trim(),
        email: normalizedEmail,
        senha: payload.senha,
      });
      const response = await authService.login({
        email: normalizedEmail,
        password: payload.senha,
      });
      await applySession({ token: response.token, user: response.user });
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    await applySession(null);
  }, [applySession]);

  const updateSessionUser = useCallback(
    async (updatedUser: User) => {
      const currentSession = sessionRef.current;
      if (!currentSession) {
        return;
      }
      const current = currentSession.user;
      if (
        current.id === updatedUser.id &&
        current.nome === updatedUser.nome &&
        current.email === updatedUser.email &&
        current.role === updatedUser.role
      ) {
        return;
      }
      await applySession({ token: currentSession.token, user: updatedUser });
    },
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isAdmin: session?.user.role === 'ROLE_ADMIN',
      isRestoring,
      signIn,
      signUp,
      signOut,
      updateSessionUser,
    }),
    [session, isRestoring, signIn, signUp, signOut, updateSessionUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider />');
  }
  return context;
}
