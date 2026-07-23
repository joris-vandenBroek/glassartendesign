import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface KunstwerkSpecCardProps {
  fotoSlot?: ReactNode;
  naam: string;
  artiest?: string;
  materiaalLabels: string[];
  maatLabels: string[];
}

export function KunstwerkSpecCard({ fotoSlot, naam, artiest, materiaalLabels, maatLabels }: KunstwerkSpecCardProps) {
  const t = useTranslations('kunstwerkSpecCard');

  return (
    <div data-testid="kunstwerk-spec-card" className="overflow-hidden rounded-lg border border-white/10 bg-white text-ink">
      {fotoSlot}
      <div className="flex flex-col gap-2 px-5 py-6 text-center">
        <h3 data-testid="kunstwerk-spec-card-naam" className="font-head text-lg font-semibold tracking-wide">
          {naam || '—'}
        </h3>
        {artiest && (
          <p data-testid="kunstwerk-spec-card-artiest" className="text-xs text-ink/60">
            {artiest}
          </p>
        )}
        <hr className="my-2 border-ink/10" />
        <dl className="flex flex-col gap-1 text-xs text-ink/70">
          {materiaalLabels.length > 0 && (
            <div data-testid="kunstwerk-spec-card-materiaal" className="flex items-baseline justify-between gap-2">
              <dt className="font-semibold">{t('materiaal')}</dt>
              <dd>{materiaalLabels.join(' | ')}</dd>
            </div>
          )}
          {maatLabels.length > 0 && (
            <div data-testid="kunstwerk-spec-card-formaten" className="flex items-baseline justify-between gap-2">
              <dt className="font-semibold">{t('formaten')}</dt>
              <dd>{maatLabels.join(' | ')}</dd>
            </div>
          )}
        </dl>
        <hr className="my-2 border-ink/10" />
        <p className="text-sm font-bold uppercase tracking-[0.2em]">Glassart &amp; Design</p>
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-ink/50">{t('tagline')}</p>
      </div>
    </div>
  );
}
