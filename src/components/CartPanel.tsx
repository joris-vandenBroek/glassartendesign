'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/useCart';
import { useOrders } from '@/lib/useOrders';

export function CartPanel() {
  const t = useTranslations('cart');
  const tSegments = useTranslations('segments');
  const [isOpen, setIsOpen] = useState(false);
  const { items, isHydrated, totalQuantity, removeItem, clear } = useCart();
  const { placeOrder } = useOrders();

  function handlePlaceOrder() {
    const description = items
      .map(
        (item) => `${tSegments(`${item.segmentMessageKey}.title`)} ${item.size} ×${item.quantity}`
      )
      .join(', ');
    placeOrder(description, t('requestedStatus'));
    clear();
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="cart-icon"
        aria-label={t('title')}
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 hover:text-white"
      >
        <span aria-hidden="true">🛒</span>
        {isHydrated && totalQuantity > 0 && (
          <span
            data-testid="cart-badge"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-silver px-1 text-[0.6rem] font-semibold text-ink"
          >
            {totalQuantity}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="cart-panel"
          className="absolute right-0 top-full mt-2 w-80 rounded-md border border-white/10 bg-black/90 p-3"
        >
          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
            {t('title')}
          </p>
          {items.length === 0 ? (
            <p data-testid="cart-empty" className="text-xs text-white/60">
              {t('empty')}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  data-testid={`cart-item-${item.id}`}
                  className="flex gap-2 text-xs text-white/80"
                >
                  <img src={item.imageSrc} alt="" className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1">
                    <p>{tSegments(`${item.segmentMessageKey}.title`)}</p>
                    <p className="text-white/50">
                      {item.size} · ×{item.quantity}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-testid={`cart-item-remove-${item.id}`}
                    onClick={() => removeItem(item.id)}
                    aria-label={t('remove')}
                    className="text-white/50 hover:text-white"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            data-testid="cart-place-order"
            disabled={items.length === 0}
            onClick={handlePlaceOrder}
            className="mt-3 w-full rounded-sm bg-silver px-3 py-1.5 text-xs tracking-wide text-ink disabled:opacity-40"
          >
            {t('placeOrder')}
          </button>
        </div>
      )}
    </div>
  );
}
