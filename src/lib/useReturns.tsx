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

const STORAGE_KEY = 'glassart-returns';

export interface ReturnRequest {
  reason: string;
  note: string;
  date: string;
}

interface ReturnsValue {
  returnsByOrderId: Record<string, ReturnRequest>;
  isHydrated: boolean;
  registerReturn: (orderId: string, reason: string, note: string) => void;
}

const ReturnsContext = createContext<ReturnsValue | null>(null);

export function ReturnsProvider({ children }: { children: ReactNode }) {
  const [returnsByOrderId, setReturnsByOrderId] = useState<Record<string, ReturnRequest>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReturnsByOrderId(JSON.parse(stored));
      } catch {
        setReturnsByOrderId({});
      }
    }
    setIsHydrated(true);
  }, []);

  const registerReturn = useCallback((orderId: string, reason: string, note: string) => {
    setReturnsByOrderId((current) => {
      const next = {
        ...current,
        [orderId]: { reason, note, date: new Date().toISOString().slice(0, 10) },
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ returnsByOrderId, isHydrated, registerReturn }),
    [returnsByOrderId, isHydrated, registerReturn]
  );

  return <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>;
}

export function useReturns(): ReturnsValue {
  const context = useContext(ReturnsContext);
  if (!context) {
    throw new Error('useReturns must be used within a ReturnsProvider');
  }
  return context;
}
