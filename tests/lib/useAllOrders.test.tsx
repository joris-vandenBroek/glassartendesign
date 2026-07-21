import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { OrdersProvider, useOrders } from '@/lib/useOrders';
import { ReturnsProvider, useReturns } from '@/lib/useReturns';
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

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="nl" messages={messages}>
      <CustomerAuthProvider>
        <OrdersProvider>
          <ReturnsProvider>{children}</ReturnsProvider>
        </OrdersProvider>
      </CustomerAuthProvider>
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
  it('returns the 4 seed orders with translated description/status when nothing else exists', () => {
    const { result } = renderHook(() => useAllOrders(), { wrapper });
    expect(result.current).toHaveLength(4);
    const seedOrder = result.current.find((o) => o.id === 'GD-10234');
    expect(seedOrder?.description).toBe('Abstract paneel 60x90cm');
    expect(seedOrder?.status).toBe('In behandeling');
    expect(seedOrder?.hasReturnRequest).toBe(false);
  });

  it('places a newly placed order before the seed orders', () => {
    const { result } = renderHook(
      () => ({ orders: useAllOrders(), placeOrder: useOrders().placeOrder }),
      { wrapper }
    );
    act(() => {
      result.current.placeOrder('Nieuwe bestelling', 'Aangevraagd');
    });
    expect(result.current.orders).toHaveLength(5);
    expect(result.current.orders[0].description).toBe('Nieuwe bestelling');
  });

  it('overlays "Retour aangemeld" status for an order with a registered return', () => {
    const { result } = renderHook(
      () => ({ orders: useAllOrders(), registerReturn: useReturns().registerReturn }),
      { wrapper }
    );
    act(() => {
      result.current.registerReturn('GD-10234', 'Beschadigd', 'Kapot aangekomen');
    });
    const order = result.current.orders.find((o) => o.id === 'GD-10234');
    expect(order?.status).toBe('Retour aangemeld');
    expect(order?.hasReturnRequest).toBe(true);
  });

  it("shows the customer's own real bestellingen before the mock orders", async () => {
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
                besteldatum: { toDate: () => new Date('2026-07-01') },
                status: 'Te beoordelen',
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

    const { result } = renderHook(() => useAllOrders(), { wrapper });
    await waitFor(() => expect(result.current).toHaveLength(5));
    expect(result.current[0].id).toBe('header-1');
    expect(result.current[0].description).toBe('1 regel, 3 stuks');
    expect(result.current[0].status).toBe('Te beoordelen');
  });
});
