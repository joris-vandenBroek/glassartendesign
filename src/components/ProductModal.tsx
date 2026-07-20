'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { STANDARD_SIZES } from '@/data/sizes';
import { useCart } from '@/lib/useCart';
import type { SegmentImage } from '@/data/segments';

const CONFIRM_FEEDBACK_MS = 600;

interface ProductModalProps {
  image: SegmentImage | null;
  onClose: () => void;
}

export function ProductModal({ image, onClose }: ProductModalProps) {
  const t = useTranslations('cart');
  const tSegments = useTranslations('segments');
  const [size, setSize] = useState<string>(STANDARD_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { addItem } = useCart();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!image) {
      return;
    }
    setSize(STANDARD_SIZES[0]);
    setQuantity(1);
    setIsConfirmed(false);
  }, [image]);

  // Ensure a pending "close after confirm" timer never fires for a stale
  // product: clear it whenever `image` changes to a different value, and
  // on unmount.
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [image]);

  useEffect(() => {
    if (!image) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  // Move focus into the modal on open and restore it to whatever triggered
  // the modal (e.g. the product card) once this image is no longer shown.
  useEffect(() => {
    if (!image) {
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [image]);

  if (!image) {
    return null;
  }

  function handleConfirm() {
    if (isConfirmed || !image) {
      return;
    }
    addItem({
      segmentSlug: image.segmentSlug,
      segmentMessageKey: image.segmentMessageKey,
      imageSrc: image.src,
      size,
      quantity,
    });
    setIsConfirmed(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
    }, CONFIRM_FEEDBACK_MS);
  }

  return (
    <div
      ref={modalRef}
      data-testid="product-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        data-testid="product-modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div className="relative z-10 grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-lg border border-white/10 bg-charcoal sm:grid-cols-2">
        <button
          ref={closeButtonRef}
          type="button"
          data-testid="product-modal-close"
          aria-label={t('close')}
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white"
        >
          ×
        </button>
        <img
          src={image.src}
          alt={tSegments(`${image.segmentMessageKey}.title`)}
          className="h-56 w-full object-cover sm:h-full"
        />
        <div className="flex flex-col gap-4 p-6">
          <p className="font-head text-xs uppercase tracking-[0.2em] text-gold">
            {tSegments(`${image.segmentMessageKey}.title`)}
          </p>
          <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-white/60">
            {t('size')}
            <select
              data-testid="product-modal-size"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="rounded-sm bg-black/40 px-2 py-1.5 text-sm text-white"
            >
              {STANDARD_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center justify-between gap-2 text-sm text-white/80">
            <span className="text-[0.65rem] uppercase tracking-wide text-white/60">
              {t('quantity')}
            </span>
            <div className="flex h-10 items-center overflow-hidden rounded-full border border-white/20">
              <button
                type="button"
                data-testid="product-modal-quantity-minus"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="flex h-full w-9 items-center justify-center text-white/80 transition hover:bg-gold hover:text-ink"
              >
                −
              </button>
              <span data-testid="product-modal-quantity-value" className="w-9 text-center">
                {quantity}
              </span>
              <button
                type="button"
                data-testid="product-modal-quantity-plus"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex h-full w-9 items-center justify-center text-white/80 transition hover:bg-gold hover:text-ink"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            data-testid="product-modal-confirm"
            onClick={handleConfirm}
            disabled={isConfirmed}
            className={`rounded-sm px-4 py-2.5 text-xs tracking-[0.15em] transition ${
              isConfirmed
                ? 'cursor-default bg-green-500 text-white'
                : 'bg-gold text-ink hover:-translate-y-0.5 hover:bg-gold-bright'
            }`}
          >
            {isConfirmed ? t('added') : t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
