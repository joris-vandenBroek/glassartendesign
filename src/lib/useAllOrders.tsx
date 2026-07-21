'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOCK_ORDERS } from '@/data/mockOrders';
import { useOrders } from './useOrders';
import { useReturns } from './useReturns';
import { useCustomerAuth } from './useCustomerAuth';

export interface DisplayOrder {
  id: string;
  date: string;
  description: string;
  status: string;
  hasReturnRequest: boolean;
}

interface RealOrder {
  id: string;
  date: string;
  status: string;
  lineCount: number;
  totalQuantity: number;
}

export function useAllOrders(): DisplayOrder[] {
  const tOrders = useTranslations('orders');
  const tAccount = useTranslations('accountPage');
  const { placedOrders } = useOrders();
  const { returnsByOrderId } = useReturns();
  const { user } = useCustomerAuth();
  const [realOrders, setRealOrders] = useState<RealOrder[]>([]);

  useEffect(() => {
    if (!user) {
      setRealOrders([]);
      return;
    }
    let cancelled = false;
    async function loadRealOrders() {
      try {
        const headersSnapshot = await getDocs(
          query(collection(db, 'bestelheaders'), where('klantId', '==', user!.uid))
        );
        const orders = await Promise.all(
          headersSnapshot.docs.map(async (headerDoc) => {
            const linesSnapshot = await getDocs(
              collection(db, 'bestelheaders', headerDoc.id, 'bestellines')
            );
            const totalQuantity = linesSnapshot.docs.reduce(
              (sum, lineDoc) => sum + (lineDoc.data().quantity ?? 0),
              0
            );
            const data = headerDoc.data();
            return {
              id: headerDoc.id,
              date: data.besteldatum?.toDate().toISOString().slice(0, 10) ?? '',
              status: data.status,
              lineCount: linesSnapshot.docs.length,
              totalQuantity,
            };
          })
        );
        if (!cancelled) {
          setRealOrders(orders);
        }
      } catch {
        if (!cancelled) {
          setRealOrders([]);
        }
      }
    }
    loadRealOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return useMemo(() => {
    const statusLabels: Record<string, string> = {
      'Te beoordelen': tAccount('orders.statusTeBeoordelen'),
      Goedgekeurd: tAccount('orders.statusGoedgekeurd'),
      Afgewezen: tAccount('orders.statusAfgewezen'),
    };

    const real: DisplayOrder[] = realOrders.map((order) => ({
      id: order.id,
      date: order.date,
      description: tAccount('orders.lineSummary', {
        lines: order.lineCount,
        quantity: order.totalQuantity,
      }),
      status: statusLabels[order.status] ?? order.status,
      hasReturnRequest: false,
    }));

    const placed: DisplayOrder[] = placedOrders.map((order) => ({
      id: order.id,
      date: order.date,
      description: order.description,
      status: order.status,
      hasReturnRequest: false,
    }));

    const seeded: DisplayOrder[] = MOCK_ORDERS.map((order) => ({
      id: order.id,
      date: order.date,
      description: tOrders(`items.${order.messageKey}.description`),
      status: tOrders(`items.${order.messageKey}.status`),
      hasReturnRequest: false,
    }));

    return [...real, ...placed, ...seeded].map((order) => {
      const hasReturnRequest = Boolean(returnsByOrderId[order.id]);
      return {
        ...order,
        status: hasReturnRequest ? tAccount('returns.statusRegistered') : order.status,
        hasReturnRequest,
      };
    });
  }, [realOrders, placedOrders, returnsByOrderId, tOrders, tAccount]);
}
