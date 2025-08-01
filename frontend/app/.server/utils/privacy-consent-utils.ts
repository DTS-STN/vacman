/**
 * Utility functions for handling privacy consent checks.
 * This module provides functions to verify if users have accepted privacy consent
 * and redirects them appropriately if they haven't.
 */
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { safeGetUserProfile } from '~/.server/utils/profile-utils';
import { isEmployeeRoute, isPrivacyConsentPath, isProfileRoute } from '~/.server/utils/route-matching-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Internal function to check if a user has accepted privacy consent.
 * This function encapsulates the common logic for privacy consent checking.
 *
 * @param userId - The user ID to check privacy consent for
 * @param currentUrl - The current request URL for redirect context
 * @throws {Response} Redirect to index page if user hasn't accepted privacy consent
 */
async function checkPrivacyConsentForUser(userId: string, currentUrl: URL): Promise<void> {
  const profile = await safeGetUserProfile(userId);

  if (!profile?.privacyConsentInd) {
    log.debug(`Privacy consent required for user ${userId}`);
    throw i18nRedirect('routes/employee/privacy-consent.tsx', currentUrl);
  }
}

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
  await checkPrivacyConsentForUser(activeDirectoryId, currentUrl);
}

/**
 * Checks if the authenticated user has accepted privacy consent for accessing their own profile.
 * This function only checks privacy consent when a user is accessing their own profile data,
 * not when a hiring manager is accessing another employee's profile.
 *
 * @param session - The authenticated session
 * @param targetUserId - The ID of the profile being accessed
 * @param currentUrl - The current request URL for redirect context
 * @throws {Response} Redirect to index page if user hasn't accepted privacy consent
 */
export async function requirePrivacyConsentForOwnProfile(
  session: AuthenticatedSession,
  targetUserId: string,
  currentUrl: URL,
): Promise<void> {
  const requesterId = session.authState.idTokenClaims.oid as string;

  // Only check privacy consent if the user is accessing their own profile
  if (requesterId !== targetUserId) {
    return;
  }

  log.debug(`Privacy consent check for own profile: ${requesterId}`);
  await checkPrivacyConsentForUser(requesterId, currentUrl);
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
  // Only check privacy consent for employee routes
  if (!isEmployeeRoute(currentUrl)) {
    return;
  }

  // Skip privacy consent check if we're on the privacy consent page itself
  if (isPrivacyConsentPath(currentUrl)) {
    return;
  }

  // Skip privacy consent check for profile routes (handled by profile access logic)
  if (isProfileRoute(currentUrl)) {
    return;
  }

  // For all other employee routes, apply general privacy consent requirement
  log.debug(`Privacy consent check for employee route: ${currentUrl.pathname}`);
  await requirePrivacyConsent(session, currentUrl);
}
