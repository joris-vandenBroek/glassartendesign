import { describe, expect, it } from 'vitest';
import { MOCK_ORDERS } from '@/data/mockOrders';

describe('MOCK_ORDERS', () => {
  it('contains exactly 4 mock orders', () => {
    expect(MOCK_ORDERS).toHaveLength(4);
  });

  it('has a unique id for every order', () => {
    const ids = MOCK_ORDERS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a unique messageKey for every order', () => {
    const keys = MOCK_ORDERS.map((o) => o.messageKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
