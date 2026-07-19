'use client';

import { useTranslations } from 'next-intl';
import { GlassPanel } from './GlassPanel';
import { MATERIALS } from '@/data/materials';

const USP_KEYS = ['quality', 'safetyGlass', 'uvResistant', 'sharpDetails', 'durable'] as const;

function DiamondIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 4 L34 16 L20 36 L6 16 Z" fill="none" className="stroke-gold" strokeWidth={2.5} />
      <path d="M6 16 L34 16" className="stroke-gold" strokeWidth={1.5} />
      <path d="M15 16 L20 4 M25 16 L20 4" className="stroke-gold" strokeWidth={1.5} />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 4 L34 10 V20 C34 28 28 34 20 37 C12 34 6 28 6 20 V10 Z"
        fill="none"
        className="stroke-gold"
        strokeWidth={2.5}
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="8" fill="none" className="stroke-gold" strokeWidth={2.5} />
      <g className="stroke-gold" strokeWidth={2} strokeLinecap="round">
        <line x1="20" y1="2" x2="20" y2="8" />
        <line x1="20" y1="32" x2="20" y2="38" />
        <line x1="2" y1="20" x2="8" y2="20" />
        <line x1="32" y1="20" x2="38" y2="20" />
        <line x1="7" y1="7" x2="11" y2="11" />
        <line x1="29" y1="29" x2="33" y2="33" />
        <line x1="33" y1="7" x2="29" y2="11" />
        <line x1="11" y1="29" x2="7" y2="33" />
      </g>
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="5" y="5" width="30" height="30" fill="none" className="stroke-gold" strokeWidth={2.5} />
      <g className="stroke-gold" strokeWidth={1.5}>
        <line x1="5" y1="15" x2="35" y2="15" />
        <line x1="5" y1="25" x2="35" y2="25" />
        <line x1="15" y1="5" x2="15" y2="35" />
        <line x1="25" y1="5" x2="25" y2="35" />
      </g>
    </svg>
  );
}

function FeatherIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 36 C20 36 8 28 8 16 C8 8 14 4 20 10 C26 4 32 8 32 16 C32 28 20 36 20 36 Z"
        fill="none"
        className="stroke-gold"
        strokeWidth={2.5}
      />
      <path d="M20 10 L20 30" className="stroke-gold" strokeWidth={1.5} />
    </svg>
  );
}

const USP_ICONS: Record<(typeof USP_KEYS)[number], () => JSX.Element> = {
  quality: DiamondIcon,
  safetyGlass: ShieldIcon,
  uvResistant: SunIcon,
  sharpDetails: GridIcon,
  durable: FeatherIcon,
};

export function WhyUs() {
  const t = useTranslations('whyUs');

  return (
    <GlassPanel>
      <p className="text-center text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
        {t('title')}
      </p>

      <div data-testid="usp-row" className="mt-6 flex flex-wrap justify-center gap-8">
        {USP_KEYS.map((key) => {
          const Icon = USP_ICONS[key];
          return (
            <div
              key={key}
              data-testid={`usp-${key}`}
              className="flex w-24 flex-col items-center text-center"
            >
              <Icon />
              <p className="mt-2 text-[0.65rem] leading-tight text-white/70">{t(`usp.${key}`)}</p>
            </div>
          );
        })}
      </div>

      <div data-testid="materials-grid" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MATERIALS.map((material) => (
          <div
            key={material.id}
            data-testid={`material-${material.id}`}
            className="rounded-md border border-white/10 bg-graphite/60 p-4 text-center"
          >
            <p className="text-xs font-semibold text-white">
              {t(`materials.${material.messageKey}.name`)}
            </p>
            <p className="mt-1 text-[0.65rem] text-white/60">
              {t(`materials.${material.messageKey}.description`)}
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
