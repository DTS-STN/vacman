import { describe, expect, it } from 'vitest';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { HttpStatusCodes } from '~/errors/http-status-codes';

describe('route-utils', () => {
  describe('i18nRedirect', () => {
    it('should default to English when no language is found', () => {
      const result = i18nRedirect('routes/employee/index.tsx', '');
      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/en/employee');
    });

    it('should redirect to the correct path if language is found', () => {
      const result = i18nRedirect('routes/employee/index.tsx', '/en/');

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/en/employee');
    });

    it('should redirect to the correct path when search params are provided', () => {
      const result = i18nRedirect('routes/employee/index.tsx', '/en/', { search: new URLSearchParams('foo=bar=baz') });

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/en/employee?foo=bar%3Dbaz');
    });

    it('should use language from URL when available', () => {
      const request = new Request('http://example.com/en/', {
        headers: { 'accept-language': 'fr' },
      });
      const result = i18nRedirect('routes/employee/index.tsx', request);

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/en/employee');
    });

    it('should use Accept-Language header when no language in URL', () => {
      const request = new Request('http://example.com/', {
        headers: { 'accept-language': 'fr-CA,fr;q=0.9' },
      });
      const result = i18nRedirect('routes/employee/index.tsx', request);

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/fr/employe');
    });

    it('should default to English when no Accept-Language header', () => {
      const request = new Request('http://example.com/');
      const result = i18nRedirect('routes/employee/index.tsx', request);

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/en/employee');
    });

    it('should use custom default language when specified', () => {
      const request = new Request('http://example.com/');
      const result = i18nRedirect('routes/employee/index.tsx', request, {
        defaultLanguage: 'fr',
      });

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/fr/employe');
    });

    it('should handle search parameters', () => {
      const request = new Request('http://example.com/', {
        headers: { 'accept-language': 'en' },
      });
      const result = i18nRedirect('routes/employee/index.tsx', request, {
        search: new URLSearchParams('test=value'),
      });

      expect(result.status).toBe(HttpStatusCodes.FOUND);
      expect(result.headers.get('location')).toBe('/en/employee?test=value');
    });
  });
});
