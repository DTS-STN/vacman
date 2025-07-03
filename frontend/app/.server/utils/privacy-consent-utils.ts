/**
 * Utility functions for handling privacy consent checks.
 * This module provides functions to verify if users have accepted privacy consent
 * and redirects them appropriately if they haven't.
 */
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { safeGetUserProfile } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the authenticated employee user has accepted privacy consent.
 * If the user hasn't accepted privacy consent, redirects them to the index page.
 * This should only be called for employee routes (excluding privacy-consent route).
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user hasn't accepted privacy consent
 */
export async function requirePrivacyConsent(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  const activeDirectoryId = session.authState.idTokenClaims.oid as string;
  const profile = await safeGetUserProfile(activeDirectoryId);

  if (!profile) {
    log.debug('Profile not found in database, redirecting to index');
    throw i18nRedirect('routes/index.tsx', currentUrl);
  }

  if (!profile.privacyConsentInd) {
    log.debug('User has not accepted privacy consent, redirecting to index');
    throw i18nRedirect('routes/index.tsx', currentUrl);
  }

  log.debug('User has profile and accepted privacy consent, allowing access');
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
 * Checks if the current request is for an employee route.
 * Employee routes are those that start with /en/employee or /fr/employe.
 */
export function isEmployeeRoute(url: URL): boolean {
  const employeePathPrefixes = ['/en/employee', '/fr/employe'];

  return employeePathPrefixes.some((prefix) => url.pathname.startsWith(prefix));
}

/**
 * Applies privacy consent checking for employee routes in the parent layout.
 * This function should be called in the layout loader to check if:
 * 1. The current route is an employee route
 * 2. The current route is NOT a privacy consent page
 * If both conditions are met, it requires privacy consent.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user hasn't accepted privacy consent
 */
export async function checkEmployeeRoutePrivacyConsent(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  // Only check privacy consent for employee routes
  if (!isEmployeeRoute(currentUrl)) {
    return;
  }

  // Skip privacy consent check if we're on the privacy consent page itself
  if (isPrivacyConsentPath(currentUrl)) {
    return;
  }

  // Apply privacy consent requirement for employee routes
  await requirePrivacyConsent(session, currentUrl);
}
