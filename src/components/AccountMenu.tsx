'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MOCK_ORDERS } from '@/data/mockOrders';
import { useMockAuth } from '@/lib/useMockAuth';
import { useOrders } from '@/lib/useOrders';

export function AccountMenu() {
  const t = useTranslations('nav');
  const tOrders = useTranslations('orders');
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useMockAuth();
  const { placedOrders } = useOrders();

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="account-icon"
        aria-label={t('myOrders')}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-silver text-xs font-semibold text-ink"
      >
        GD
      </button>
      {isOpen && (
        <div
          data-testid="order-history-panel"
          className="absolute right-0 top-full mt-2 w-72 rounded-md border border-white/10 bg-black/90 p-3"
        >
          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
            {t('myOrders')}
          </p>
          <ul className="flex flex-col gap-3">
            {placedOrders.map((order) => (
              <li
                key={order.id}
                data-testid={`order-${order.id}`}
                className="text-xs text-white/80"
              >
                <div className="flex items-center justify-between">
                  <span>{order.id}</span>
                  <span className="text-white/50">{order.date}</span>
                </div>
                <p>{order.description}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-white/50">{order.status}</span>
                </div>
              </li>
            ))}
            {MOCK_ORDERS.map((order) => (
              <li key={order.id} data-testid={`order-${order.id}`} className="text-xs text-white/80">
                <div className="flex items-center justify-between">
                  <span>{order.id}</span>
                  <span className="text-white/50">{order.date}</span>
                </div>
                <p>{tOrders(`items.${order.messageKey}.description`)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-white/50">
                    {tOrders(`items.${order.messageKey}.status`)}
                  </span>
                  <button
                    type="button"
                    data-testid={`reorder-${order.id}`}
                    className="rounded-sm border border-white/20 px-2 py-1 text-[0.65rem] tracking-wide hover:bg-white/10"
                  >
                    {tOrders('reorder')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            data-testid="nav-logout"
            onClick={logout}
            className="mt-3 w-full rounded-sm border border-white/20 py-1.5 text-xs tracking-wide hover:bg-white/10"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
