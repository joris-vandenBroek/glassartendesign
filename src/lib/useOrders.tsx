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

const STORAGE_KEY = 'glassart-placed-orders';

export interface PlacedOrder {
  id: string;
  date: string;
  description: string;
  status: string;
}

interface OrdersValue {
  placedOrders: PlacedOrder[];
  isHydrated: boolean;
  placeOrder: (description: string, status: string) => void;
}

const OrdersContext = createContext<OrdersValue | null>(null);

function generateOrderId(): string {
  const suffix = Math.floor(10000 + Math.random() * 89999);
  return `GD-${suffix}`;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPlacedOrders(JSON.parse(stored));
      } catch {
        setPlacedOrders([]);
      }
    }
    setIsHydrated(true);
  }, []);

  const placeOrder = useCallback((description: string, status: string) => {
    setPlacedOrders((current) => {
      const next = [
        {
          id: generateOrderId(),
          date: new Date().toISOString().slice(0, 10),
          description,
          status,
        },
        ...current,
      ];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ placedOrders, isHydrated, placeOrder }),
    [placedOrders, isHydrated, placeOrder]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
