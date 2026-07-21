'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable, type Column } from '@/components/DataTable';
import { KlantModal } from './KlantModal';

export interface Klant {
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
  status: 'Beoordelen' | 'Goedgekeurd' | 'Afgewezen';
  prijsgroep: string;
}

interface KlantenSectionProps {
  klanten: Klant[] | null;
  loadError: string | null;
  onKlantUpdated: (klant: Klant) => void;
}

export function KlantenSection({ klanten, loadError, onKlantUpdated }: KlantenSectionProps) {
  const t = useTranslations('beheer');
  const [selectedKlant, setSelectedKlant] = useState<Klant | null>(null);

  if (loadError) {
    return (
      <p data-testid="klanten-error" className="text-xs text-red-400">
        {loadError}
      </p>
    );
  }

  if (klanten === null) {
    return null;
  }

  const columns: Column<Klant>[] = [
    { key: 'companyName', label: t('klantenColCompanyName'), filterType: 'text' },
    { key: 'kvk', label: t('klantenColKvk'), filterType: 'text' },
    { key: 'contactPerson', label: t('klantenColContactPerson'), filterType: 'text' },
    { key: 'email', label: t('klantenColEmail'), filterType: 'text' },
    { key: 'phone', label: t('klantenColPhone'), filterType: 'text' },
    {
      key: 'status',
      label: t('klantenColStatus'),
      filterType: 'select',
      filterOptions: ['Beoordelen', 'Goedgekeurd', 'Afgewezen'],
    },
  ];

  return (
    <div data-testid="klanten-section">
      <DataTable
        columns={columns}
        rows={klanten}
        getRowId={(row) => row.id}
        onRowClick={setSelectedKlant}
        defaultFilters={{ status: 'Beoordelen' }}
        emptyLabel={t('klantenEmpty')}
      />
      <KlantModal
        klant={selectedKlant}
        onClose={() => setSelectedKlant(null)}
        onUpdated={(updated) => {
          onKlantUpdated(updated);
          setSelectedKlant(null);
        }}
      />
    </div>
  );
}
