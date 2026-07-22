import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CustomerAuthProvider } from '@/lib/useCustomerAuth';
import { useAllOrders } from '@/lib/useAllOrders';
import messages from '../../messages/nl.json';

const onAuthStateChangedMock = vi.fn();
const getDocMock = vi.fn();
const getDocsMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  collection: vi.fn((_db, ...segments: string[]) => ({ name: segments.join('/') })),
  query: vi.fn((collectionRef, ...constraints) => ({ collectionRef, constraints })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
}));

function signedOut() {
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback(null);
    return () => {};
  });
  getDocsMock.mockResolvedValue({ docs: [] });
}

function signedInWithOrder(overrides: Record<string, unknown> = {}) {
  getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
  onAuthStateChangedMock.mockImplementation((_auth, callback) => {
    callback({ uid: 'uid-1', email: 'klant@example.com' });
    return () => {};
  });
  getDocsMock.mockImplementation((ref: { name?: string; collectionRef?: { name: string } }) => {
    const name = ref.name ?? ref.collectionRef?.name;
    if (name === 'bestelheaders') {
      return Promise.resolve({
        docs: [
          {
            id: 'header-1',
            data: () => ({
              klantId: 'uid-1',
              bestelnr: 'GD-00001',
              besteldatum: { toDate: () => new Date('2026-07-01T14:30:00') },
              status: 'Te beoordelen',
              ...overrides,
            }),
          },
        ],
      });
    }
    if (name === 'bestelheaders/header-1/bestellines') {
      return Promise.resolve({
        docs: [{ id: 'line-1', data: () => ({ quantity: 3 }) }],
      });
    }
    return Promise.resolve({ docs: [] });
  });
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>{children}</CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  onAuthStateChangedMock.mockReset();
  getDocMock.mockReset();
  getDocsMock.mockReset();
  signedOut();
});

describe('useAllOrders', () => {
  it('returns no orders when signed out', () => {
    const { result } = renderHook(() => useAllOrders(), { wrapper });
    expect(result.current.orders).toHaveLength(0);
    expect(result.current.loadError).toBe(false);
  });

  it("shows the customer's own real bestellingen", async () => {
    signedInWithOrder();

    const { result } = renderHook(() => useAllOrders(), { wrapper });
    await waitFor(() => expect(result.current.orders).toHaveLength(1));
    expect(result.current.orders[0].id).toBe('GD-00001');
    expect(result.current.orders[0].description).toBe('1 bestelregel, totaal 3 stuks');
    expect(result.current.loadError).toBe(false);
  });

  it('falls back to the Firestore document id when no bestelnr is stored', async () => {
    signedInWithOrder({ bestelnr: undefined });

    const { result } = renderHook(() => useAllOrders(), { wrapper });
    await waitFor(() => expect(result.current.orders).toHaveLength(1));
    expect(result.current.orders[0].id).toBe('header-1');
  });

  it('reports a load error when fetching orders fails, without throwing', async () => {
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ status: 'Goedgekeurd' }) });
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-1', email: 'klant@example.com' });
      return () => {};
    });
    getDocsMock.mockRejectedValue(new Error('permission-denied'));

    const { result } = renderHook(() => useAllOrders(), { wrapper });
    await waitFor(() => expect(result.current.loadError).toBe(true));
    expect(result.current.orders).toHaveLength(0);
  });
});
