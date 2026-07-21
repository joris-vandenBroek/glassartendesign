'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable, type Column } from '@/components/DataTable';
import { BestellingModal } from './BestellingModal';
import type { Kunstwerk, Materiaal, Maat } from './materiaalTypes';

export interface BestellingLine {
  id: string;
  kunstwerkId: string | null;
  maatId: string | null;
  materiaalId: string | null;
  prijs: number;
  quantity: number;
}

export interface Bestelling {
  id: string;
  klantId: string;
  companyName: string;
  besteldatum: string;
  status: 'Te beoordelen' | 'Goedgekeurd' | 'Afgewezen';
  lineCount: number;
  totalQuantity: number;
  lines: BestellingLine[];
}

interface BestellingenSectionProps {
  bestellingen: Bestelling[] | null;
  kunstwerken: Kunstwerk[] | null;
  materialen: Materiaal[] | null;
  maten: Maat[] | null;
  loadError: string | null;
  onBestellingUpdated: (bestelling: Bestelling) => void;
}

export function BestellingenSection({
  bestellingen,
  kunstwerken,
  materialen,
  maten,
  loadError,
  onBestellingUpdated,
}: BestellingenSectionProps) {
  const t = useTranslations('beheer');
  const [selectedBestelling, setSelectedBestelling] = useState<Bestelling | null>(null);

  if (loadError) {
    return (
      <p data-testid="bestellingen-error" className="text-xs text-red-400">
        {loadError}
      </p>
    );
  }

  if (bestellingen === null) {
    return null;
  }

  const columns: Column<Bestelling>[] = [
    { key: 'companyName', label: t('bestellingenColKlant'), filterType: 'text' },
    { key: 'besteldatum', label: t('bestellingenColDatum'), filterType: 'text' },
    {
      key: 'lineCount',
      label: t('bestellingenColAantal'),
      filterType: 'text',
      render: (row) => `${row.lineCount} / ${row.totalQuantity}`,
    },
    {
      key: 'status',
      label: t('bestellingenColStatus'),
      filterType: 'select',
      filterOptions: ['Te beoordelen', 'Goedgekeurd', 'Afgewezen'],
    },
  ];

  return (
    <div data-testid="bestellingen-section">
      <DataTable<Bestelling>
        columns={columns}
        rows={bestellingen}
        getRowId={(row) => row.id}
        onRowClick={setSelectedBestelling}
        defaultFilters={{ status: 'Te beoordelen' }}
        emptyLabel={t('bestellingenEmpty')}
      />
      <BestellingModal
        bestelling={selectedBestelling}
        kunstwerken={kunstwerken}
        materialen={materialen}
        maten={maten}
        onClose={() => setSelectedBestelling(null)}
        onUpdated={(updated) => {
          onBestellingUpdated(updated);
          setSelectedBestelling(null);
        }}
      />
    </div>
  );
}
