import { useTranslations } from 'next-intl';
import { GlassPanel } from './GlassPanel';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <GlassPanel className="text-center">
      <p className="text-xs tracking-[0.3em] text-white/50">{t('eyebrow')}</p>
      <h1 className="mt-4 text-3xl font-light text-white sm:text-4xl">
        {t('title')}
        <br />
        <span className="bg-gradient-to-r from-silver to-silver-dim bg-clip-text font-semibold text-transparent">
          {t('titleAccent')}
        </span>
      </h1>
      <p className="mt-4 text-xs tracking-[0.15em] text-white/60">
        {t('subtitle')}
      </p>
      <a
        href="#contact"
        className="mt-6 inline-block rounded-sm bg-silver px-6 py-3 text-xs tracking-[0.2em] text-ink"
      >
        {t('cta')}
      </a>
    </GlassPanel>
  );
}
