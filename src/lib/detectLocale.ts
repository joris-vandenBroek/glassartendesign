export function detectLocale(
  browserLanguages: readonly string[],
  supportedLocales: readonly string[],
  fallbackLocale: string
): string {
  for (const browserLanguage of browserLanguages) {
    const shortLanguage = browserLanguage.slice(0, 2).toLowerCase();
    const match = supportedLocales.find((locale) => locale === shortLanguage);
    if (match) {
      return match;
    }
  }
  return fallbackLocale;
}
