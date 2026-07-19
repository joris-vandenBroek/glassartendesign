import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MockProfileProvider, useMockProfile } from '@/lib/useMockProfile';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useMockProfile', () => {
  it('seeds a default profile and is hydrated after mount', () => {
    const { result } = renderHook(() => useMockProfile(), { wrapper: MockProfileProvider });
    expect(result.current.isHydrated).toBe(true);
    expect(result.current.profile.companyName).toBe('Hotel De Zilveren Zwaan');
    expect(result.current.profile.contactPreference).toBe('email');
    expect(result.current.profile.languagePreference).toBe('nl');
  });

  it('updates and persists a partial profile change', () => {
    const { result } = renderHook(() => useMockProfile(), { wrapper: MockProfileProvider });
    act(() => {
      result.current.updateProfile({ email: 'nieuw@example.com', languagePreference: 'en' });
    });
    expect(result.current.profile.email).toBe('nieuw@example.com');
    expect(result.current.profile.languagePreference).toBe('en');
    expect(result.current.profile.companyName).toBe('Hotel De Zilveren Zwaan');
    const stored = JSON.parse(window.localStorage.getItem('glassart-mock-profile') ?? '{}');
    expect(stored.email).toBe('nieuw@example.com');
  });

  it('restores a previously saved profile from localStorage on mount', () => {
    window.localStorage.setItem(
      'glassart-mock-profile',
      JSON.stringify({ companyName: 'Restored BV' })
    );
    const { result } = renderHook(() => useMockProfile(), { wrapper: MockProfileProvider });
    expect(result.current.profile.companyName).toBe('Restored BV');
  });

  it('throws when used outside a MockProfileProvider', () => {
    expect(() => renderHook(() => useMockProfile())).toThrow(
      'useMockProfile must be used within a MockProfileProvider'
    );
  });
});
