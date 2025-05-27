import type { RouteModule } from 'react-router';

import type { Namespace } from 'i18next';

/**
 * Returns the i81n namespace required by the given routes by examining the route's i18nNamespace handle property.
 * @see https://reactrouter.com/start/framework/route-module#handle
 */
export function getI18nNamespace(routes?: RouteModule[]): Namespace {
  const i18nNamespace = routes?.flatMap((route) => route.handle?.i18nNamespace ?? []);
  return Array.from(new Set(i18nNamespace));
}

/**
 * Returns the language from the given request, URL, or path.
 *
 * @param resource - The request, URL, or path to extract the language from.
 * @returns The language code (`en` or `fr`), or `undefined` if the language cannot be determined.
 */
export function getLanguage(resource: Request | URL | string): Language | undefined {
  switch (true) {
    case resource instanceof Request: {
      return getLanguageFromPath(new URL(resource.url).pathname);
    }

    case resource instanceof URL: {
      return getLanguageFromPath(resource.pathname);
    }

    default: {
      return getLanguageFromPath(resource);
    }
  }
}

/**
 * Returns the alternate language for the given input language.
 * (ie: 'en' → 'fr'; 'fr' → 'en')
 */
export function getAltLanguage(language: Language): Language {
  return language === 'fr' ? 'en' : 'fr';
}

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

function getLanguageFromPath(pathname: string): Language | undefined {
  switch (true) {
    case pathname === '/en' || pathname.startsWith('/en/'): {
      return 'en';
    }

    case pathname === '/fr' || pathname.startsWith('/fr/'): {
      return 'fr';
    }

    default: {
      return undefined;
    }
  }
}
