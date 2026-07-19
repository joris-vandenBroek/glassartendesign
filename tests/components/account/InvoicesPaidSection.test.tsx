import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { InvoicesPaidSection } from '@/components/account/InvoicesPaidSection';
import messages from '../../../messages/nl.json';

function renderSection() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <InvoicesPaidSection />
    </NextIntlClientProvider>
  );
}

describe('InvoicesPaidSection', () => {
  it('renders exactly the 3 "betaald" invoices, each with a Download PDF button', () => {
    renderSection();
    expect(screen.getByTestId('invoice-paid-INV-2987')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-paid-INV-2965')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-paid-INV-2942')).toBeInTheDocument();
    expect(screen.queryByTestId('invoice-paid-INV-3051')).not.toBeInTheDocument();
    expect(screen.getByTestId('invoice-download-INV-2987')).toHaveTextContent('Download PDF');
  });
});
