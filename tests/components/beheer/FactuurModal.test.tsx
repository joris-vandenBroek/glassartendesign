import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FactuurModal } from '@/components/beheer/FactuurModal';
import type { AdminInvoice } from '@/data/mockAdminInvoices';
import messages from '../../../messages/nl.json';

const FACTUUR: AdminInvoice = {
  invoiceNumber: 'INV-9001',
  date: '2026-07-01',
  companyName: 'Testbedrijf BV',
  amount: 500,
  status: 'Te betalen',
};

function renderModal(factuur: AdminInvoice | null) {
  const onClose = vi.fn();
  render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <FactuurModal factuur={factuur} onClose={onClose} />
    </NextIntlClientProvider>
  );
  return { onClose };
}

describe('FactuurModal', () => {
  it('renders nothing when factuur is null', () => {
    renderModal(null);
    expect(screen.queryByTestId('factuur-modal')).not.toBeInTheDocument();
  });

  it('shows the factuur details, with the amount formatted as currency', () => {
    renderModal(FACTUUR);
    expect(screen.getByTestId('factuur-modal')).toHaveTextContent('INV-9001');
    expect(screen.getByTestId('factuur-modal')).toHaveTextContent('Testbedrijf BV');
    expect(screen.getByTestId('factuur-modal')).toHaveTextContent('€ 500,00');
    expect(screen.getByTestId('factuur-modal')).toHaveTextContent('Te betalen');
  });

  it('has no action buttons (read-only)', () => {
    renderModal(FACTUUR);
    expect(screen.queryByRole('button', { name: /goedkeuren|afwijzen/i })).not.toBeInTheDocument();
  });
});
