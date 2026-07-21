'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Modal } from '@/components/Modal';
import type { Bestelling } from './BestellingenSection';

interface BestellingModalProps {
  bestelling: Bestelling | null;
  onClose: () => void;
  onUpdated: (bestelling: Bestelling) => void;
}

export function BestellingModal({ bestelling, onClose, onUpdated }: BestellingModalProps) {
  const t = useTranslations('beheer');
  const [error, setError] = useState<string | null>(null);

  async function handleGoedkeuren() {
    if (!bestelling) return;
    try {
      await updateDoc(doc(db, 'bestelheaders', bestelling.id), { status: 'Goedgekeurd' });
      onUpdated({ ...bestelling, status: 'Goedgekeurd' });
    } catch {
      setError(t('bestellingenActionError'));
    }
  }

  async function handleAfwijzen() {
    if (!bestelling) return;
    try {
      await updateDoc(doc(db, 'bestelheaders', bestelling.id), { status: 'Afgewezen' });
      onUpdated({ ...bestelling, status: 'Afgewezen' });
    } catch {
      setError(t('bestellingenActionError'));
    }
  }

  return (
    <Modal isOpen={bestelling !== null} onClose={onClose} closeLabel={t('modalClose')}>
      {bestelling && (
        <div data-testid="bestelling-modal" className="flex flex-col gap-3 text-sm text-white/80">
          <p>{bestelling.companyName}</p>
          <p className="text-white/60">{bestelling.besteldatum}</p>

          <ul className="flex flex-col gap-1 text-xs">
            {bestelling.lines.map((line) => (
              <li
                key={line.id}
                data-testid={`bestelling-modal-line-${line.id}`}
                className="flex justify-between"
              >
                <span>{line.kunstwerkId ?? t('bestellingenRegelOnbekend')}</span>
                <span>×{line.quantity}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p data-testid="bestelling-modal-error" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGoedkeuren}
              data-testid="bestelling-modal-goedkeuren"
              className="rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink"
            >
              {t('bestellingenGoedkeuren')}
            </button>
            <button
              type="button"
              onClick={handleAfwijzen}
              data-testid="bestelling-modal-afwijzen"
              className="rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white"
            >
              {t('bestellingenAfwijzen')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
