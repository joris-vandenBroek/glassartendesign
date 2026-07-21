import type { Materiaal, Materiaalsoort } from '@/components/beheer/materiaalTypes';

export const MATERIAALSOORTEN_SEED: Omit<Materiaalsoort, 'id'>[] = [
  { omschrijving: 'Veiligheidsglas' },
  { omschrijving: 'Dibond' },
  { omschrijving: 'Acryl' },
  { omschrijving: 'Akoestische stof' },
];

const MATERIAAL_SEED_BY_SOORT: Record<string, { materiaaldikte: number; omschrijving: string }[]> = {
  Veiligheidsglas: [
    { materiaaldikte: 4, omschrijving: 'Onze specialiteit. Kristalhelder, sterk en veilig.' },
  ],
  Dibond: [
    { materiaaldikte: 3, omschrijving: 'Lichtgewicht, stijf en vormvast met een matte uitstraling.' },
  ],
  Acryl: [
    { materiaaldikte: 3, omschrijving: 'Licht en helder met een luxe glanzende look.' },
    { materiaaldikte: 5, omschrijving: 'Extra diepte en stevigheid voor een indrukwekkend effect.' },
    { materiaaldikte: 10, omschrijving: 'Maximale diepwerking voor exclusieve presentatie.' },
  ],
  'Akoestische stof': [
    { materiaaldikte: 0, omschrijving: 'Verbetert de akoestiek en geeft een warme, moderne uitstraling.' },
  ],
};

export function buildMaterialenSeed(materiaalsoorten: Materiaalsoort[]): Omit<Materiaal, 'id'>[] {
  return materiaalsoorten.flatMap((soort) =>
    (MATERIAAL_SEED_BY_SOORT[soort.omschrijving] ?? []).map((entry) => ({
      materiaalsoortId: soort.id,
      materiaaldikte: entry.materiaaldikte,
      omschrijving: entry.omschrijving,
    }))
  );
}
