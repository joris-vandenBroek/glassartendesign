'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_META } from '@/lib/localeMeta';

export function LanguageSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleSelect(locale: string) {
    router.replace(pathname, { locale });
    setIsOpen(false);
  }

  const active = LOCALE_META[activeLocale];

  return (
    <div ref={containerRef} data-testid="language-switcher" className="relative">
      <button
        type="button"
        data-testid="language-switcher-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs tracking-wide text-white/80 backdrop-blur-sm hover:text-white"
      >
        <span aria-hidden="true">{active.flag}</span>
        <span>{active.label}</span>
        <span aria-hidden="true" className="text-[0.6rem]">
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          data-testid="language-switcher-menu"
          className="absolute right-0 top-full mt-2 flex flex-col gap-1 rounded-md border border-white/10 bg-black/90 p-2"
        >
          {routing.locales.map((locale) => (
            <button
              key={locale}
              type="button"
              data-testid={`language-option-${locale}`}
              aria-current={locale === activeLocale ? 'true' : undefined}
              disabled={locale === activeLocale}
              onClick={() => handleSelect(locale)}
              className={`flex items-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-xs tracking-wide ${
                locale === activeLocale
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span aria-hidden="true">{LOCALE_META[locale].flag}</span>
              <span>{LOCALE_META[locale].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
