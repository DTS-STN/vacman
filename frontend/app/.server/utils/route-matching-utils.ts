/**
 * Utility functions for identifying and parsing routes.
 * This module provides route matching and parsing functions for various URL patterns
 * including profile routes, employee routes, and privacy consent routes.
 */
import { LogFactory } from '~/.server/logging';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the current request is for a profile route that requires access control.
 * Profile routes are those that match the pattern /en/employee/[id]/profile/* or /fr/employe/[id]/profil/*
 */
export function isProfileRoute(url: URL): boolean {
  // Pattern for English: /en/employee/{id}/profile (and any subpaths)
  const englishPattern = /^\/en\/employee\/[^/]+\/profile(?:\/|$)/;
  // Pattern for French: /fr/employe/{id}/profil (and any subpaths)
  const frenchPattern = /^\/fr\/employe\/[^/]+\/profil(?:\/|$)/;

  const result = englishPattern.test(url.pathname) || frenchPattern.test(url.pathname);
  log.debug(`isProfileRoute(${url.pathname}): ${result}`);
  return result;
}

/**
 * Extracts the user ID from profile routes like /en/employee/[id]/profile/* or /fr/employe/[id]/profil/*
 * Returns null if the URL doesn't match the expected pattern or if no ID is found.
 */
export function extractUserIdFromProfileRoute(url: URL): string | null {
  // Pattern for English: /en/employee/{id}/profile
  const englishRegex = /^\/en\/employee\/([^/]+)\/profile(?:\/|$)/;
  const englishMatch = englishRegex.exec(url.pathname);
  if (englishMatch?.[1]) {
    const userId = englishMatch[1];
    log.debug(`extractUserIdFromProfileRoute(${url.pathname}): ${userId}`);
    return userId;
  }

  // Pattern for French: /fr/employe/{id}/profil
  const frenchRegex = /^\/fr\/employe\/([^/]+)\/profil(?:\/|$)/;
  const frenchMatch = frenchRegex.exec(url.pathname);
  if (frenchMatch?.[1]) {
    const userId = frenchMatch[1];
    log.debug(`extractUserIdFromProfileRoute(${url.pathname}): ${userId}`);
    return userId;
  }

  log.debug(`extractUserIdFromProfileRoute(${url.pathname}): null`);
  return null;
}

/**
 * Checks if the current request is for an employee route.
 * Employee routes are those that start with /en/employee or /fr/employe.
 */
export function isEmployeeRoute(url: URL): boolean {
  const employeePathPrefixes = ['/en/employee', '/fr/employe'];
  return employeePathPrefixes.some((prefix) => url.pathname.startsWith(prefix));
}

/**
 * Checks if the current request is for the privacy consent page.
 * This prevents checking privacy consent on the consent page itself.
 */
export function isPrivacyConsentPath(url: URL): boolean {
  const privacyConsentPaths = ['/en/employee/privacy-consent', '/fr/employe/consentement-a-la-confidentialite'];
  return privacyConsentPaths.some((path) => url.pathname.startsWith(path));
}

/**
 * Checks if the current request is for a hiring manager route.
 * This helps identify routes that need hiring manager registration check.
 */
export function isHiringManagerPath(url: URL): boolean {
  const hiringManagerPaths = ['/en/hiring-manager', '/fr/gestionnaire-embauche'];
  return hiringManagerPaths.some((path) => {
    return url.pathname === path || url.pathname.startsWith(path + '/');
  });
}
