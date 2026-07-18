'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SEGMENTS } from '@/data/segments';
import { useMockAuth } from '@/lib/useMockAuth';
import { BASE_PATH } from '@/lib/basePath';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AccountMenu } from './AccountMenu';

export function NavBar() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const tSegments = useTranslations('segments');
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const { isLoggedIn, isHydrated, login } = useMockAuth();
  const contactHref = `${BASE_PATH}/${locale}/#contact`;

  return (
    <nav
      data-testid="navbar"
      className="fixed left-0 top-0 z-40 flex w-full flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-sm sm:px-8"
    >
      <div className="flex items-center gap-6 text-xs tracking-[0.15em] text-white/70">
        <Link href="/" data-testid="nav-home" className="hover:text-white">
          {t('home')}
        </Link>
        <div
          data-testid="collections-trigger"
          className="relative"
          onMouseEnter={() => setIsCollectionsOpen(true)}
          onMouseLeave={() => setIsCollectionsOpen(false)}
        >
          <Link href="/collecties" data-testid="nav-collections" className="hover:text-white">
            {t('collections')}
          </Link>
          {isCollectionsOpen && (
            // Zero-gap outer box: its own padding (not a margin on a
            // sibling) keeps the hoverable area continuous from the
            // trigger link down into the visible panel, so moving the
            // mouse through the visual gap never leaves this element and
            // never fires the wrapper's onMouseLeave early.
            <div className="absolute left-0 top-full pt-2">
              <div
                data-testid="collections-dropdown"
                className="flex flex-col gap-1 rounded-md border border-white/10 bg-black/90 p-2"
              >
                {SEGMENTS.map((segment) => (
                  <Link
                    key={segment.slug}
                    href={`/collecties/${segment.slug}`}
                    data-testid={`nav-segment-${segment.slug}`}
                    className="whitespace-nowrap rounded px-3 py-1.5 hover:bg-white/10 hover:text-white"
                  >
                    {tSegments(`${segment.messageKey}.title`)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <a href={contactHref} data-testid="nav-contact" className="hover:text-white">
          {t('contact')}
        </a>
      </div>

      <div className="flex items-center gap-3">
        {isHydrated && isLoggedIn ? (
          <AccountMenu />
        ) : (
          <>
            <a
              href={contactHref}
              data-testid="nav-become-client"
              className="hidden text-xs tracking-[0.15em] text-white/70 hover:text-white sm:inline"
            >
              {t('becomeClient')}
            </a>
            <button
              type="button"
              data-testid="nav-login"
              onClick={login}
              className="rounded-sm bg-silver px-4 py-2 text-xs tracking-[0.15em] text-ink"
            >
              {t('login')}
            </button>
          </>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
