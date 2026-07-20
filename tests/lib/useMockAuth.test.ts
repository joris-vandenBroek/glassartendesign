import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMockAuth, MockAuthProvider } from '@/lib/useMockAuth';

describe('useMockAuth', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts logged out and marks itself hydrated after mount', () => {
    const { result } = renderHook(() => useMockAuth(), { wrapper: MockAuthProvider });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.email).toBeNull();
    expect(result.current.uid).toBeNull();
  });

  it('logs in with an email/uid and persists them to localStorage', () => {
    const { result } = renderHook(() => useMockAuth(), { wrapper: MockAuthProvider });
    act(() => {
      result.current.login('klant@example.com', 'uid-123');
    });
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.email).toBe('klant@example.com');
    expect(result.current.uid).toBe('uid-123');
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBe('true');
    expect(window.localStorage.getItem('glassart-mock-email')).toBe('klant@example.com');
    expect(window.localStorage.getItem('glassart-mock-uid')).toBe('uid-123');
  });

  it('logs out and clears localStorage', () => {
    const { result } = renderHook(() => useMockAuth(), { wrapper: MockAuthProvider });
    act(() => {
      result.current.login('klant@example.com', 'uid-123');
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.email).toBeNull();
    expect(result.current.uid).toBeNull();
    expect(window.localStorage.getItem('glassart-mock-logged-in')).toBeNull();
    expect(window.localStorage.getItem('glassart-mock-email')).toBeNull();
    expect(window.localStorage.getItem('glassart-mock-uid')).toBeNull();
  });

  it('reads a pre-existing logged-in state from localStorage on mount', () => {
    window.localStorage.setItem('glassart-mock-logged-in', 'true');
    window.localStorage.setItem('glassart-mock-email', 'klant@example.com');
    window.localStorage.setItem('glassart-mock-uid', 'uid-123');
    const { result } = renderHook(() => useMockAuth(), { wrapper: MockAuthProvider });
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.email).toBe('klant@example.com');
    expect(result.current.uid).toBe('uid-123');
  });
});
