'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';
import { detectLocale } from '@/lib/detectLocale';
import { BASE_PATH } from '@/lib/basePath';

export default function RootRedirectPage() {
  useEffect(() => {
    const locale = detectLocale(
      navigator.languages ?? [navigator.language],
      routing.locales,
      routing.defaultLocale
    );
    window.location.replace(`${BASE_PATH}/${locale}/`);
  }, []);

  return null;
}
