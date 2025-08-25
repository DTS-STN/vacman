/**
 * Utility functions for identifying and parsing routes.
 * This module provides route matching and parsing functions for various URL patterns
 * including profile routes, employee routes, and privacy consent routes.
 */

function createBilingualRouteMatcher(englishPath: string, frenchPath: string) {
  const patterns = [new RegExp(`^/en/${englishPath}(?:/|$)`), new RegExp(`^/fr/${frenchPath}(?:/|$)`)];
  return (url: URL) => patterns.some((pattern) => pattern.test(url.pathname));
}

export const isProfileRoute = createBilingualRouteMatcher('employee/[^/]+/profile', 'employe/[^/]+/profil');
export const isEmployeeRoute = createBilingualRouteMatcher('employee', 'employe');
export const isHiringManagerPath = createBilingualRouteMatcher('hiring-manager', 'gestionnaire-embauche');
export const isHrAdvisorPath = createBilingualRouteMatcher('hr-advisor', 'hr-advisor');
export const isPrivacyConsentPath = createBilingualRouteMatcher(
  'employee/profile/privacy-consent',
  'employe/profil/consentement-a-la-confidentialite',
);
