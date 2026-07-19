'use client';

import { useTranslations } from 'next-intl';
import { useAllOrders } from '@/lib/useAllOrders';

export function OrdersSection() {
  const t = useTranslations('accountPage');
  const orders = useAllOrders();

  return (
    <div data-testid="orders-section">
      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
        {t('navOrders')}
      </p>
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li
            key={order.id}
            data-testid={`account-order-${order.id}`}
            className="text-xs text-white/80"
          >
            <div className="flex items-center justify-between">
              <span>{order.id}</span>
              <span className="text-white/50">{order.date}</span>
            </div>
            <p>{order.description}</p>
            <p className="mt-1 text-white/50">{order.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
