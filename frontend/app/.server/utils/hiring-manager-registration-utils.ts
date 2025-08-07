/**
 * Utility functions for handling hiring manager registration checks.
 * This module provides functions to verify if users are registered as hiring managers
 * and redirects them appropriately if they haven't registered yet.
 */
import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { isHiringManagerPath } from '~/.server/utils/route-matching-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the authenticated user is registered as a hiring manager.
 * If the user is not registered as a hiring manager, redirects them to the index page.
 * This should only be called for hiring manager routes.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user is not registered as a hiring manager
 */
export async function requireHiringManagerRegistration(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  // Get user from the database to check hiring manager registration
  const userService = getUserService();
  const user = await userService.getCurrentUser(session.authState.accessToken);

  // Check if user has hiring-manager role
  if (user.role !== 'hiring-manager') {
    log.debug('User is not registered as a hiring manager, redirecting to index');
    throw i18nRedirect('routes/employee/index.tsx', currentUrl);
  }

  log.debug('User is registered as a hiring manager, allowing access');
}

/**
 * Applies hiring manager registration checking for hiring manager routes in the parent layout.
 * This function should be called in the layout loader to check if:
 * 1. The current route is a hiring manager route
 * If the condition is met, it requires hiring manager registration.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to index page if user is not registered as a hiring manager
 */
export async function checkHiringManagerRouteRegistration(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  // Only check hiring manager registration for hiring manager routes
  if (!isHiringManagerPath(currentUrl)) {
    return;
  }

  // Apply hiring manager registration requirement for hiring manager routes
  await requireHiringManagerRegistration(session, currentUrl);
}
