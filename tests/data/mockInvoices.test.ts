import { describe, expect, it } from 'vitest';
import { MOCK_INVOICES } from '@/data/mockInvoices';

describe('MOCK_INVOICES', () => {
  it('contains exactly 6 mock invoices, 3 due and 3 paid', () => {
    expect(MOCK_INVOICES).toHaveLength(6);
    expect(MOCK_INVOICES.filter((invoice) => invoice.status === 'te-betalen')).toHaveLength(3);
    expect(MOCK_INVOICES.filter((invoice) => invoice.status === 'betaald')).toHaveLength(3);
  });

  it('has a unique id and messageKey for every invoice', () => {
    expect(new Set(MOCK_INVOICES.map((i) => i.id)).size).toBe(MOCK_INVOICES.length);
    expect(new Set(MOCK_INVOICES.map((i) => i.messageKey)).size).toBe(MOCK_INVOICES.length);
  });
});
