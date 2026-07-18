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

const STORAGE_KEY = 'glassart-mock-logged-in';

interface MockAuthValue {
  isLoggedIn: boolean;
  isHydrated: boolean;
  login: () => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsLoggedIn(window.localStorage.getItem(STORAGE_KEY) === 'true');
    setIsHydrated(true);
  }, []);

  const login = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, isHydrated, login, logout }),
    [isLoggedIn, isHydrated, login, logout]
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
