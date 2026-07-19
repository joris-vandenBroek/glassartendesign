'use client';

import { useTranslations } from 'next-intl';
import { GlassPanel } from './GlassPanel';

export function About() {
  const t = useTranslations('about');

  return (
    <GlassPanel className="!max-w-5xl">
      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
        {t('label')}
      </p>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
        {t('text')}
      </p>
    </GlassPanel>
  );
}
