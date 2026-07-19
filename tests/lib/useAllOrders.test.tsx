import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { OrdersProvider, useOrders } from '@/lib/useOrders';
import { ReturnsProvider, useReturns } from '@/lib/useReturns';
import { useAllOrders } from '@/lib/useAllOrders';
import messages from '../../messages/nl.json';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="nl" messages={messages}>
      <OrdersProvider>
        <ReturnsProvider>{children}</ReturnsProvider>
      </OrdersProvider>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
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
});
