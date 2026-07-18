import { describe, expect, it } from 'vitest';
import { detectLocale } from '@/lib/detectLocale';

describe('detectLocale', () => {
  it('returns the matching supported locale from the browser languages', () => {
    expect(detectLocale(['de-DE', 'de'], ['nl', 'en', 'de', 'fr'], 'nl')).toBe(
      'de'
    );
  });

  it('falls back to the default locale when no browser language matches', () => {
    expect(detectLocale(['es-ES', 'it'], ['nl', 'en', 'de', 'fr'], 'nl')).toBe(
      'nl'
    );
  });

  it('matches the first supported language in browser preference order', () => {
    expect(
      detectLocale(['fr-BE', 'en-US'], ['nl', 'en', 'de', 'fr'], 'nl')
    ).toBe('fr');
  });
});
