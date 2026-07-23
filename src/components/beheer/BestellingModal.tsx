'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Modal } from '@/components/Modal';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { logActiviteit, actorFromMedewerker } from '@/lib/logActiviteit';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Bestelling, BestellingLine } from './BestellingenSection';
import type { Kunstwerk, Materiaal, Maat, Materiaalsoort } from './materiaalTypes';

interface BestellingModalProps {
  bestelling: Bestelling | null;
  kunstwerken: Kunstwerk[] | null;
  materialen: Materiaal[] | null;
  maten: Maat[] | null;
  materiaalsoorten: Materiaalsoort[] | null;
  onClose: () => void;
  onUpdated: (bestelling: Bestelling) => void;
  onLinePrijsVastgesteld: (bestellingId: string, lineId: string, prijs: number) => void;
}

export function BestellingModal({
  bestelling,
  kunstwerken,
  materialen,
  maten,
  materiaalsoorten,
  onClose,
  onUpdated,
  onLinePrijsVastgesteld,
}: BestellingModalProps) {
  const t = useTranslations('beheer');
  const [error, setError] = useState<string | null>(null);
  const [prijsDrafts, setPrijsDrafts] = useState<Record<string, string>>({});
  const { user } = useAdminAuth();

  useEffect(() => {
    if (bestelling) {
      setError(null);
      setPrijsDrafts({});
    }
  }, [bestelling]);

  const materiaalsoortNaamById = new Map(
    (materiaalsoorten ?? []).map((soort) => [soort.id, soort.omschrijving])
  );

  const heeftOngeprijsdeRegel = (bestelling?.lines ?? []).some((line) => line.prijs === null);

  async function handleGoedkeuren() {
    if (!bestelling) return;
    try {
      await updateDoc(doc(db, 'bestelheaders', bestelling.id), { status: 'Goedgekeurd' });
      void logActiviteit('bestelling_goedgekeurd', actorFromMedewerker(user));
      onUpdated({ ...bestelling, status: 'Goedgekeurd' });
    } catch {
      setError(t('bestellingenActionError'));
    }
  }

  async function handleAfwijzen() {
    if (!bestelling) return;
    try {
      await updateDoc(doc(db, 'bestelheaders', bestelling.id), { status: 'Afgewezen' });
      void logActiviteit('bestelling_afgewezen', actorFromMedewerker(user));
      onUpdated({ ...bestelling, status: 'Afgewezen' });
    } catch {
      setError(t('bestellingenActionError'));
    }
  }

  async function handlePrijsVaststellen(line: BestellingLine) {
    if (!bestelling) return;
    const prijs = Number(prijsDrafts[line.id]);
    if (!prijs || prijs <= 0) return;
    try {
      await updateDoc(doc(db, 'bestelheaders', bestelling.id, 'bestellines', line.id), { prijs });
      void logActiviteit('bestelling_prijs_vastgesteld', actorFromMedewerker(user));
      onLinePrijsVastgesteld(bestelling.id, line.id, prijs);
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
              const maatWeergave = maat
                ? `${maat.breedte}×${maat.hoogte} cm`
                : line.breedte != null && line.hoogte != null
                  ? `${line.breedte}×${line.hoogte} cm`
                  : line.maatId;
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
                          {maatWeergave}
                        </p>
                        <p className="text-white/50">
                          <span className="text-white/35">{t('bestellingenModalLabelPrijs')}: </span>
                          {line.prijs !== null ? formatCurrency(line.prijs) : t('bestellingenModalPrijsOpAanvraag')}
                        </p>
                        {line.prijs === null && (
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="number"
                              data-testid={`bestelling-modal-prijs-input-${line.id}`}
                              value={prijsDrafts[line.id] ?? ''}
                              onChange={(event) =>
                                setPrijsDrafts((current) => ({ ...current, [line.id]: event.target.value }))
                              }
                              className="w-20 rounded-sm bg-black/40 px-2 py-1 text-xs text-white"
                            />
                            <button
                              type="button"
                              data-testid={`bestelling-modal-prijs-vaststellen-${line.id}`}
                              onClick={() => handlePrijsVaststellen(line)}
                              disabled={!prijsDrafts[line.id] || Number(prijsDrafts[line.id]) <= 0}
                              className="rounded-sm border border-white/20 px-2 py-1 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white disabled:opacity-40"
                            >
                              {t('bestellingenModalPrijsVaststellen')}
                            </button>
                          </div>
                        )}
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

          <div className="flex flex-col gap-2">
            {heeftOngeprijsdeRegel && (
              <p data-testid="bestelling-modal-goedkeuren-blocked" className="text-xs text-amber-400">
                {t('bestellingenGoedkeurenBlocked')}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoedkeuren}
                disabled={heeftOngeprijsdeRegel}
                data-testid="bestelling-modal-goedkeuren"
                className="rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink disabled:opacity-40"
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
        </div>
      )}
    </Modal>
  );
}
