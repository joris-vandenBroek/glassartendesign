import { getTranslations } from 'next-intl/server';
import { GlassPanel } from '@/components/GlassPanel';
import { Link } from '@/i18n/navigation';
import { SEGMENTS } from '@/data/segments';

export default async function CollectiesPage() {
  const t = await getTranslations('collectionsPage');
  const tSegments = await getTranslations('segments');

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-ink via-charcoal to-graphite px-4 pb-16 pt-24 sm:px-8">
      <GlassPanel className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="text-2xl font-light text-white sm:text-3xl">{t('title')}</h1>
        <p className="mt-3 text-sm text-white/70">{t('intro')}</p>
      </GlassPanel>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SEGMENTS.map((segment) => (
          <Link
            key={segment.slug}
            href={`/collecties/${segment.slug}`}
            data-testid={`collection-tile-${segment.slug}`}
            className="group overflow-hidden rounded-lg border border-white/10 bg-white/5"
          >
            <img
              src={segment.images[0]}
              alt={tSegments(`${segment.messageKey}.title`)}
              className="h-40 w-full object-cover transition group-hover:opacity-80"
            />
            <div className="p-4">
              <h2 className="text-sm font-semibold tracking-wide text-white">
                {tSegments(`${segment.messageKey}.title`)}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
