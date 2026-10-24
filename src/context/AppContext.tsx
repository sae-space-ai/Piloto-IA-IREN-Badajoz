import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, Notification as AppNotification } from '../types';
import { getCurrentUser, setCurrentUser, addAuditLog, hasGdprConsent, setGdprConsent } from '../services/storage';

interface AppState {
  user: User | null;
  notifications: AppNotification[];
  gdprAccepted: boolean;
  login: (user: User) => void;
  logout: () => void;
  addNotification: (type: AppNotification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  acceptGdpr: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setGdprAccepted(hasGdprConsent());
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
    setCurrentUser(u);
    addAuditLog(u.id, u.name, 'LOGIN', 'auth', u.id, `Inicio de sesión: ${u.email}`);
  }, []);

  const logout = useCallback(() => {
    if (user) {
      addAuditLog(user.id, user.name, 'LOGOUT', 'auth', user.id, `Cierre de sesión: ${user.email}`);
    }
    setUser(null);
    setCurrentUser(null);
  }, [user]);

  const addNotification = useCallback((type: AppNotification['type'], message: string) => {
    const n: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [...prev, n]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const acceptGdpr = useCallback(() => {
    setGdprConsent(true);
    setGdprAccepted(true);
    if (user) {
      addAuditLog(user.id, user.name, 'GDPR_CONSENT', 'compliance', user.id, 'Consentimiento RGPD aceptado');
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        notifications,
        gdprAccepted,
        login,
        logout,
        addNotification,
        removeNotification,
        acceptGdpr,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
