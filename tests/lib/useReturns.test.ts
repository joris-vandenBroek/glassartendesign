import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReturnsProvider, useReturns } from '@/lib/useReturns';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useReturns', () => {
  it('starts with no returns, hydrated after mount', () => {
    const { result } = renderHook(() => useReturns(), { wrapper: ReturnsProvider });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.returnsByOrderId).toEqual({});
  });

  it('registers a return and persists it to localStorage', () => {
    const { result } = renderHook(() => useReturns(), { wrapper: ReturnsProvider });
    act(() => {
      result.current.registerReturn('GD-10234', 'Beschadigd', 'Glas gebarsten bij aankomst');
    });
    expect(result.current.returnsByOrderId['GD-10234']).toMatchObject({
      reason: 'Beschadigd',
      note: 'Glas gebarsten bij aankomst',
    });
    expect(result.current.returnsByOrderId['GD-10234'].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const stored = JSON.parse(window.localStorage.getItem('glassart-returns') ?? '{}');
    expect(stored['GD-10234']).toBeDefined();
  });

  it('keeps existing returns when registering a new one', () => {
    const { result } = renderHook(() => useReturns(), { wrapper: ReturnsProvider });
    act(() => {
      result.current.registerReturn('GD-10234', 'Beschadigd', 'Note A');
    });
    act(() => {
      result.current.registerReturn('GD-10221', 'Anders', 'Note B');
    });
    expect(Object.keys(result.current.returnsByOrderId)).toHaveLength(2);
  });

  it('throws when used outside a ReturnsProvider', () => {
    expect(() => renderHook(() => useReturns())).toThrow(
      'useReturns must be used within a ReturnsProvider'
    );
  });
});
