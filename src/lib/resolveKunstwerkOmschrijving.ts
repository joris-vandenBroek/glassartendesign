import type { Kunstwerk } from '@/components/beheer/materiaalTypes';

export function resolveKunstwerkOmschrijving(kunstwerk: Kunstwerk, locale: string): string {
  const byLocale: Record<string, string> = {
    fr: kunstwerk.omschrijvingFr,
    de: kunstwerk.omschrijvingDe,
    en: kunstwerk.omschrijvingEn,
  };
  return byLocale[locale] || kunstwerk.omschrijvingNl;
}
