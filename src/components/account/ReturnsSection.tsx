'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useAllOrders } from '@/lib/useAllOrders';
import { useReturns } from '@/lib/useReturns';

const REASON_KEYS = [
  'reasonDamaged',
  'reasonNotAsExpected',
  'reasonWrongOrder',
  'reasonOther',
] as const;

export function ReturnsSection() {
  const t = useTranslations('accountPage.returns');
  const orders = useAllOrders();
  const { returnsByOrderId, registerReturn } = useReturns();
  const eligibleOrders = orders.filter((order) => !order.hasReturnRequest);
  const registeredOrders = orders.filter((order) => order.hasReturnRequest);

  const [selectedOrderId, setSelectedOrderId] = useState(eligibleOrders[0]?.id ?? '');
  const [reason, setReason] = useState<(typeof REASON_KEYS)[number]>('reasonDamaged');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!eligibleOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(eligibleOrders[0]?.id ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleOrders.map((order) => order.id).join(',')]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerReturn(selectedOrderId, t(reason), note);
    setIsSubmitted(true);
    setNote('');
  }

  return (
    <div data-testid="returns-section">
      {isSubmitted && (
        <p data-testid="returns-confirmation" className="mb-3 text-xs text-white">
          {t('confirmationTitle')} — {t('confirmationMessage')}
        </p>
      )}

      {eligibleOrders.length === 0 ? (
        <p data-testid="returns-no-eligible" className="text-xs text-white/60">
          {t('noEligibleOrders')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs text-white/80">
          <label className="flex flex-col gap-1 uppercase tracking-wide text-white/60">
            {t('selectOrderLabel')}
            <select
              data-testid="returns-order-select"
              value={selectedOrderId}
              onChange={(event) => setSelectedOrderId(event.target.value)}
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            >
              {eligibleOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} — {order.description}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 uppercase tracking-wide text-white/60">
            {t('reasonLabel')}
            <select
              data-testid="returns-reason-select"
              value={reason}
              onChange={(event) => setReason(event.target.value as (typeof REASON_KEYS)[number])}
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            >
              {REASON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(key)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 uppercase tracking-wide text-white/60">
            {t('noteLabel')}
            <textarea
              data-testid="returns-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>

          <button
            type="submit"
            data-testid="returns-submit"
            className="mt-2 rounded-sm bg-silver px-4 py-2.5 text-xs tracking-[0.15em] text-ink"
          >
            {t('submit')}
          </button>
        </form>
      )}

      {registeredOrders.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
            {t('existingReturnsTitle')}
          </p>
          <ul className="flex flex-col gap-2">
            {registeredOrders.map((order) => (
              <li
                key={order.id}
                data-testid={`return-registered-${order.id}`}
                className="text-xs text-white/80"
              >
                <div className="flex items-center justify-between">
                  <span>{order.id}</span>
                  <span className="text-white/50">{returnsByOrderId[order.id]?.date}</span>
                </div>
                <p className="text-white/50">{returnsByOrderId[order.id]?.reason}</p>
                {returnsByOrderId[order.id]?.note && <p>{returnsByOrderId[order.id]?.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
