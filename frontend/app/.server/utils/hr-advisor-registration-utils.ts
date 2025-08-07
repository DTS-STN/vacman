/**
 * Utility functions for handling hr-advisor registration checks.
 * This module provides functions to verify if users are registered as hr-advisors
 * and redirects them appropriately if they haven't registered yet.
 */
import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { isHrAdvisorPath } from '~/.server/utils/route-matching-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the authenticated user is registered as a hr-advisor.
 * If the user is not registered as a hr-advisor, redirects them to the index page.
 * This should only be called for hr-advisor routes.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user is not registered as a hr-advisor
 */
export async function requireHrAdvisorRegistration(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  // Get user from the database to check hr-advisor registration
  const userService = getUserService();
  const activeDirectoryId = session.authState.idTokenClaims.oid;
  const user = await userService.getUserByActiveDirectoryId(activeDirectoryId);

  if (!user) {
    log.debug('User not found in database, redirecting to index to register as hr-advisor');
    throw i18nRedirect('routes/employee/index.tsx', currentUrl);
  }

  // Check if user has hr-advisor role
  if (user.role !== 'hr-advisor') {
    log.debug('User is not registered as a hr-advisor, redirecting to index');
    throw i18nRedirect('routes/employee/index.tsx', currentUrl);
  }

  log.debug('User is registered as a hr-advisor, allowing access');
}

/**
 * Applies hr-advisor registration checking for hr-advisor routes in the parent layout.
 * This function should be called in the layout loader to check if:
 * 1. The current route is a hr-advisor route
 * If the condition is met, it requires hr-advisor registration.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user is not registered as a hr-advisor
 */
export async function checkHrAdvisorRouteRegistration(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  // Only check hr-advisor registration for hr-advisor routes
  if (!isHrAdvisorPath(currentUrl)) {
    return;
  }

  // Apply hr-advisor registration requirement for hr-advisor routes
  await requireHrAdvisorRegistration(session, currentUrl);
}
