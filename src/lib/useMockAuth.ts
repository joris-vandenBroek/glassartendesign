'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'glassart-mock-logged-in';

export function useMockAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsLoggedIn(window.localStorage.getItem(STORAGE_KEY) === 'true');
    setIsHydrated(true);
  }, []);

  const login = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
  }, []);

  return { isLoggedIn, isHydrated, login, logout };
}
