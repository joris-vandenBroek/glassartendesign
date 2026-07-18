import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMockAuth } from '@/lib/useMockAuth';

describe('useMockAuth', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts logged out and marks itself hydrated after mount', () => {
    const { result } = renderHook(() => useMockAuth());
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('logs in and persists the state to localStorage', () => {
    const { result } = renderHook(() => useMockAuth());
    act(() => {
      result.current.login();
    });
    expect(result.current.isLoggedIn).toBe(true);
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBe('true');
  });

  it('logs out and clears localStorage', () => {
    const { result } = renderHook(() => useMockAuth());
    act(() => {
      result.current.login();
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.isLoggedIn).toBe(false);
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
  });

  it('reads a pre-existing logged-in state from localStorage on mount', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    const { result } = renderHook(() => useMockAuth());
    expect(result.current.isLoggedIn).toBe(true);
  });
});
