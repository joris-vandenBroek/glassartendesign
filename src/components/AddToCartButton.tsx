'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { STANDARD_SIZES } from '@/data/sizes';
import { useCart } from '@/lib/useCart';

interface AddToCartButtonProps {
  segmentSlug: string;
  segmentMessageKey: string;
  imageSrc: string;
}

export function AddToCartButton({
  segmentSlug,
  segmentMessageKey,
  imageSrc,
}: AddToCartButtonProps) {
  const t = useTranslations('cart');
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<string>(STANDARD_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  function handleConfirm() {
    addItem({ segmentSlug, segmentMessageKey, imageSrc, size, quantity });
    setIsOpen(false);
    setQuantity(1);
    setSize(STANDARD_SIZES[0]);
  }

  return (
    <div className="absolute inset-0 flex items-end justify-center opacity-0 transition hover:bg-black/40 hover:opacity-100 focus-within:bg-black/40 focus-within:opacity-100">
      {!isOpen ? (
        <button
          type="button"
          data-testid="add-to-cart-button"
          onClick={() => setIsOpen(true)}
          className="m-2 rounded-sm bg-silver px-3 py-1.5 text-[0.65rem] tracking-wide text-ink"
        >
          {t('addToCart')}
        </button>
      ) : (
        <div
          data-testid="add-to-cart-panel"
          className="m-2 flex w-full max-w-[12rem] flex-col gap-2 rounded-md border border-white/10 bg-black/90 p-3"
        >
          <label className="flex flex-col gap-1 text-[0.6rem] uppercase tracking-wide text-white/60">
            {t('size')}
            <select
              data-testid="add-to-cart-size"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="rounded-sm bg-black/60 px-2 py-1 text-xs text-white"
            >
              {STANDARD_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center justify-between gap-2 text-xs text-white/80">
            <span className="text-[0.6rem] uppercase tracking-wide text-white/60">
              {t('quantity')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="add-to-cart-quantity-minus"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-6 w-6 rounded-full border border-white/20"
              >
                −
              </button>
              <span data-testid="add-to-cart-quantity-value">{quantity}</span>
              <button
                type="button"
                data-testid="add-to-cart-quantity-plus"
                onClick={() => setQuantity((current) => current + 1)}
                className="h-6 w-6 rounded-full border border-white/20"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            data-testid="add-to-cart-confirm"
            onClick={handleConfirm}
            className="rounded-sm bg-silver px-3 py-1.5 text-xs tracking-wide text-ink"
          >
            {t('confirm')}
          </button>
        </div>
      )}
    </div>
  );
}
