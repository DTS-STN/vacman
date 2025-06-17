/**
 * Utility functions for handling privacy consent checks.
 * This module provides functions to verify if users have accepted privacy consent
 * and redirects them appropriately if they haven't.
 */
import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
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
  // Get user from the database to check privacy consent
  const userService = getUserService();
  const activeDirectoryId = session.authState.idTokenClaims.sub;
  const user = await userService.getUserByActiveDirectoryId(activeDirectoryId);

  if (!user) {
    log.debug('User not found in database, redirecting to index');
    throw i18nRedirect('routes/index.tsx', currentUrl);
  }

  if (!user.privacyConsentAccepted) {
    log.debug('User has not accepted privacy consent, redirecting to index');
    throw i18nRedirect('routes/index.tsx', currentUrl);
  }

  log.debug('User has accepted privacy consent, allowing access');
}

/**
 * Checks if the current request is for the privacy consent page.
 * This prevents checking privacy consent on the consent page itself.
 */
export function isPrivacyConsentPath(url: URL): boolean {
  const privacyConsentPaths = ['/en/employee/privacy-consent', '/fr/employe/consentement-a-la-confidentialite'];

  return privacyConsentPaths.some((path) => url.pathname.startsWith(path));
}
