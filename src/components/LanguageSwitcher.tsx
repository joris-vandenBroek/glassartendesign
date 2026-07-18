'use client';

import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALE_LABELS: Record<string, string> = {
  nl: 'NL',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
};

export function LanguageSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      data-testid="language-switcher"
      className="flex gap-1 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-sm"
    >
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          data-testid={`language-option-${locale}`}
          aria-current={locale === activeLocale ? 'true' : undefined}
          disabled={locale === activeLocale}
          onClick={() => router.replace(pathname, { locale })}
          className={`rounded-full px-2 py-1 text-xs tracking-wide ${
            locale === activeLocale
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
