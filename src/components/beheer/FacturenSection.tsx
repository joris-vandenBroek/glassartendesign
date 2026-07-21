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
    { key: 'invoiceNumber', label: t('facturenColInvoiceNumber'), filterType: 'text' },
    { key: 'date', label: t('facturenColDate'), filterType: 'text' },
    { key: 'companyName', label: t('facturenColCompanyName'), filterType: 'text' },
    {
      key: 'amount',
      label: t('facturenColAmount'),
      filterType: 'text',
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: 'status',
      label: t('facturenColStatus'),
      filterType: 'select',
      filterOptions: ['Te betalen', 'Betaald'],
    },
  ];

  return (
    <div data-testid="facturen-section">
      <DataTable<AdminInvoice>
        columns={columns}
        rows={MOCK_ADMIN_INVOICES}
        getRowId={(row) => row.invoiceNumber}
        onRowClick={setSelectedFactuur}
        defaultFilters={{ status: 'Te betalen' }}
        emptyLabel={t('facturenEmpty')}
      />
      <FactuurModal factuur={selectedFactuur} onClose={() => setSelectedFactuur(null)} />
    </div>
  );
}
