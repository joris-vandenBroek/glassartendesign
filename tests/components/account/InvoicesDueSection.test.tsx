import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { InvoicesDueSection } from '@/components/account/InvoicesDueSection';
import messages from '../../../messages/nl.json';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <InvoicesDueSection />
    </NextIntlClientProvider>
  );
}

describe('InvoicesDueSection', () => {
  it('renders exactly the 3 "te-betalen" invoices with amount, no download button', () => {
    renderSection();
    expect(screen.getByTestId('invoice-due-INV-3051')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-due-INV-3038')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-due-INV-3021')).toBeInTheDocument();
    expect(screen.queryByTestId('invoice-due-INV-2987')).not.toBeInTheDocument();
    expect(screen.getByText('€ 645,00')).toBeInTheDocument();
    expect(screen.queryByTestId('invoice-download-INV-3051')).not.toBeInTheDocument();
  });
});
