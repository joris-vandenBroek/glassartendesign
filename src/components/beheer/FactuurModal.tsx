'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/Modal';
import { formatCurrency, type AdminInvoice } from '@/data/mockAdminInvoices';

interface FactuurModalProps {
  factuur: AdminInvoice | null;
  onClose: () => void;
}

export function FactuurModal({ factuur, onClose }: FactuurModalProps) {
  const t = useTranslations('beheer');

  return (
    <Modal isOpen={factuur !== null} onClose={onClose} closeLabel={t('modalClose')}>
      {factuur && (
        <div data-testid="factuur-modal" className="flex flex-col gap-2 text-sm text-white/80">
          <p>
            {t('facturenColInvoiceNumber')}: {factuur.invoiceNumber}
          </p>
          <p>
            {t('facturenColDate')}: {factuur.date}
          </p>
          <p>
            {t('facturenColCompanyName')}: {factuur.companyName}
          </p>
          <p>
            {t('facturenColAmount')}: {formatCurrency(factuur.amount)}
          </p>
          <p>
            {t('facturenColStatus')}: {factuur.status}
          </p>
        </div>
      )}
    </Modal>
  );
}
