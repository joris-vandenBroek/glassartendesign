'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCustomerAuth } from '@/lib/useCustomerAuth';

export function BecomeClientCta() {
  const t = useTranslations('nav');
  const { isHydrated, isCustomer } = useCustomerAuth();

  if (isHydrated && isCustomer) {
    return null;
  }

  return (
    <Link
      href="/word-klant"
      data-testid="segment-cta"
      className="inline-block rounded-sm bg-silver px-6 py-3 text-xs tracking-[0.2em] text-ink"
    >
      {t('becomeClient')}
    </Link>
  );
}
