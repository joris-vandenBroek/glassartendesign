'use client';

import { useTranslations } from 'next-intl';
import { GlassPanel } from './GlassPanel';

const PLACEHOLDER_COUNT = 3;

export function FeaturedWorks() {
  const t = useTranslations('works');

  return (
    <GlassPanel>
      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
        {t('label')}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
          <div
            key={index}
            data-testid="work-placeholder"
            className="aspect-square rounded border border-white/10 bg-gradient-to-br from-graphite to-ink"
          />
        ))}
      </div>
    </GlassPanel>
  );
}
