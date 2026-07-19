'use client';

import { useTranslations } from 'next-intl';
import { MOCK_INVOICES } from '@/data/mockInvoices';

export function InvoicesDueSection() {
  const t = useTranslations('accountPage');
  const tInvoices = useTranslations('accountPage.invoices');
  const invoices = MOCK_INVOICES.filter((invoice) => invoice.status === 'te-betalen');

  return (
    <div data-testid="invoices-due-section">
      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
        {t('navInvoicesDue')}
      </p>
      {invoices.length === 0 ? (
        <p className="text-xs text-white/60">{tInvoices('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              data-testid={`invoice-due-${invoice.id}`}
              className="text-xs text-white/80"
            >
              <div className="flex items-center justify-between">
                <span>{invoice.id}</span>
                <span className="text-white/50">{invoice.date}</span>
              </div>
              <p>{tInvoices(`items.${invoice.messageKey}.description`)}</p>
              <p className="mt-1 text-white/50">{invoice.amount}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
