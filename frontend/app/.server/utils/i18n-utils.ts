/**
 * Extracts the preferred supported language from the Accept-Language header.
 *
 * @param request - The incoming request containing the Accept-Language header
 * @returns The preferred language code ('en' or 'fr'), or undefined if no supported language is found
 */
export function getAcceptLanguageHeader(request: Request): Language | undefined {
  const acceptLanguage = request.headers.get('accept-language');

  if (!acceptLanguage) {
    return undefined;
  }

  // Parse the Accept-Language header and extract language codes with their quality values
  const languages = acceptLanguage
    .split(',')
    .map((lang: string) => {
      const [code, qValue] = lang.trim().split(';q=');
      if (!code) return { language: '', quality: 0 };

      const language = code.split('-')[0]?.toLowerCase() ?? '';
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { language, quality };
    })
    .filter(({ language }: { language: string; quality: number }) => language) // Remove any entries where language is empty
    .sort((a: { language: string; quality: number }, b: { language: string; quality: number }) => b.quality - a.quality); // Sort by quality descending

  // Find the first supported language (en or fr)
  for (const { language } of languages) {
    if (language === 'en' || language === 'fr') {
      return language;
    }
  }

  return undefined;
}
