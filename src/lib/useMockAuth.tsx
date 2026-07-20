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

const LOGGED_IN_KEY = 'glassart-mock-logged-in';
const EMAIL_KEY = 'glassart-mock-email';
const UID_KEY = 'glassart-mock-uid';

interface MockAuthValue {
  isLoggedIn: boolean;
  isHydrated: boolean;
  email: string | null;
  uid: string | null;
  login: (email: string, uid: string) => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsLoggedIn(window.localStorage.getItem(LOGGED_IN_KEY) === 'true');
    setEmail(window.localStorage.getItem(EMAIL_KEY));
    setUid(window.localStorage.getItem(UID_KEY));
    setIsHydrated(true);
  }, []);

  const login = useCallback((newEmail: string, newUid: string) => {
    window.localStorage.setItem(LOGGED_IN_KEY, 'true');
    window.localStorage.setItem(EMAIL_KEY, newEmail);
    window.localStorage.setItem(UID_KEY, newUid);
    setIsLoggedIn(true);
    setEmail(newEmail);
    setUid(newUid);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(LOGGED_IN_KEY);
    window.localStorage.removeItem(EMAIL_KEY);
    window.localStorage.removeItem(UID_KEY);
    setIsLoggedIn(false);
    setEmail(null);
    setUid(null);
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, isHydrated, email, uid, login, logout }),
    [isLoggedIn, isHydrated, email, uid, login, logout]
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth(): MockAuthValue {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}
