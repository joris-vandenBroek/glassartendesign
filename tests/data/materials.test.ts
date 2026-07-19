import { describe, expect, it } from 'vitest';
import { MATERIALS } from '@/data/materials';

describe('MATERIALS', () => {
  it('contains exactly the 6 materials from the brochure, in order', () => {
    expect(MATERIALS.map((material) => material.id)).toEqual([
      'safety-glass',
      'dibond',
      'acrylic-3',
      'acrylic-5',
      'acrylic-10',
      'acoustic-fabric',
    ]);
  });

  it('gives each material a matching messageKey', () => {
    expect(MATERIALS.map((material) => material.messageKey)).toEqual([
      'safetyGlass',
      'dibond',
      'acrylic3',
      'acrylic5',
      'acrylic10',
      'acousticFabric',
    ]);
  });
});
