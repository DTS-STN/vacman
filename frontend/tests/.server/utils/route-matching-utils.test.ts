/**
 * Tests for route matching utilities.
 * This module tests the functions that identify and parse different URL patterns.
 */
import { describe, it, expect } from 'vitest';

import { extractUserIdFromProfileRoute, isEmployeeRoute, isHiringManagerPath, isPrivacyConsentPath, isProfileRoute } from '~/.server/utils/route-matching-utils';

describe('Route Matching Utils', () => {
  describe('isProfileRoute', () => {
    it('should return true for English profile routes', () => {
      const urls = [
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/employee/test-user-123/profile/',
        'http://localhost:3000/en/employee/user@example.com/profile',
        'http://localhost:3000/en/employee/test-user-123/profile/personal-information',
        'http://localhost:3000/en/employee/test-user-123/profile/application-history',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isProfileRoute(url)).toBe(true);
      });
    });

    it('should return true for French profile routes', () => {
      const urls = [
        'http://localhost:3000/fr/employe/test-user-123/profil',
        'http://localhost:3000/fr/employe/test-user-123/profil/',
        'http://localhost:3000/fr/employe/utilisateur@example.com/profil',
        'http://localhost:3000/fr/employe/test-user-123/profil/information-personnelle',
        'http://localhost:3000/fr/employe/test-user-123/profil/historique-des-demandes',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isProfileRoute(url)).toBe(true);
      });
    });

    it('should return false for non-profile routes', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/privacy-consent',
        'http://localhost:3000/en/employee/privacy-consent',
        'http://localhost:3000/en/hiring-manager',
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/test-user-123',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isProfileRoute(url)).toBe(false);
      });
    });

    it('should return false for similar but incorrect patterns', () => {
      const urls = [
        'http://localhost:3000/en/employees/test-user-123/profile', // Wrong plural form
        'http://localhost:3000/en/employee/test-user-123/profiles', // Wrong plural form
        'http://localhost:3000/en/employment/test-user-123/profile', // Wrong path segment
        'http://localhost:3000/en/employee/profile/test-user-123', // Wrong order
        'http://localhost:3000/employee/test-user-123/profile', // Missing language prefix
        'http://localhost:3000/fr/employes/test-user-123/profil', // Wrong plural form
        'http://localhost:3000/fr/employe/test-user-123/profils', // Wrong plural form
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isProfileRoute(url)).toBe(false);
      });
    });
  });

  describe('extractUserIdFromProfileRoute', () => {
    it('should extract user ID from English profile routes', () => {
      const testCases = [
        {
          url: 'http://localhost:3000/en/employee/test-user-123/profile',
          expected: 'test-user-123',
        },
        {
          url: 'http://localhost:3000/en/employee/user@example.com/profile',
          expected: 'user@example.com',
        },
        {
          url: 'http://localhost:3000/en/employee/12345/profile/personal-information',
          expected: '12345',
        },
        {
          url: 'http://localhost:3000/en/employee/test-user-456/profile/',
          expected: 'test-user-456',
        },
        {
          url: 'http://localhost:3000/en/employee/complex-uuid-123-456-789/profile/referral-preferences',
          expected: 'complex-uuid-123-456-789',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = extractUserIdFromProfileRoute(new URL(url));
        expect(result.isSome()).toBe(true);
        expect(result.unwrap()).toBe(expected);
      });
    });

    it('should extract user ID from French profile routes', () => {
      const testCases = [
        {
          url: 'http://localhost:3000/fr/employe/test-user-123/profil',
          expected: 'test-user-123',
        },
        {
          url: 'http://localhost:3000/fr/employe/utilisateur@domaine.com/profil',
          expected: 'utilisateur@domaine.com',
        },
        {
          url: 'http://localhost:3000/fr/employe/12345/profil/information-personnelle',
          expected: '12345',
        },
        {
          url: 'http://localhost:3000/fr/employe/test-user-456/profil/',
          expected: 'test-user-456',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = extractUserIdFromProfileRoute(new URL(url));
        expect(result.isSome()).toBe(true);
        expect(result.unwrap()).toBe(expected);
      });
    });

    it('should return null for non-profile routes', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/privacy-consent',
        'http://localhost:3000/en/employee/privacy-consent',
        'http://localhost:3000/en/hiring-manager',
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/test-user-123',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(extractUserIdFromProfileRoute(url).isNone()).toBe(true);
      });
    });

    it('should return null for invalid profile route patterns', () => {
      const urls = [
        'http://localhost:3000/en/employee/profile', // Missing user ID
        'http://localhost:3000/en/employees/test-user-123/profile', // Wrong plural form
        'http://localhost:3000/en/employee/test-user-123/profiles', // Wrong plural form
        'http://localhost:3000/fr/employes/test-user-123/profil', // Wrong plural form
        'http://localhost:3000/fr/employe/test-user-123/profils', // Wrong plural form
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(extractUserIdFromProfileRoute(url).isNone()).toBe(true);
      });
    });
  });

  describe('isEmployeeRoute', () => {
    it('should return true for English employee routes', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/employee/privacy-consent',
        'http://localhost:3000/en/employee/test-user-123/profile/personal-information',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isEmployeeRoute(url)).toBe(true);
      });
    });

    it('should return true for French employee routes', () => {
      const urls = [
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/',
        'http://localhost:3000/fr/employe/test-user-123',
        'http://localhost:3000/fr/employe/test-user-123/profil',
        'http://localhost:3000/fr/employe/consentement-a-la-confidentialite',
        'http://localhost:3000/fr/employe/test-user-123/profil/information-personnelle',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isEmployeeRoute(url)).toBe(true);
      });
    });

    it('should return false for non-employee routes', () => {
      const urls = [
        'http://localhost:3000/en/hiring-manager',
        'http://localhost:3000/en/hiring-manager/',
        'http://localhost:3000/en/employers',
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/gestionnaire-embauche',
        'http://localhost:3000/fr/employeurs',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isEmployeeRoute(url)).toBe(false);
      });
    });
  });

  describe('isPrivacyConsentPath', () => {
    it('should return true for English privacy consent paths', () => {
      const urls = [
        'http://localhost:3000/en/employee/privacy-consent',
        'http://localhost:3000/en/employee/privacy-consent/',
        'http://localhost:3000/en/employee/privacy-consent/form',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isPrivacyConsentPath(url)).toBe(true);
      });
    });

    it('should return true for French privacy consent paths', () => {
      const urls = [
        'http://localhost:3000/fr/employe/consentement-a-la-confidentialite',
        'http://localhost:3000/fr/employe/consentement-a-la-confidentialite/',
        'http://localhost:3000/fr/employe/consentement-a-la-confidentialite/formulaire',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isPrivacyConsentPath(url)).toBe(true);
      });
    });

    it('should return false for non-privacy consent paths', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/hiring-manager',
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/test-user-123',
        'http://localhost:3000/fr/employe/test-user-123/profil',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isPrivacyConsentPath(url)).toBe(false);
      });
    });
  });

  describe('isHiringManagerPath', () => {
    it('should return true for English hiring manager paths', () => {
      const urls = [
        'http://localhost:3000/en/hiring-manager',
        'http://localhost:3000/en/hiring-manager/',
        'http://localhost:3000/en/hiring-manager/registration',
        'http://localhost:3000/en/hiring-manager/dashboard',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isHiringManagerPath(url)).toBe(true);
      });
    });

    it('should return true for French hiring manager paths', () => {
      const urls = [
        'http://localhost:3000/fr/gestionnaire-embauche',
        'http://localhost:3000/fr/gestionnaire-embauche/',
        'http://localhost:3000/fr/gestionnaire-embauche/inscription',
        'http://localhost:3000/fr/gestionnaire-embauche/tableau-de-bord',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isHiringManagerPath(url)).toBe(true);
      });
    });

    it('should return false for non-hiring manager paths', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/employee/privacy-consent',
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/test-user-123',
        'http://localhost:3000/fr/employe/test-user-123/profil',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isHiringManagerPath(url)).toBe(false);
      });
    });

    it('should return false for similar but incorrect patterns', () => {
      const urls = [
        'http://localhost:3000/en/hiring-managers', // Wrong plural form
        'http://localhost:3000/en/hiring-manager-registration', // Missing path separator
        'http://localhost:3000/hiring-manager', // Missing language prefix
        'http://localhost:3000/fr/gestionnaire-embauches', // Wrong plural form
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isHiringManagerPath(url)).toBe(false);
      });
    });
  });

  describe('edge cases and special characters', () => {
    it('should handle URLs with query parameters', () => {
      const profileUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile?tab=personal');
      expect(isProfileRoute(profileUrl)).toBe(true);
      expect(extractUserIdFromProfileRoute(profileUrl).isSome()).toBe(true);
      expect(extractUserIdFromProfileRoute(profileUrl).unwrap()).toBe('test-user-123');

      const employeeUrl = new URL('http://localhost:3000/en/employee?redirect=true');
      expect(isEmployeeRoute(employeeUrl)).toBe(true);
      expect(isProfileRoute(employeeUrl)).toBe(false);
    });

    it('should handle URLs with fragments', () => {
      const profileUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile#personal-info');
      expect(isProfileRoute(profileUrl)).toBe(true);
      expect(extractUserIdFromProfileRoute(profileUrl).isSome()).toBe(true);
      expect(extractUserIdFromProfileRoute(profileUrl).unwrap()).toBe('test-user-123');

      const employeeUrl = new URL('http://localhost:3000/en/employee#top');
      expect(isEmployeeRoute(employeeUrl)).toBe(true);
      expect(isProfileRoute(employeeUrl)).toBe(false);
    });

    it('should handle user IDs with special characters', () => {
      const userIds = ['user@domain.com', 'user+plus@domain.com', 'user-with-hyphens', 'user_with_underscores'];

      userIds.forEach((userId) => {
        const url = new URL(`http://localhost:3000/en/employee/${userId}/profile`);
        expect(isProfileRoute(url)).toBe(true);
        expect(extractUserIdFromProfileRoute(url).isSome()).toBe(true);
        expect(extractUserIdFromProfileRoute(url).unwrap()).toBe(userId);
      });
    });

    it('should handle different domain names and ports', () => {
      const domains = [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://example.com',
        'https://secure.example.org',
        'https://dev-vacman.canada.ca',
      ];

      domains.forEach((domain) => {
        const profileUrl = new URL(`${domain}/en/employee/test-user-123/profile`);
        expect(isProfileRoute(profileUrl)).toBe(true);
        expect(extractUserIdFromProfileRoute(profileUrl).isSome()).toBe(true);
        expect(extractUserIdFromProfileRoute(profileUrl).unwrap()).toBe('test-user-123');

        const employeeUrl = new URL(`${domain}/en/employee`);
        expect(isEmployeeRoute(employeeUrl)).toBe(true);
        expect(isProfileRoute(employeeUrl)).toBe(false);
      });
    });
  });
});
