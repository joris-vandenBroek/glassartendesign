import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/lib/useCart';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useCart', () => {
  it('starts empty and hydrated after mount', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.totalQuantity).toBe(0);
  });

  it('adds a new item and persists it to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem({
        segmentSlug: 'wellness',
        segmentMessageKey: 'wellness',
        imageSrc: 'https://images.unsplash.com/example.jpg',
        size: '60x90cm',
        quantity: 2,
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalQuantity).toBe(2);
    const stored = JSON.parse(window.localStorage.getItem('glassart-cart') ?? '[]');
    expect(stored).toHaveLength(1);
  });

  it('increases quantity instead of duplicating when the same segment+image+size is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    const input = {
      segmentSlug: 'wellness',
      segmentMessageKey: 'wellness',
      imageSrc: 'https://images.unsplash.com/example.jpg',
      size: '60x90cm',
      quantity: 1,
    };
    act(() => {
      result.current.addItem(input);
    });
    act(() => {
      result.current.addItem(input);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('removes an item by id', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem({
        segmentSlug: 'hotel',
        segmentMessageKey: 'hotel',
        imageSrc: 'https://images.unsplash.com/example2.jpg',
        size: '40x60cm',
        quantity: 1,
      });
    });
    const id = result.current.items[0].id;
    act(() => {
      result.current.removeItem(id);
    });
    expect(result.current.items).toEqual([]);
  });

  it('clears the cart and localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem({
        segmentSlug: 'hotel',
        segmentMessageKey: 'hotel',
        imageSrc: 'https://images.unsplash.com/example2.jpg',
        size: '40x60cm',
        quantity: 1,
      });
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.items).toEqual([]);
    expect(window.localStorage.getItem('glassart-cart')).toBeNull();
  });
});
