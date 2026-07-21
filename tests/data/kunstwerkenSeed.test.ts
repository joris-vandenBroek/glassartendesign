import { describe, expect, it } from 'vitest';
import {
  SEGMENTEN_SEED,
  MATEN_SEED,
  berekenVoorbeeldprijs,
  buildKunstwerkenSeed,
} from '@/data/kunstwerkenSeed';
import type { Segment, Materiaal, Maat } from '@/components/beheer/materiaalTypes';

describe('SEGMENTEN_SEED', () => {
  it('contains the 6 segments from the homepage collections', () => {
    expect(SEGMENTEN_SEED).toEqual([
      { omschrijving: 'Hotel' },
      { omschrijving: 'Restaurant' },
      { omschrijving: 'Wellness' },
      { omschrijving: 'Office' },
      { omschrijving: 'Abstract' },
      { omschrijving: 'Artist Collections' },
    ]);
  });
});

describe('MATEN_SEED', () => {
  it('contains the 3 existing standard sizes', () => {
    expect(MATEN_SEED).toEqual([
      { breedte: 40, hoogte: 60 },
      { breedte: 60, hoogte: 90 },
      { breedte: 80, hoogte: 120 },
    ]);
  });
});

describe('berekenVoorbeeldprijs', () => {
  it('computes a price from surface area (cm² -> m²) plus a dikte surcharge', () => {
    // oppervlakte = (40*60)/10000 = 0.24 m²; 0.24 * 120 = 28.8; diktetoeslag = 4*5 = 20; totaal 48.8
    expect(berekenVoorbeeldprijs(4, 40, 60)).toBe(48.8);
  });

  it('is deterministic for the same inputs', () => {
    expect(berekenVoorbeeldprijs(3, 80, 120)).toBe(berekenVoorbeeldprijs(3, 80, 120));
  });

  it('produces a higher price for a larger maat', () => {
    expect(berekenVoorbeeldprijs(3, 80, 120)).toBeGreaterThan(berekenVoorbeeldprijs(3, 40, 60));
  });
});

describe('buildKunstwerkenSeed', () => {
  const SEGMENTEN: Segment[] = [
    { id: 'seg-hotel', omschrijving: 'Hotel' },
    { id: 'seg-restaurant', omschrijving: 'Restaurant' },
  ];
  const MATERIALEN: Materiaal[] = [
    { id: 'mat-b', materiaalsoortId: 'soort-1', materiaaldikte: 3, omschrijving: 'B' },
    { id: 'mat-a', materiaalsoortId: 'soort-1', materiaaldikte: 4, omschrijving: 'A' },
    { id: 'mat-c', materiaalsoortId: 'soort-1', materiaaldikte: 5, omschrijving: 'C' },
  ];
  const MATEN: Maat[] = [
    { id: 'maat-y', breedte: 60, hoogte: 90 },
    { id: 'maat-x', breedte: 40, hoogte: 60 },
    { id: 'maat-z', breedte: 80, hoogte: 120 },
  ];

  it('builds one kunstwerk per photo across only the recognized segments', () => {
    const result = buildKunstwerkenSeed(SEGMENTEN, MATERIALEN, MATEN);
    expect(result.length).toBe(12); // 2 segments * 6 photos each, unrecognized segments in the source data are skipped
  });

  it('assigns each kunstwerk to the correct segment via segmentIds', () => {
    const result = buildKunstwerkenSeed(SEGMENTEN, MATERIALEN, MATEN);
    const hotelCount = result.filter((k) => k.segmentIds.includes('seg-hotel')).length;
    expect(hotelCount).toBe(6);
  });

  it('picks the 2 lowest-id materialen and 2 lowest-id maten deterministically, regardless of input array order', () => {
    const result = buildKunstwerkenSeed(SEGMENTEN, MATERIALEN, MATEN);
    result.forEach((kunstwerk) => {
      expect(kunstwerk.materiaalIds).toEqual(['mat-a', 'mat-b']);
      expect(kunstwerk.maatIds).toEqual(['maat-x', 'maat-y']);
      expect(kunstwerk.prijzen.length).toBe(4);
    });
  });

  it('computes each prijzen entry via berekenVoorbeeldprijs for its materiaal/maat combination', () => {
    const result = buildKunstwerkenSeed(SEGMENTEN, MATERIALEN, MATEN);
    const eersteRegel = result[0].prijzen.find((p) => p.materiaalId === 'mat-a' && p.maatId === 'maat-x');
    expect(eersteRegel?.prijs).toBe(berekenVoorbeeldprijs(4, 40, 60));
  });

  it('gives each kunstwerk a Dutch placeholder description numbered within its segment, and empty fr/de/en', () => {
    const result = buildKunstwerkenSeed(SEGMENTEN, MATERIALEN, MATEN);
    const hotelDescriptions = result.filter((k) => k.segmentIds.includes('seg-hotel')).map((k) => k.omschrijvingNl);
    expect(hotelDescriptions).toEqual([
      'Hotel paneel 1',
      'Hotel paneel 2',
      'Hotel paneel 3',
      'Hotel paneel 4',
      'Hotel paneel 5',
      'Hotel paneel 6',
    ]);
    expect(result[0].omschrijvingFr).toBe('');
    expect(result[0].omschrijvingDe).toBe('');
    expect(result[0].omschrijvingEn).toBe('');
  });

  it('returns an empty array when there are fewer than 2 materialen or fewer than 2 maten', () => {
    expect(buildKunstwerkenSeed(SEGMENTEN, [MATERIALEN[0]], MATEN)).toEqual([]);
    expect(buildKunstwerkenSeed(SEGMENTEN, MATERIALEN, [MATEN[0]])).toEqual([]);
  });
});
