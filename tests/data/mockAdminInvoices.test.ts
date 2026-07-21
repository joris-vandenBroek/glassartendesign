import { describe, expect, it } from 'vitest';
import { MOCK_ADMIN_INVOICES, formatCurrency } from '@/data/mockAdminInvoices';

describe('MOCK_ADMIN_INVOICES', () => {
  it('contains at least one "Te betalen" and one "Betaald" invoice', () => {
    expect(MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Te betalen').length).toBeGreaterThan(0);
    expect(MOCK_ADMIN_INVOICES.filter((invoice) => invoice.status === 'Betaald').length).toBeGreaterThan(0);
  });

  it('has a unique invoiceNumber for every invoice', () => {
    expect(new Set(MOCK_ADMIN_INVOICES.map((invoice) => invoice.invoiceNumber)).size).toBe(
      MOCK_ADMIN_INVOICES.length
    );
  });

  it('stores amount as a number, not a formatted string', () => {
    MOCK_ADMIN_INVOICES.forEach((invoice) => {
      expect(typeof invoice.amount).toBe('number');
    });
  });
});

describe('formatCurrency', () => {
  it('formats a number as Dutch euro currency', () => {
    expect(formatCurrency(645)).toBe('€ 645,00');
    expect(formatCurrency(1240.5)).toBe('€ 1.240,50');
  });
});
