'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable, type Column } from '@/components/DataTable';
import type { ActiviteitType } from '@/lib/logActiviteit';

export interface Activiteit {
  id: string;
  type: ActiviteitType;
  actorEmail: string;
  actorNaam: string;
  timestamp: Date | null;
}

interface ActiviteitRow {
  id: string;
  tijdstip: string;
  typeLabel: string;
  actorNaam: string;
  actorEmail: string;
}

interface ActiviteitSectionProps {
  activiteiten: Activiteit[] | null;
  loadError: string | null;
}

const TYPE_LABEL_KEYS: Record<ActiviteitType, string> = {
  kunstwerk_bekeken: 'activiteitTypeKunstwerkBekeken',
  mandje_toegevoegd: 'activiteitTypeMandjeToegevoegd',
  bestelling_geplaatst: 'activiteitTypeBestellingGeplaatst',
  account_bezocht: 'activiteitTypeAccountBezocht',
  beheer_bezocht: 'activiteitTypeBeheerBezocht',
  word_klant_bezocht: 'activiteitTypeWordKlantBezocht',
  word_klant_aanvraag: 'activiteitTypeWordKlantAanvraag',
};

export function ActiviteitSection({ activiteiten, loadError }: ActiviteitSectionProps) {
  const t = useTranslations('beheer');

  const rows = useMemo<ActiviteitRow[]>(
    () =>
      (activiteiten ?? []).map((activiteit) => ({
        id: activiteit.id,
        tijdstip: activiteit.timestamp ? activiteit.timestamp.toLocaleString('nl-NL') : '',
        typeLabel: t(TYPE_LABEL_KEYS[activiteit.type]),
        actorNaam: activiteit.actorNaam,
        actorEmail: activiteit.actorEmail,
      })),
    [activiteiten, t]
  );

  const columns: Column<ActiviteitRow>[] = [
    { key: 'tijdstip', label: t('activiteitColTijdstip') },
    { key: 'typeLabel', label: t('activiteitColType') },
    { key: 'actorNaam', label: t('activiteitColKlant') },
    { key: 'actorEmail', label: t('activiteitColEmail') },
  ];

  return (
    <div data-testid="activiteit-section">
      {loadError && (
        <p data-testid="activiteit-load-error" className="mb-3 text-xs text-red-400">
          {loadError}
        </p>
      )}
      <DataTable<ActiviteitRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        onRowClick={() => {}}
        emptyLabel={t('activiteitEmpty')}
        searchPlaceholder={t('dataTableSearchPlaceholder')}
      />
    </div>
  );
}
