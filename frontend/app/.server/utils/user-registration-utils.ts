/**
 * Utility functions for handling user registration flow.
 * This module provides functions to check if an authenticated user is registered
 * based on their access token claims and redirects unregistered users to the registration page.
 */
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the authenticated user has the required roles.
 * Verifies the user has either 'employee' or 'hiring-manager' roles from their access token claims.
 * If the user is authenticated via Azure AD but doesn't have the required roles,
 * redirects them to the registration page.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to registration page if user doesn't have required roles
 */
export function requireUserRegistration(session: AuthenticatedSession, currentUrl: URL): void {
  // Check for required roles in access token claims
  const userRoles = session.authState.accessTokenClaims.roles ?? [];
  const hasRequiredRole = userRoles.includes('employee') || userRoles.includes('hiring-manager');

  if (!hasRequiredRole) {
    log.debug('User does not have required roles (employee or hiring-manager), redirecting to registration');
    throw i18nRedirect('routes/register/index.tsx', currentUrl);
  }

  log.debug(
    'User has required roles:',
    userRoles.filter((role) => role === 'employee' || role === 'hiring-manager'),
  );
}

/**
 * Ensures that only authenticated users who are NOT already registered can access
 * the registration page. If the user already has the required roles, they are
 * considered registered and will be redirected away from registration pages.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to dashboard if user is already registered
 */
export function requireUnregisteredUser(session: AuthenticatedSession, currentUrl: URL): void {
  // Check for required roles in access token claims
  const userRoles = session.authState.accessTokenClaims.roles ?? [];
  const hasRequiredRole = userRoles.includes('employee') || userRoles.includes('hiring-manager');

  if (hasRequiredRole) {
    log.debug('User has required roles, redirecting away from registration');
    throw i18nRedirect('routes/index.tsx', currentUrl);
  }

  log.debug('User does not have required roles, allowing access to registration page');
}

/**
 * Checks if the current request is for a registration-related page.
 * This prevents infinite redirects when the user is already on registration pages.
 */
export function isRegistrationPath(url: URL): boolean {
  const registrationPaths = [
    '/en/register',
    '/fr/enregistrer',
    '/en/register/privacy-consent',
    '/fr/enregistrer/consentement-a-la-confidentialite',
  ];

  return registrationPaths.some((path) => url.pathname.startsWith(path));
}
