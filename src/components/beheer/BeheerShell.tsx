'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GlassPanel } from '@/components/GlassPanel';
import { BeheerNav, type BeheerSection } from './BeheerNav';
import { KlantenSection, type Klant } from './KlantenSection';
import { FacturenSection } from './FacturenSection';
import { MateriaalsoortenSection } from './MateriaalsoortenSection';
import { MaterialenSection } from './MaterialenSection';
import { MatenSection } from './MatenSection';
import type { Materiaalsoort, Materiaal, Maat } from './materiaalTypes';
import { MOCK_ADMIN_INVOICES } from '@/data/mockAdminInvoices';
import { useFirestoreCollection } from '@/lib/useFirestoreCollection';
import { MATERIAALSOORTEN_SEED, buildMaterialenSeed } from '@/data/materiaalsoortenSeed';

interface BeheerShellProps {
  email: string;
  onLogout: () => void;
}

export function BeheerShell({ email, onLogout }: BeheerShellProps) {
  const t = useTranslations('beheer');
  const [activeSection, setActiveSection] = useState<BeheerSection>('klanten');
  const [klanten, setKlanten] = useState<Klant[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadKlanten() {
      try {
        const snapshot = await getDocs(collection(db, 'klanten'));
        if (cancelled) return;
        setKlanten(
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
              status: data.status,
              prijsgroep: data.prijsgroep,
            } as Klant;
          })
        );
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError(t('klantenLoadError'));
        }
      }
    }
    loadKlanten();
    return () => {
      cancelled = true;
    };
  }, [t]);

  function handleKlantUpdated(updated: Klant) {
    setKlanten((current) => (current ?? []).map((klant) => (klant.id === updated.id ? updated : klant)));
  }

  const materiaalsoorten = useFirestoreCollection<Materiaalsoort>('materiaalsoorten', {
    seed: MATERIAALSOORTEN_SEED,
  });
  const materialenSeed = materiaalsoorten.items ? buildMaterialenSeed(materiaalsoorten.items) : undefined;
  const materialen = useFirestoreCollection<Materiaal>('materialen', {
    seed: materialenSeed,
    skip: materiaalsoorten.items === null,
  });
  const maten = useFirestoreCollection<Maat>('maten');

  const klantenCount = (klanten ?? []).filter((klant) => klant.status === 'Beoordelen').length;
  const facturenCount = MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Te betalen').length;
  const materiaalsoortenCount = (materiaalsoorten.items ?? []).length;
  const materialenCount = (materialen.items ?? []).length;
  const matenCount = (maten.items ?? []).length;

  return (
    <div
      data-testid="beheer-dashboard"
      className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]"
    >
      <GlassPanel className="w-full">
        <p data-testid="beheer-logged-in-as" className="mb-4 text-xs text-white/60">
          {t('loggedInAs', { email })}
        </p>
        <BeheerNav
          activeSection={activeSection}
          onSelect={setActiveSection}
          onLogout={onLogout}
          klantenCount={klantenCount}
          facturenCount={facturenCount}
          materiaalsoortenCount={materiaalsoortenCount}
          materialenCount={materialenCount}
          matenCount={matenCount}
        />
      </GlassPanel>
      <GlassPanel className="w-full">
        {activeSection === 'klanten' ? (
          <KlantenSection klanten={klanten} loadError={loadError} onKlantUpdated={handleKlantUpdated} />
        ) : activeSection === 'facturen' ? (
          <FacturenSection />
        ) : activeSection === 'materiaalsoorten' ? (
          <MateriaalsoortenSection
            materiaalsoorten={materiaalsoorten.items}
            materialen={materialen.items}
            loadError={materiaalsoorten.error === 'load' ? t('materiaalsoortenLoadError') : null}
            onAdd={materiaalsoorten.add}
            onUpdate={materiaalsoorten.update}
            onRemove={materiaalsoorten.remove}
          />
        ) : activeSection === 'materialen' ? (
          <MaterialenSection
            materialen={materialen.items}
            materiaalsoorten={materiaalsoorten.items}
            loadError={materialen.error === 'load' ? t('materialenLoadError') : null}
            onAdd={materialen.add}
            onUpdate={materialen.update}
            onRemove={materialen.remove}
          />
        ) : (
          <MatenSection
            maten={maten.items}
            loadError={maten.error === 'load' ? t('matenLoadError') : null}
            onAdd={maten.add}
            onUpdate={maten.update}
            onRemove={maten.remove}
          />
        )}
      </GlassPanel>
    </div>
  );
}
