'use client';

import { useTranslations } from 'next-intl';
import { useMockAuth } from '@/lib/useMockAuth';

export function BecomeClientCta({ contactHref }: { contactHref: string }) {
  const t = useTranslations('nav');
  const { isHydrated, isLoggedIn } = useMockAuth();

  if (isHydrated && isLoggedIn) {
    return null;
  }

  return (
    <a
      href={contactHref}
      data-testid="segment-cta"
      className="inline-block rounded-sm bg-silver px-6 py-3 text-xs tracking-[0.2em] text-ink"
    >
      {t('becomeClient')}
    </a>
  );
}
