'use client';

import { useTranslations } from 'next-intl';
import { GlassPanel } from './GlassPanel';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <GlassPanel className="!max-w-5xl text-center">
      <p className="text-xs tracking-[0.3em] text-white/50">{t('eyebrow')}</p>
      <h1 className="mt-4 text-3xl font-light text-white sm:text-4xl">{t('title')}</h1>
      <p className="mt-4 text-xs tracking-[0.15em] text-white/60">
        {t('subtitle')}
      </p>
    </GlassPanel>
  );
}
