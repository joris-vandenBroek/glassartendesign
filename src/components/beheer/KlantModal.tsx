'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Modal } from '@/components/Modal';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { logActiviteit, actorFromMedewerker } from '@/lib/logActiviteit';
import type { Klant } from './KlantenSection';
import type { Prijsgroep } from './materiaalTypes';

interface KlantModalProps {
  klant: Klant | null;
  prijsgroepen: Prijsgroep[] | null;
  onClose: () => void;
  onUpdated: (klant: Klant) => void;
}

export function KlantModal({ klant, prijsgroepen, onClose, onUpdated }: KlantModalProps) {
  const t = useTranslations('beheer');
  const [prijsgroepId, setPrijsgroepId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAdminAuth();

  useEffect(() => {
    if (klant) {
      setPrijsgroepId(klant.prijsgroepId ?? '');
      setError(null);
    }
  }, [klant]);

  async function handleGoedkeuren() {
    if (!klant) return;
    try {
      await updateDoc(doc(db, 'klanten', klant.id), { status: 'Goedgekeurd', prijsgroepId });
      void logActiviteit('klant_goedgekeurd', actorFromMedewerker(user));
      onUpdated({ ...klant, status: 'Goedgekeurd', prijsgroepId });
    } catch {
      setError(t('klantenActionError'));
    }
  }

  async function handleAfwijzen() {
    if (!klant) return;
    try {
      await updateDoc(doc(db, 'klanten', klant.id), { status: 'Afgewezen' });
      void logActiviteit('klant_afgewezen', actorFromMedewerker(user));
      onUpdated({ ...klant, status: 'Afgewezen' });
    } catch {
      setError(t('klantenActionError'));
    }
  }

  return (
    <Modal isOpen={klant !== null} onClose={onClose} closeLabel={t('modalClose')}>
      {klant && (
        <div data-testid="klant-modal" className="flex flex-col gap-2 text-sm text-white/80">
          <p>
            {klant.companyName} — {klant.kvk}
          </p>
          <p>{klant.contactPerson}</p>
          <p>
            {klant.email} — {klant.phone}
          </p>
          <p>
            {klant.address}, {klant.postcode} {klant.city}
          </p>
          <p>
            {t('klantenContactPreference')}: {klant.contactPreference}
          </p>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('klantenLabelPrijsgroep')}
            <select
              value={prijsgroepId}
              onChange={(event) => setPrijsgroepId(event.target.value)}
              data-testid="klant-modal-prijsgroep"
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="" disabled>
                {t('klantenLabelPrijsgroep')}
              </option>
              {(prijsgroepen ?? []).map((prijsgroep) => (
                <option key={prijsgroep.id} value={prijsgroep.id}>
                  {prijsgroep.naam}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p data-testid="klant-modal-error" className="text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGoedkeuren}
              disabled={!prijsgroepId}
              data-testid="klant-modal-goedkeuren"
              className="rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink disabled:opacity-40"
            >
              {t('klantenGoedkeuren')}
            </button>
            <button
              type="button"
              onClick={handleAfwijzen}
              data-testid="klant-modal-afwijzen"
              className="rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white"
            >
              {t('klantenAfwijzen')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
