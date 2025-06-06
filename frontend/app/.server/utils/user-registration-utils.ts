/**
 * Utility functions for handling user registration flow.
 * This module provides functions to check if an authenticated user is registered
 * in the backend system and redirects unregistered users to the registration page.
 */
import { redirect } from 'react-router';

import type { User } from '~/.server/domain/models';
import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the authenticated user is registered in the backend system.
 * If the user is authenticated via Azure AD but not registered in our backend,
 * redirects them to the registration page.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @returns Promise that resolves to the registered user or throws a redirect
 * @throws {Response} Redirect to registration page if user is not registered
 */
export async function requireUserRegistration(session: AuthenticatedSession, currentUrl: URL): Promise<User> {
  // Get the Azure AD user ID from the session
  const activeDirectoryId = session.authState.idTokenClaims.sub;

  if (!activeDirectoryId) {
    log.warn('User session is missing Azure AD subject claim');
    throw new Error('Invalid authentication state: missing subject claim');
  }

  log.debug('Checking user registration for Azure AD ID: %s', activeDirectoryId);

  const userService = getUserService();
  const user = await userService.getUserByActiveDirectoryId(activeDirectoryId);

  if (!user) {
    log.debug('User not found in backend system, redirecting to registration');

    // Preserve the original URL they were trying to access
    const { pathname, search } = currentUrl;
    const returnTo = `${pathname}${search}`;

    throw redirect(`/en/register?returnto=${encodeURIComponent(returnTo)}`);
  }

  log.debug('User found in backend system: %s', user.name);
  return user;
}

/**
 * Ensures that only authenticated users who are NOT already registered can access
 * the registration page. If the user is already registered, redirects them away.
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {Response} Redirect to dashboard if user is already registered
 */
export async function requireUnregisteredUser(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  // Get the Azure AD user ID from the session
  const activeDirectoryId = session.authState.idTokenClaims.sub;

  if (!activeDirectoryId) {
    log.warn('User session is missing Azure AD subject claim');
    throw new Error('Invalid authentication state: missing subject claim');
  }

  log.debug('Checking if user is already registered for Azure AD ID: %s', activeDirectoryId);

  const userService = getUserService();
  const user = await userService.getUserByActiveDirectoryId(activeDirectoryId);

  if (user) {
    // TODO: Update routing
    log.debug('User is already registered: %s, redirecting', user.name);

    // Get the return URL from query params, or default to dashboard
    const returnTo = currentUrl.searchParams.get('returnto') ?? '/en/';

    throw redirect(returnTo);
  }

  log.debug('User is not registered, allowing access to registration page');
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
