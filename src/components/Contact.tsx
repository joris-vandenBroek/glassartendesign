import { useTranslations } from 'next-intl';
import { GlassPanel } from './GlassPanel';

export function Contact() {
  const t = useTranslations('contact');

  return (
    <GlassPanel id="contact" className="text-center">
      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
        {t('label')}
      </p>
      <p className="mt-4 text-sm text-white/80">
        <a
          href={`mailto:${t('email')}`}
          className="underline decoration-white/30"
        >
          {t('email')}
        </a>
        <span className="mx-2 text-white/30">·</span>
        {t('phone')}
      </p>
    </GlassPanel>
  );
}
