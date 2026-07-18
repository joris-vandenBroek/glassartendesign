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

  it('avoids collision with seed IDs and existing orders by retrying', () => {
    const { result } = renderHook(() => useOrders(), { wrapper: OrdersProvider });

    // Force Math.random to produce values that collide with seed IDs and existing orders
    const originalRandom = Math.random;
    const randomSequence = [
      0.02344, // 10234 (seed ID collision)
      0.02344, // 10234 again (seed ID collision)
      0.02198, // 10198 (seed ID collision)
      0.5, // valid ID
    ];
    let callCount = 0;

    // Mock Math.random to cycle through the sequence
    Math.random = () => randomSequence[callCount++] || originalRandom();

    try {
      act(() => {
        result.current.placeOrder('Test order', 'Aangevraagd');
      });

      const firstOrderId = result.current.placedOrders[0].id;
      expect(firstOrderId).not.toBe('GD-10234');
      expect(firstOrderId).not.toBe('GD-10198');
      expect(firstOrderId).toMatch(/^GD-\d{5}$/);

      // Now place a second order; seed random to try to collide with the first
      callCount = 0;
      const firstOrderNumber = firstOrderId.split('-')[1];
      const collisionValue = (parseInt(firstOrderNumber) - 10000) / 89999;

      Math.random = () => {
        // Return collision value first, then a valid value
        if (callCount === 0) {
          callCount++;
          return collisionValue;
        }
        callCount++;
        return 0.6; // Different valid ID
      };

      act(() => {
        result.current.placeOrder('Another order', 'Aangevraagd');
      });

      const secondOrderId = result.current.placedOrders[0].id;
      expect(secondOrderId).not.toBe(firstOrderId);
      expect(secondOrderId).toMatch(/^GD-\d{5}$/);
      expect(result.current.placedOrders).toHaveLength(2);
    } finally {
      Math.random = originalRandom;
    }
  });
});
