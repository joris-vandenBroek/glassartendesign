import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FacturenSection } from '@/components/beheer/FacturenSection';
import { MOCK_ADMIN_INVOICES } from '@/data/mockAdminInvoices';
import messages from '../../../messages/nl.json';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <FacturenSection />
    </NextIntlClientProvider>
  );
}

describe('FacturenSection', () => {
  it('shows only "Te betalen" facturen by default', () => {
    renderSection();
    const teBetalenCount = MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Te betalen').length;
    const betaaldCount = MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Betaald').length;
    expect(teBetalenCount).toBeGreaterThan(0);
    expect(betaaldCount).toBeGreaterThan(0);

    MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Te betalen').forEach((invoice) => {
      expect(screen.getByTestId(`data-table-row-${invoice.invoiceNumber}`)).toBeInTheDocument();
    });
    MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Betaald').forEach((invoice) => {
      expect(screen.queryByTestId(`data-table-row-${invoice.invoiceNumber}`)).not.toBeInTheDocument();
    });
  });

  it('shows all facturen when the status filter is cleared', () => {
    renderSection();
    fireEvent.change(screen.getByTestId('data-table-filter-status'), { target: { value: '' } });
    MOCK_ADMIN_INVOICES.forEach((invoice) => {
      expect(screen.getByTestId(`data-table-row-${invoice.invoiceNumber}`)).toBeInTheDocument();
    });
  });

  it('opens the FactuurModal with the clicked factuur\'s data when a row is clicked', () => {
    renderSection();
    const firstOpen = MOCK_ADMIN_INVOICES.find((invoice) => invoice.status === 'Te betalen')!;
    fireEvent.click(screen.getByTestId(`data-table-row-${firstOpen.invoiceNumber}`));
    expect(screen.getByTestId('factuur-modal')).toHaveTextContent(firstOpen.invoiceNumber);
  });
});
