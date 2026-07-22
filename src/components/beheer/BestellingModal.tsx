'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Modal } from '@/components/Modal';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Bestelling } from './BestellingenSection';
import type { Kunstwerk, Materiaal, Maat, Materiaalsoort } from './materiaalTypes';

interface BestellingModalProps {
  bestelling: Bestelling | null;
  kunstwerken: Kunstwerk[] | null;
  materialen: Materiaal[] | null;
  maten: Maat[] | null;
  materiaalsoorten: Materiaalsoort[] | null;
  onClose: () => void;
  onUpdated: (bestelling: Bestelling) => void;
}

export function BestellingModal({
  bestelling,
  kunstwerken,
  materialen,
  maten,
  materiaalsoorten,
  onClose,
  onUpdated,
}: BestellingModalProps) {
  const t = useTranslations('beheer');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bestelling) {
      setError(null);
    }
  }, [bestelling]);

  const materiaalsoortNaamById = new Map(
    (materiaalsoorten ?? []).map((soort) => [soort.id, soort.omschrijving])
  );

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

          <ul className="flex flex-col gap-2 text-xs">
            {bestelling.lines.map((line) => {
              const kunstwerk = (kunstwerken ?? []).find((k) => k.id === line.kunstwerkId);
              const materiaal = (materialen ?? []).find((m) => m.id === line.materiaalId);
              const maat = (maten ?? []).find((m) => m.id === line.maatId);
              return (
                <li
                  key={line.id}
                  data-testid={`bestelling-modal-line-${line.id}`}
                  className="flex items-start justify-between gap-3 border-b border-white/10 pb-2 last:border-0"
                >
                  {kunstwerk ? (
                    <div className="flex items-start gap-2">
                      <img src={kunstwerk.foto} alt="" className="h-10 w-10 rounded object-cover" />
                      <div>
                        <p className="text-white/90">{kunstwerk.omschrijvingNl}</p>
                        <p className="text-white/50">
                          <span className="text-white/35">{t('bestellingenModalLabelMateriaal')}: </span>
                          {materiaal
                            ? `${materiaal.materiaaldikte}mm ${
                                materiaalsoortNaamById.get(materiaal.materiaalsoortId) ?? materiaal.materiaalsoortId
                              } — ${materiaal.omschrijving}`
                            : line.materiaalId}
                        </p>
                        <p className="text-white/50">
                          <span className="text-white/35">{t('bestellingenModalLabelMaat')}: </span>
                          {maat ? `${maat.breedte}×${maat.hoogte} cm` : line.maatId}
                        </p>
                        <p className="text-white/50">
                          <span className="text-white/35">{t('bestellingenModalLabelPrijs')}: </span>
                          {formatCurrency(line.prijs)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span>{t('bestellingenRegelOnbekend')}</span>
                  )}
                  <p className="shrink-0 text-right">
                    <span className="block text-white/35">{t('bestellingenModalLabelAantal')}</span>×{line.quantity}
                  </p>
                </li>
              );
            })}
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
