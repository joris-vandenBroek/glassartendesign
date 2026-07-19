'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { MOCK_ORDERS } from '@/data/mockOrders';
import { useOrders } from './useOrders';
import { useReturns } from './useReturns';

export interface DisplayOrder {
  id: string;
  date: string;
  description: string;
  status: string;
  hasReturnRequest: boolean;
}

export function useAllOrders(): DisplayOrder[] {
  const tOrders = useTranslations('orders');
  const tAccount = useTranslations('accountPage');
  const { placedOrders } = useOrders();
  const { returnsByOrderId } = useReturns();

  return useMemo(() => {
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

    return [...placed, ...seeded].map((order) => {
      const hasReturnRequest = Boolean(returnsByOrderId[order.id]);
      return {
        ...order,
        status: hasReturnRequest ? tAccount('returns.statusRegistered') : order.status,
        hasReturnRequest,
      };
    });
  }, [placedOrders, returnsByOrderId, tOrders, tAccount]);
}
