export interface LocaleMeta {
  label: string;
  flag: string;
}

export const LOCALE_META: Record<string, LocaleMeta> = {
  nl: { label: 'NL', flag: '🇳🇱' },
  en: { label: 'EN', flag: '🇬🇧' },
  de: { label: 'DE', flag: '🇩🇪' },
  fr: { label: 'FR', flag: '🇫🇷' },
};
