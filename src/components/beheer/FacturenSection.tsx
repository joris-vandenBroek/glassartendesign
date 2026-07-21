'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable, type Column } from '@/components/DataTable';
import { MOCK_ADMIN_INVOICES, formatCurrency, type AdminInvoice } from '@/data/mockAdminInvoices';
import { FactuurModal } from './FactuurModal';

export function FacturenSection() {
  const t = useTranslations('beheer');
  const [selectedFactuur, setSelectedFactuur] = useState<AdminInvoice | null>(null);

  const columns: Column<AdminInvoice>[] = [
    { key: 'invoiceNumber', label: t('facturenColInvoiceNumber') },
    { key: 'date', label: t('facturenColDate') },
    { key: 'companyName', label: t('facturenColCompanyName') },
    {
      key: 'amount',
      label: t('facturenColAmount'),
      render: (row) => formatCurrency(row.amount),
    },
    { key: 'status', label: t('facturenColStatus') },
  ];

  return (
    <div data-testid="facturen-section">
      <DataTable<AdminInvoice>
        columns={columns}
        rows={MOCK_ADMIN_INVOICES}
        getRowId={(row) => row.invoiceNumber}
        onRowClick={setSelectedFactuur}
        quickFilter={{
          key: 'status',
          activeValue: 'Te betalen',
          activeLabel: t('facturenQuickTeBetalen'),
          allLabel: t('facturenQuickAlle'),
        }}
        emptyLabel={t('facturenEmpty')}
        searchPlaceholder={t('dataTableSearchPlaceholder')}
      />
      <FactuurModal factuur={selectedFactuur} onClose={() => setSelectedFactuur(null)} />
    </div>
  );
}
