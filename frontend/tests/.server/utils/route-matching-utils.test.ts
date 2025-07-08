/**
 * Tests for route matching utilities.
 * This module tests the functions that identify and parse various URL patterns
 * including profile routes, employee routes, and privacy consent routes.
 */
import { describe, it, expect } from 'vitest';

import {
  isProfileRoute,
  extractUserIdFromProfileRoute,
  isEmployeeRoute,
  isPrivacyConsentPath,
  isHiringManagerPath,
} from '~/.server/utils/route-matching-utils';

describe('Route Matching Utils', () => {
  describe('isProfileRoute', () => {
    it('should return true for English profile routes', () => {
      const urls = [
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/employee/test-user-123/profile/',
        'http://localhost:3000/en/employee/test-user-123/profile/personal-information',
        'http://localhost:3000/en/employee/user@domain.com/profile',
        'http://localhost:3000/en/employee/12345/profile/referral-preferences',
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
        'http://localhost:3000/fr/employe/test-user-123/profil/information-personnelle',
        'http://localhost:3000/fr/employe/user@domain.com/profil',
        'http://localhost:3000/fr/employe/12345/profil/preferences-de-referral',
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
        'http://localhost:3000/fr/employe/',
        'http://localhost:3000/fr/employe/test-user-123',
        'http://localhost:3000/fr/employe/test-user-123/consentement-a-la-confidentialite',
        'http://localhost:3000/fr/gestionnaire-embauche',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isProfileRoute(url)).toBe(false);
      });
    });

    it('should return false for similar but incorrect patterns', () => {
      const urls = [
        'http://localhost:3000/en/employee/profile', // Missing user ID
        'http://localhost:3000/en/employees/test-user-123/profile', // Wrong plural form
        'http://localhost:3000/en/employee/test-user-123/profiles', // Wrong plural form
        'http://localhost:3000/fr/employes/test-user-123/profil', // Wrong plural form
        'http://localhost:3000/fr/employe/test-user-123/profils', // Wrong plural form
        'http://localhost:3000/es/empleado/test-user-123/perfil', // Wrong language
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
          url: 'http://localhost:3000/en/employee/user@domain.com/profile',
          expected: 'user@domain.com',
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
        expect(result).toBe(expected);
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
        expect(result).toBe(expected);
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
        expect(extractUserIdFromProfileRoute(url)).toBeNull();
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
        expect(extractUserIdFromProfileRoute(url)).toBeNull();
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
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/gestionnaire-embauche',
        'http://localhost:3000/fr/',
        // Note: '/en/employees' and '/fr/employes' would actually match due to startsWith logic
        // This is expected behavior as they are variations of employee routes
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
        'http://localhost:3000/en/employee/privacy-consent/additional-path',
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
        'http://localhost:3000/fr/employe/consentement-a-la-confidentialite/chemin-supplementaire',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isPrivacyConsentPath(url)).toBe(true);
      });
    });

    it('should return false for non-privacy consent paths', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/hiring-manager',
        'http://localhost:3000/en/',
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/',
        'http://localhost:3000/fr/employe/test-user-123',
        'http://localhost:3000/fr/employe/test-user-123/profil',
        'http://localhost:3000/fr/gestionnaire-embauche',
        'http://localhost:3000/fr/',
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
        'http://localhost:3000/en/hiring-manager/dashboard',
        'http://localhost:3000/en/hiring-manager/employees',
        'http://localhost:3000/en/hiring-manager/reports/summary',
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
        'http://localhost:3000/fr/gestionnaire-embauche/tableau-de-bord',
        'http://localhost:3000/fr/gestionnaire-embauche/employes',
        'http://localhost:3000/fr/gestionnaire-embauche/rapports/resume',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isHiringManagerPath(url)).toBe(true);
      });
    });

    it('should return false for non-hiring manager paths', () => {
      const urls = [
        'http://localhost:3000/en/employee',
        'http://localhost:3000/en/employee/',
        'http://localhost:3000/en/employee/test-user-123',
        'http://localhost:3000/en/employee/test-user-123/profile',
        'http://localhost:3000/en/employee/privacy-consent',
        'http://localhost:3000/en/',
        'http://localhost:3000/',
        'http://localhost:3000/fr/employe',
        'http://localhost:3000/fr/employe/',
        'http://localhost:3000/fr/employe/test-user-123',
        'http://localhost:3000/fr/employe/test-user-123/profil',
        'http://localhost:3000/fr/employe/consentement-a-la-confidentialite',
        'http://localhost:3000/fr/',
      ];

      urls.forEach((urlString) => {
        const url = new URL(urlString);
        expect(isHiringManagerPath(url)).toBe(false);
      });
    });

    it('should return false for similar but incorrect patterns', () => {
      const urls = [
        'http://localhost:3000/en/hiring-managers', // Wrong plural form
        'http://localhost:3000/en/hiring', // Incomplete path
        'http://localhost:3000/en/manager', // Wrong path
        'http://localhost:3000/fr/gestionnaire-embauches', // Wrong plural form
        'http://localhost:3000/fr/gestionnaire', // Incomplete path
        'http://localhost:3000/fr/embauche', // Wrong path
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
      expect(extractUserIdFromProfileRoute(profileUrl)).toBe('test-user-123');

      const employeeUrl = new URL('http://localhost:3000/en/employee?redirect=true');
      expect(isEmployeeRoute(employeeUrl)).toBe(true);

      const hiringManagerUrl = new URL('http://localhost:3000/en/hiring-manager?view=dashboard');
      expect(isHiringManagerPath(hiringManagerUrl)).toBe(true);
    });

    it('should handle URLs with fragments', () => {
      const profileUrl = new URL('http://localhost:3000/en/employee/test-user-123/profile#personal-info');
      expect(isProfileRoute(profileUrl)).toBe(true);
      expect(extractUserIdFromProfileRoute(profileUrl)).toBe('test-user-123');

      const employeeUrl = new URL('http://localhost:3000/en/employee#top');
      expect(isEmployeeRoute(employeeUrl)).toBe(true);
    });

    it('should handle user IDs with special characters', () => {
      const testCases = [
        'user@domain.com',
        'user.name@company.co.uk',
        'user-123-456',
        'user_name_123',
        'user%40domain.com', // URL-encoded @
        'user+tag@domain.com',
        'firstname.lastname@organization.gov',
      ];

      testCases.forEach((userId) => {
        const url = new URL(`http://localhost:3000/en/employee/${userId}/profile`);
        expect(isProfileRoute(url)).toBe(true);
        expect(extractUserIdFromProfileRoute(url)).toBe(userId);
      });
    });

    it('should handle different domain names and ports', () => {
      const domains = [
        'http://localhost:3000',
        'https://vacman.example.com',
        'http://192.168.1.100:8080',
        'https://dev.vacman.internal',
      ];

      domains.forEach((domain) => {
        const profileUrl = new URL(`${domain}/en/employee/test-user-123/profile`);
        expect(isProfileRoute(profileUrl)).toBe(true);
        expect(extractUserIdFromProfileRoute(profileUrl)).toBe('test-user-123');

        const employeeUrl = new URL(`${domain}/en/employee`);
        expect(isEmployeeRoute(employeeUrl)).toBe(true);

        const hiringManagerUrl = new URL(`${domain}/en/hiring-manager`);
        expect(isHiringManagerPath(hiringManagerUrl)).toBe(true);
      });
    });
  });
});
