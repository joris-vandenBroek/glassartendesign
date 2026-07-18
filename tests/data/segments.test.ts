import { describe, expect, it } from 'vitest';
import { SEGMENTS, getSegment } from '@/data/segments';

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
