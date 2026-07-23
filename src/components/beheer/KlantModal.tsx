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

const STATUS_BADGE_CLASS: Record<Klant['status'], string> = {
  Beoordelen: 'bg-amber-400/10 text-amber-300',
  Goedgekeurd: 'bg-green-500/10 text-green-400',
  Afgewezen: 'bg-red-400/10 text-red-400',
};

function Veld({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
      <span className="text-white/90">{value || '—'}</span>
    </div>
  );
}

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
        <div data-testid="klant-modal" className="flex flex-col gap-3 text-sm text-white/80">
          <span
            data-testid="klant-modal-status"
            className={`w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide ${STATUS_BADGE_CLASS[klant.status]}`}
          >
            {klant.status}
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Veld label={t('klantenColCompanyName')} value={klant.companyName} />
            <Veld label={t('klantenColKvk')} value={klant.kvk} />
            <Veld label={t('klantenColContactPerson')} value={klant.contactPerson} />
            <Veld label={t('klantenContactPreference')} value={klant.contactPreference} />
            <Veld label={t('klantenColEmail')} value={klant.email} />
            <Veld label={t('klantenColPhone')} value={klant.phone} />
            <Veld label={t('klantenLabelAdres')} value={klant.address} />
            <Veld label={t('klantenLabelPostcode')} value={klant.postcode} />
            <Veld label={t('klantenLabelPlaats')} value={klant.city} />
          </div>

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
