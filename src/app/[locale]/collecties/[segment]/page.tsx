import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GlassPanel } from '@/components/GlassPanel';
import { getSegment, SEGMENTS } from '@/data/segments';

export function generateStaticParams() {
  return SEGMENTS.map((segment) => ({ segment: segment.slug }));
}

export default async function SegmentPage({
  params,
}: {
  params: { locale: string; segment: string };
}) {
  const { locale, segment: slug } = params;
  setRequestLocale(locale);
  const segment = getSegment(slug);
  if (!segment) {
    notFound();
  }

  const t = await getTranslations(`segments.${segment.messageKey}`);
  const tNav = await getTranslations('nav');
  const contactHref = `/${locale}/#contact`;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-ink via-charcoal to-graphite px-4 pb-16 pt-24 sm:px-8">
      <GlassPanel className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="text-2xl font-light text-white sm:text-3xl">{t('title')}</h1>
        <p className="mt-3 text-sm text-white/70">{t('intro')}</p>
      </GlassPanel>

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3">
        {segment.images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`${t('title')} ${index + 1}`}
            data-testid="segment-image"
            className="aspect-square w-full rounded border border-white/10 object-cover"
          />
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-3xl text-center">
        <a
          href={contactHref}
          data-testid="segment-cta"
          className="inline-block rounded-sm bg-silver px-6 py-3 text-xs tracking-[0.2em] text-ink"
        >
          {tNav('becomeClient')}
        </a>
      </div>
    </main>
  );
}
