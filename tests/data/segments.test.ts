import { describe, expect, it } from 'vitest';
import { SEGMENTS, getSegment, getAllImages } from '@/data/segments';

describe('SEGMENTS', () => {
  it('contains exactly the 6 defined segments in order', () => {
    expect(SEGMENTS.map((s) => s.slug)).toEqual([
      'hotel',
      'restaurant',
      'wellness',
      'office',
      'abstract',
      'artist-collections',
    ]);
  });

  it('gives every segment exactly 6 image URLs', () => {
    for (const segment of SEGMENTS) {
      expect(segment.images).toHaveLength(6);
      for (const url of segment.images) {
        expect(url.startsWith('https://images.unsplash.com/')).toBe(true);
      }
    }
  });

  it('has no duplicate image URLs across segments', () => {
    const allImages = SEGMENTS.flatMap((s) => s.images);
    expect(new Set(allImages).size).toBe(allImages.length);
  });
});

describe('getSegment', () => {
  it('returns the matching segment for a valid slug', () => {
    expect(getSegment('wellness')?.messageKey).toBe('wellness');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getSegment('not-a-real-segment')).toBeUndefined();
  });
});

describe('getAllImages', () => {
  it('returns all 36 images (6 segments × 6 images) tagged with their segment', () => {
    const images = getAllImages();
    expect(images).toHaveLength(36);
    expect(images.filter((img) => img.segmentSlug === 'wellness')).toHaveLength(6);
  });

  it('gives every image a unique id', () => {
    const ids = getAllImages().map((img) => img.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tags each image with the correct messageKey for its segment', () => {
    const artistImages = getAllImages().filter((img) => img.segmentSlug === 'artist-collections');
    expect(artistImages).toHaveLength(6);
    for (const img of artistImages) {
      expect(img.segmentMessageKey).toBe('artistCollections');
    }
  });
});
