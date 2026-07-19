'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'glassart-mock-profile';

export type ContactPreference = 'email' | 'phone' | 'whatsapp';
export type LanguagePreference = 'nl' | 'en' | 'de' | 'fr';

export interface MockProfile {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  contactPreference: ContactPreference;
  languagePreference: LanguagePreference;
  password: string;
}

const DEFAULT_PROFILE: MockProfile = {
  companyName: 'Hotel De Zilveren Zwaan',
  contactPerson: 'Anne de Vries',
  email: 'anne@dezilverenzwaan.nl',
  phone: '0612345678',
  address: 'Kerkstraat 12',
  postcode: '1234 AB',
  city: 'Amsterdam',
  contactPreference: 'email',
  languagePreference: 'nl',
  password: 'geheim123',
};

interface MockProfileValue {
  profile: MockProfile;
  isHydrated: boolean;
  updateProfile: (partial: Partial<MockProfile>) => void;
}

const MockProfileContext = createContext<MockProfileValue | null>(null);

export function MockProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<MockProfile>(DEFAULT_PROFILE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
      } catch {
        setProfile(DEFAULT_PROFILE);
      }
    }
    setIsHydrated(true);
  }, []);

  const updateProfile = useCallback((partial: Partial<MockProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...partial };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ profile, isHydrated, updateProfile }),
    [profile, isHydrated, updateProfile]
  );

  return <MockProfileContext.Provider value={value}>{children}</MockProfileContext.Provider>;
}

export function useMockProfile(): MockProfileValue {
  const context = useContext(MockProfileContext);
  if (!context) {
    throw new Error('useMockProfile must be used within a MockProfileProvider');
  }
  return context;
}
