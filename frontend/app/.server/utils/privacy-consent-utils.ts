/**
 * Utility functions for handling privacy consent checks.
 * This module provides functions to verify if users have accepted privacy consent
 * and redirects them appropriately if they haven't.
 */
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { isProfileRoute } from '~/.server/utils/profile-access-utils';
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
 * Checks if the authenticated user has accepted privacy consent for accessing their own profile.
 * This function only checks privacy consent when a user is accessing their own profile data,
 * not when a hiring manager is accessing another employee's profile.
 *
 * @param session - The authenticated session
 * @param targetUserId - The ID of the profile being accessed
 * @throws {Response} Redirect to index page if user hasn't accepted privacy consent
 */
export async function requirePrivacyConsentForOwnProfile(session: AuthenticatedSession, targetUserId: string): Promise<void> {
  const requesterId = session.authState.idTokenClaims.oid as string;

  // Only check privacy consent if the user is accessing their own profile
  if (requesterId !== targetUserId) {
    log.debug('User is not accessing their own profile, skipping privacy consent check');
    return;
  }

  log.debug('User is accessing their own profile, checking privacy consent');

  const profile = await safeGetUserProfile(requesterId);

  if (!profile) {
    log.debug('User profile not found in database, redirecting to index');
    throw i18nRedirect('routes/index.tsx', new URL('http://localhost')); // Fallback URL for redirect
  }

  if (!profile.privacyConsentInd) {
    log.debug('User has not accepted privacy consent for their own profile, redirecting to index');
    throw i18nRedirect('routes/index.tsx', new URL('http://localhost')); // Fallback URL for redirect
  }

  log.debug('User has accepted privacy consent for their own profile, allowing access');
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
 * 3. The current route is NOT a profile route (profile routes handle their own privacy consent logic)
 *
 * The logic is:
 * - For profile routes: Skip privacy consent check (handled by profile access logic)
 * - For other employee routes: Always check privacy consent
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user hasn't accepted privacy consent
 */
export async function checkEmployeeRoutePrivacyConsent(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  log.debug(`Checking employee route privacy consent for URL: ${currentUrl.pathname}`);

  // Only check privacy consent for employee routes
  if (!isEmployeeRoute(currentUrl)) {
    log.debug(`URL ${currentUrl.pathname} is not an employee route, skipping privacy consent check`);
    return;
  }

  // Skip privacy consent check if we're on the privacy consent page itself
  if (isPrivacyConsentPath(currentUrl)) {
    log.debug(`URL ${currentUrl.pathname} is privacy consent page, skipping privacy consent check`);
    return;
  }

  // Skip privacy consent check for profile routes (handled by profile access logic)
  if (isProfileRoute(currentUrl)) {
    log.debug(`URL ${currentUrl.pathname} is a profile route, privacy consent handled by profile access logic`);
    return;
  }

  // For all other employee routes, apply general privacy consent requirement
  log.debug(`URL ${currentUrl.pathname} is a general employee route, applying privacy consent check`);
  await requirePrivacyConsent(session, currentUrl);
}
