'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SEGMENTS, getAllImages } from '@/data/segments';
import { AddToCartButton } from './AddToCartButton';

const ALL_FILTER = 'all';

export function ProductsGrid() {
  const tSegments = useTranslations('segments');
  const tCollections = useTranslations('collectionsPage');
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const allImages = useMemo(() => getAllImages(), []);

  const visibleImages =
    activeFilter === ALL_FILTER
      ? allImages
      : allImages.filter((image) => image.segmentSlug === activeFilter);

  function filterButtonClass(isActive: boolean) {
    return isActive
      ? 'rounded-full bg-silver px-4 py-1.5 text-xs tracking-wide text-ink'
      : 'rounded-full border border-white/20 px-4 py-1.5 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white';
  }

  return (
    <>
      <div className="mx-auto mb-8 flex max-w-5xl flex-wrap justify-center gap-2">
        <button
          type="button"
          data-testid="filter-all"
          aria-pressed={activeFilter === ALL_FILTER}
          onClick={() => setActiveFilter(ALL_FILTER)}
          className={filterButtonClass(activeFilter === ALL_FILTER)}
        >
          {tCollections('filterAll')} ({allImages.length})
        </button>
        {SEGMENTS.map((segment) => (
          <button
            key={segment.slug}
            type="button"
            data-testid={`filter-${segment.slug}`}
            aria-pressed={activeFilter === segment.slug}
            onClick={() => setActiveFilter(segment.slug)}
            className={filterButtonClass(activeFilter === segment.slug)}
          >
            {tSegments(`${segment.messageKey}.title`)} ({segment.images.length})
          </button>
        ))}
      </div>

      <div
        data-testid="products-grid"
        className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {visibleImages.map((image) => (
          <div
            key={image.id}
            data-testid="product-card"
            className="relative overflow-hidden rounded border border-white/10"
          >
            <img
              src={image.src}
              alt={tSegments(`${image.segmentMessageKey}.title`)}
              className="aspect-square w-full object-cover"
            />
            <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-2 py-1 text-[0.6rem] uppercase tracking-wide text-white">
              {tSegments(`${image.segmentMessageKey}.title`)}
            </span>
            <AddToCartButton
              segmentSlug={image.segmentSlug}
              segmentMessageKey={image.segmentMessageKey}
              imageSrc={image.src}
            />
          </div>
        ))}
      </div>
    </>
  );
}
