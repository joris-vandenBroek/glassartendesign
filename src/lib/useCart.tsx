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

const STORAGE_KEY = 'glassart-cart';

export interface CartItem {
  id: string;
  kunstwerkId: string;
  foto: string;
  omschrijving: string;
  materiaalId: string;
  materiaalLabel: string;
  maatId: string;
  maatLabel: string;
  breedte?: number;
  hoogte?: number;
  prijs: number | null;
  quantity: number;
}

type AddItemInput = Omit<CartItem, 'id'>;

interface CartValue {
  items: CartItem[];
  isHydrated: boolean;
  totalQuantity: number;
  totalPrice: number;
  unpricedLineCount: number;
  addItem: (input: AddItemInput) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

function makeItemId(
  kunstwerkId: string,
  materiaalId: string,
  maatId: string,
  breedte?: number,
  hoogte?: number
): string {
  if (maatId) {
    return `${kunstwerkId}__${materiaalId}__${maatId}`;
  }
  return `${kunstwerkId}__${materiaalId}__custom__${breedte}x${hoogte}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
    setIsHydrated(true);
  }, []);

  const addItem = useCallback((input: AddItemInput) => {
    setItems((current) => {
      const id = makeItemId(input.kunstwerkId, input.materiaalId, input.maatId, input.breedte, input.hoogte);
      const existing = current.find((item) => item.id === id);
      const next = existing
        ? current.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + input.quantity } : item
          )
        : [...current, { id, ...input }];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + (item.prijs ?? 0) * item.quantity, 0),
    [items]
  );

  const unpricedLineCount = useMemo(
    () => items.filter((item) => item.prijs === null).length,
    [items]
  );

  const value = useMemo(
    () => ({ items, isHydrated, totalQuantity, totalPrice, unpricedLineCount, addItem, removeItem, clear }),
    [items, isHydrated, totalQuantity, totalPrice, unpricedLineCount, addItem, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
