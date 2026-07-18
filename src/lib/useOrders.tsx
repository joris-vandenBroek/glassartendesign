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

// Known seed order IDs that must not be generated
const SEED_ORDER_IDS = ['GD-10234', 'GD-10221', 'GD-10198', 'GD-10177'];

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

function generateOrderId(existingOrderIds: string[] = []): string {
  const reserved = new Set([...SEED_ORDER_IDS, ...existingOrderIds]);

  // Retry up to 100 times to avoid collisions
  for (let attempt = 0; attempt < 100; attempt++) {
    const suffix = Math.floor(10000 + Math.random() * 89999);
    const candidateId = `GD-${suffix}`;

    if (!reserved.has(candidateId)) {
      return candidateId;
    }
  }

  // Fallback: should almost never happen given the range (90,000 possible IDs)
  throw new Error('Failed to generate unique order ID after 100 attempts');
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
      const currentOrderIds = current.map((order) => order.id);
      const next = [
        {
          id: generateOrderId(currentOrderIds),
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
