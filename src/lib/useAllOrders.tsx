'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatOrderDateTime } from '@/lib/formatOrderDateTime';
import { useCustomerAuth } from './useCustomerAuth';

export interface DisplayOrderLine {
  id: string;
  kunstwerkId: string | null;
  maatId: string | null;
  materiaalId: string | null;
  prijs: number;
  quantity: number;
}

export interface DisplayOrder {
  id: string;
  date: string;
  time: string;
  description: string;
  lines: DisplayOrderLine[] | null;
}

interface RealOrder {
  id: string;
  date: Date | null;
  lineCount: number;
  totalQuantity: number;
  lines: DisplayOrderLine[];
}

export interface UseAllOrdersResult {
  orders: DisplayOrder[];
  loadError: boolean;
}

export function useAllOrders(): UseAllOrdersResult {
  const tAccount = useTranslations('accountPage');
  const { user } = useCustomerAuth();
  const [realOrders, setRealOrders] = useState<RealOrder[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user) {
      setRealOrders([]);
      setLoadError(false);
      return;
    }
    let cancelled = false;
    async function loadRealOrders() {
      setLoadError(false);
      try {
        const headersSnapshot = await getDocs(
          query(collection(db, 'bestelheaders'), where('klantId', '==', user!.uid))
        );
        const orders = await Promise.all(
          headersSnapshot.docs.map(async (headerDoc) => {
            const linesSnapshot = await getDocs(
              collection(db, 'bestelheaders', headerDoc.id, 'bestellines')
            );
            const lines: DisplayOrderLine[] = linesSnapshot.docs.map((lineDoc) => {
              const lineData = lineDoc.data();
              return {
                id: lineDoc.id,
                kunstwerkId: lineData.kunstwerkId ?? null,
                maatId: lineData.maatId ?? null,
                materiaalId: lineData.materiaalId ?? null,
                prijs: lineData.prijs ?? 0,
                quantity: lineData.quantity ?? 0,
              };
            });
            const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
            const data = headerDoc.data();
            return {
              id: data.bestelnr ?? headerDoc.id,
              date: data.besteldatum?.toDate() ?? null,
              lineCount: lines.length,
              totalQuantity,
              lines,
            };
          })
        );
        if (!cancelled) {
          setRealOrders(orders);
        }
      } catch {
        if (!cancelled) {
          setRealOrders([]);
          setLoadError(true);
        }
      }
    }
    loadRealOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const orders = useMemo(() => {
    return realOrders.map((order) => {
      const { date, time } = order.date
        ? formatOrderDateTime(order.date)
        : { date: '', time: '' };
      return {
        id: order.id,
        date,
        time,
        description: tAccount('orders.lineSummary', {
          lines: order.lineCount,
          quantity: order.totalQuantity,
        }),
        lines: order.lines,
      };
    });
  }, [realOrders, tAccount]);

  return useMemo(() => ({ orders, loadError }), [orders, loadError]);
}
