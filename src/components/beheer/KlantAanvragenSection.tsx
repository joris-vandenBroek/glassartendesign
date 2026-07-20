'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface KlantAanvraag {
  id: string;
  companyName: string;
  kvk: string;
  contactPerson: string;
  email: string;
  phone: string;
  contactPreference: string;
  address: string;
  postcode: string;
  city: string;
}

export function KlantAanvragenSection() {
  const t = useTranslations('beheer');
  const [aanvragen, setAanvragen] = useState<KlantAanvraag[] | null>(null);
  const [prijsgroepen, setPrijsgroepen] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadAanvragen() {
      const snapshot = await getDocs(
        query(collection(db, 'klanten'), where('status', '==', 'Beoordelen'))
      );
      if (cancelled) return;
      setAanvragen(
        snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            companyName: data.companyName,
            kvk: data.kvk,
            contactPerson: data.contactPerson,
            email: data.email,
            phone: data.phone,
            contactPreference: data.contactPreference,
            address: data.address,
            postcode: data.postcode,
            city: data.city,
          };
        })
      );
    }
    loadAanvragen();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGoedkeuren(id: string) {
    const prijsgroep = prijsgroepen[id] ?? '';
    await updateDoc(doc(db, 'klanten', id), { status: 'Goedgekeurd', prijsgroep });
    setAanvragen((current) => (current ?? []).filter((aanvraag) => aanvraag.id !== id));
  }

  async function handleAfwijzen(id: string) {
    await updateDoc(doc(db, 'klanten', id), { status: 'Afgewezen' });
    setAanvragen((current) => (current ?? []).filter((aanvraag) => aanvraag.id !== id));
  }

  if (aanvragen === null) {
    return null;
  }

  if (aanvragen.length === 0) {
    return (
      <p data-testid="klantaanvragen-empty" className="text-sm text-white/60">
        {t('klantaanvragenEmpty')}
      </p>
    );
  }

  return (
    <div data-testid="klantaanvragen-section" className="flex flex-col gap-6">
      <h2 className="text-lg text-white">{t('klantaanvragenTitle')}</h2>
      {aanvragen.map((aanvraag) => (
        <div
          key={aanvraag.id}
          data-testid={`klantaanvraag-${aanvraag.id}`}
          className="flex flex-col gap-2 rounded-sm border border-white/10 p-4 text-sm text-white/80"
        >
          <p>
            {aanvraag.companyName} — {aanvraag.kvk}
          </p>
          <p>{aanvraag.contactPerson}</p>
          <p>
            {aanvraag.email} — {aanvraag.phone}
          </p>
          <p>
            {aanvraag.address}, {aanvraag.postcode} {aanvraag.city}
          </p>
          <p>
            {t('klantaanvragenContactPreference')}: {aanvraag.contactPreference}
          </p>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-white/60">
            {t('klantaanvragenLabelPrijsgroep')}
            <input
              type="text"
              value={prijsgroepen[aanvraag.id] ?? ''}
              onChange={(event) =>
                setPrijsgroepen((current) => ({ ...current, [aanvraag.id]: event.target.value }))
              }
              data-testid={`klantaanvraag-prijsgroep-${aanvraag.id}`}
              className="rounded-sm bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleGoedkeuren(aanvraag.id)}
              disabled={!prijsgroepen[aanvraag.id]}
              data-testid={`klantaanvraag-goedkeuren-${aanvraag.id}`}
              className="rounded-sm bg-silver px-4 py-2 text-xs tracking-wide text-ink disabled:opacity-40"
            >
              {t('klantaanvragenGoedkeuren')}
            </button>
            <button
              type="button"
              onClick={() => handleAfwijzen(aanvraag.id)}
              data-testid={`klantaanvraag-afwijzen-${aanvraag.id}`}
              className="rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white"
            >
              {t('klantaanvragenAfwijzen')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
