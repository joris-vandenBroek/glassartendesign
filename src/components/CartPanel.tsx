'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/lib/useCart';
import { useCustomerAuth } from '@/lib/useCustomerAuth';
import { useOverlayDismiss } from '@/lib/useOverlayDismiss';
import { formatCurrency } from '@/data/mockAdminInvoices';
import { WatermarkedImage } from './WatermarkedImage';
import { Link } from '@/i18n/navigation';

export function CartPanel() {
  const t = useTranslations('cart');
  const [isOpen, setIsOpen] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { items, isHydrated, totalQuantity, totalPrice, removeItem, clear } = useCart();
  const { user, isCustomer } = useCustomerAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    setIsOpen(false);
    setOrderPlaced(false);
  }

  useOverlayDismiss({
    isOpen,
    onClose: handleClose,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
  });

  async function handlePlaceOrder() {
    if (!user) {
      return;
    }
    setPlaceOrderError(null);
    try {
      const headerDoc = await addDoc(collection(db, 'bestelheaders'), {
        klantId: user.uid,
        besteldatum: serverTimestamp(),
        status: 'Te beoordelen',
      });
      await Promise.all(
        items.map((item) =>
          addDoc(collection(db, 'bestelheaders', headerDoc.id, 'bestellines'), {
            kunstwerkId: item.kunstwerkId,
            maatId: item.maatId,
            materiaalId: item.materiaalId,
            prijs: item.prijs,
            quantity: item.quantity,
          })
        )
      );
      clear();
      setOrderPlaced(true);
      if (user.email) {
        void sendConfirmationEmail(user.email);
      }
    } catch {
      setPlaceOrderError(t('placeOrderError'));
    }
  }

  async function sendConfirmationEmail(email: string) {
    const endpoint = process.env.NEXT_PUBLIC_MAIL_ENDPOINT_URL;
    const secret = process.env.NEXT_PUBLIC_MAIL_SECRET;
    if (!endpoint || !secret) {
      return;
    }
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          to: email,
          subject: t('orderEmailSubject'),
          body: t('orderConfirmation'),
        }),
      });
    } catch {
      // Best-effort only -- the order itself already succeeded via Firestore.
    }
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

      {isOpen &&
        createPortal(
          <>
            <div
              data-testid="cart-backdrop"
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <div
              ref={panelRef}
              data-testid="cart-panel"
              role="dialog"
              aria-modal="true"
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[400px] flex-col border-l border-white/10 bg-charcoal"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="font-head text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
                  {t('title')}
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  data-testid="cart-close"
                  aria-label={t('close')}
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {orderPlaced ? (
                  <p data-testid="cart-order-confirmation" className="text-center text-xs text-white/80">
                    {t('orderConfirmation')}
                  </p>
                ) : items.length === 0 ? (
                  <p data-testid="cart-empty" className="text-center text-xs text-white/60">
                    {t('empty')}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        data-testid={`cart-item-${item.id}`}
                        className="flex gap-3 rounded-md border border-white/10 bg-graphite/60 p-3 text-xs text-white/80"
                      >
                        <WatermarkedImage src={item.foto} alt="" className="h-12 w-12 rounded" />
                        <div className="flex-1">
                          <p>{item.omschrijving}</p>
                          <p className="text-white/50">
                            {item.materiaalLabel} · {item.maatLabel} · ×{item.quantity}
                          </p>
                          <p className="text-white/50">{formatCurrency(item.prijs * item.quantity)}</p>
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
              </div>

              {!orderPlaced && (
                <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4">
                  {items.length > 0 && (
                    <p data-testid="cart-total" className="flex justify-between text-sm text-white/80">
                      <span>{t('total')}</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </p>
                  )}
                  {isCustomer ? (
                    <button
                      type="button"
                      data-testid="cart-place-order"
                      disabled={items.length === 0}
                      onClick={handlePlaceOrder}
                      className="btn-gold w-full rounded-sm px-3 py-2.5 text-center text-xs font-head tracking-wide disabled:opacity-40"
                    >
                      {t('placeOrder')}
                    </button>
                  ) : (
                    <Link
                      href="/inloggen"
                      data-testid="cart-login-to-order"
                      className="btn-gold block w-full rounded-sm px-3 py-2.5 text-center text-xs font-head tracking-wide"
                    >
                      {t('loginToOrder')}
                    </Link>
                  )}
                  {placeOrderError && (
                    <p data-testid="cart-place-order-error" className="text-center text-xs text-red-400">
                      {placeOrderError}
                    </p>
                  )}
                  <button
                    type="button"
                    data-testid="cart-clear"
                    disabled={items.length === 0}
                    onClick={clear}
                    className="text-xs text-white/50 transition hover:text-red-400 disabled:opacity-40"
                  >
                    {t('clearOrder')}
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
