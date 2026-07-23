import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/lib/useCart';

const SAMPLE_ITEM = {
  kunstwerkId: 'kw-1',
  foto: 'https://example.com/foto.jpg',
  omschrijving: 'Mooi kunstwerk',
  materiaalId: 'mat-1',
  materiaalLabel: '4mm — Veiligheidsglas',
  maatId: 'maat-1',
  maatLabel: '40×60 cm',
  prijs: 150,
  quantity: 2,
};

beforeEach(() => {
  window.localStorage.clear();
});

describe('useCart', () => {
  it('starts empty and hydrated after mount', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.totalQuantity).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('adds a new item, computes totalPrice, and persists it to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem(SAMPLE_ITEM);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalQuantity).toBe(2);
    expect(result.current.totalPrice).toBe(300);
    const stored = JSON.parse(window.localStorage.getItem('glassart-cart') ?? '[]');
    expect(stored).toHaveLength(1);
  });

  it('increases quantity instead of duplicating when the same kunstwerk+materiaal+maat is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem({ ...SAMPLE_ITEM, quantity: 1 });
    });
    act(() => {
      result.current.addItem({ ...SAMPLE_ITEM, quantity: 1 });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('adds a separate line when the same kunstwerk is added with a different maat', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem(SAMPLE_ITEM);
    });
    act(() => {
      result.current.addItem({
        ...SAMPLE_ITEM,
        maatId: 'maat-2',
        maatLabel: '60×90 cm',
        prijs: 200,
        quantity: 1,
      });
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalPrice).toBe(500);
  });

  it('removes an item by id', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem(SAMPLE_ITEM);
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
      result.current.addItem(SAMPLE_ITEM);
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.items).toEqual([]);
    expect(window.localStorage.getItem('glassart-cart')).toBeNull();
  });

  it('treats a null prijs as 0 in totalPrice, and counts it in unpricedLineCount', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem({ ...SAMPLE_ITEM, maatId: '', breedte: 90, hoogte: 140, prijs: null, quantity: 1 });
    });
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.unpricedLineCount).toBe(1);
  });

  it('does not count a priced item in unpricedLineCount', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem(SAMPLE_ITEM);
    });
    expect(result.current.unpricedLineCount).toBe(0);
  });

  it('gives two different custom sizes of the same kunstwerk+materiaal separate cart lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current.addItem({ ...SAMPLE_ITEM, maatId: '', breedte: 90, hoogte: 140, prijs: null, quantity: 1 });
    });
    act(() => {
      result.current.addItem({ ...SAMPLE_ITEM, maatId: '', breedte: 70, hoogte: 110, prijs: null, quantity: 1 });
    });
    expect(result.current.items).toHaveLength(2);
  });
});
