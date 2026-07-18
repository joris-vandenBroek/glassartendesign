import { describe, expect, it } from 'vitest';
import { STANDARD_SIZES } from '@/data/sizes';

describe('STANDARD_SIZES', () => {
  it('contains exactly the 3 standard sizes in order', () => {
    expect(STANDARD_SIZES).toEqual(['40x60cm', '60x90cm', '80x120cm']);
  });
});
