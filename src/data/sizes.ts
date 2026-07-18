export const STANDARD_SIZES = ['40x60cm', '60x90cm', '80x120cm'] as const;

export type StandardSize = (typeof STANDARD_SIZES)[number];
