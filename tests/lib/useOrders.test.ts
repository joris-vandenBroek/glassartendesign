import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { OrdersProvider, useOrders } from '@/lib/useOrders';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useOrders', () => {
  it('starts with no placed orders, hydrated after mount', () => {
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.placedOrders).toEqual([]);
  });

  it('places a new order with a generated GD-XXXXX id and persists it', () => {
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });
    act(() => {
      result.current.placeOrder('Wellness paneel 60x90cm ×2', 'Aangevraagd');
    });
    expect(result.current.placedOrders).toHaveLength(1);
    const [order] = result.current.placedOrders;
    expect(order.id).toMatch(/^GD-\d{5}$/);
    expect(order.description).toBe('Wellness paneel 60x90cm ×2');
    expect(order.status).toBe('Aangevraagd');
    expect(order.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const stored = JSON.parse(window.localStorage.getItem('glassart-placed-orders') ?? '[]');
    expect(stored).toHaveLength(1);
  });

  it('adds new orders to the front (newest first)', () => {
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });
    act(() => {
      result.current.placeOrder('First order', 'Aangevraagd');
    });
    act(() => {
      result.current.placeOrder('Second order', 'Aangevraagd');
    });
    expect(result.current.placedOrders[0].description).toBe('Second order');
    expect(result.current.placedOrders[1].description).toBe('First order');
  });
});
