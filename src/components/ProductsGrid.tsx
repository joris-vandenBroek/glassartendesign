'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SEGMENTS, getAllImages, type SegmentImage } from '@/data/segments';
import { ProductModal } from './ProductModal';

const ALL_FILTER = 'all';

export function ProductsGrid() {
  const tSegments = useTranslations('segments');
  const tCollections = useTranslations('collectionsPage');
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [selectedImage, setSelectedImage] = useState<SegmentImage | null>(null);
  const allImages = useMemo(() => getAllImages(), []);

  const visibleImages =
    activeFilter === ALL_FILTER
      ? allImages
      : allImages.filter((image) => image.segmentSlug === activeFilter);

  function filterButtonClass(isActive: boolean) {
    return isActive
      ? 'rounded-full bg-silver px-4 py-1.5 text-xs font-head tracking-wide text-ink'
      : 'rounded-full border border-white/20 px-4 py-1.5 text-xs font-head tracking-wide text-white/70 hover:border-gold/40 hover:text-gold';
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
            role="button"
            tabIndex={0}
            aria-label={tSegments(`${image.segmentMessageKey}.title`)}
            onClick={() => setSelectedImage(image)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                if (event.key === ' ') {
                  event.preventDefault();
                }
                setSelectedImage(image);
              }
            }}
            className="group relative cursor-pointer overflow-hidden rounded border border-white/10 transition hover:-translate-y-1"
          >
            <img
              src={image.src}
              alt={tSegments(`${image.segmentMessageKey}.title`)}
              className="aspect-square w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="badge-gold absolute left-2 top-2">
              {tSegments(`${image.segmentMessageKey}.title`)}
            </span>
          </div>
        ))}
      </div>

      <ProductModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}
