'use client';

import { useTranslations } from 'next-intl';
import { MOCK_INVOICES } from '@/data/mockInvoices';

export function InvoicesPaidSection() {
  const t = useTranslations('accountPage');
  const tInvoices = useTranslations('accountPage.invoices');
  const invoices = MOCK_INVOICES.filter((invoice) => invoice.status === 'betaald');

  return (
    <div data-testid="invoices-paid-section">
      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
        {t('navInvoicesPaid')}
      </p>
      {invoices.length === 0 ? (
        <p className="text-xs text-white/60">{tInvoices('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              data-testid={`invoice-paid-${invoice.id}`}
              className="text-xs text-white/80"
            >
              <div className="flex items-center justify-between">
                <span>{invoice.id}</span>
                <span className="text-white/50">{invoice.date}</span>
              </div>
              <p>{tInvoices(`items.${invoice.messageKey}.description`)}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-white/50">{invoice.amount}</span>
                <button
                  type="button"
                  data-testid={`invoice-download-${invoice.id}`}
                  className="rounded-sm border border-white/20 px-2 py-1 text-[0.65rem] tracking-wide hover:bg-white/10"
                >
                  {tInvoices('downloadPdf')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
