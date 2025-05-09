/**
 * This module provides utility functions for handling user authentication and authorization.
 * It includes functions for checking user roles, enforcing required authentication, and redirecting
 * unauthenticated users to the login page. It also defines types for authenticated sessions
 * and utilizes the logging module for logging authentication-related events.
 */
import { redirect } from 'react-router';

import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Represents an authenticated session by extending the base `SessionData` type.
 * This type ensures that the `authState` property is non-nullable.
 */
export type AuthenticatedSession = AppSession & {
  authState: NonNullable<AppSession['authState']>;
};

/**
 * Checks if the user session contains the specified role.
 */
export function hasRole(session: AppSession, role: Role) {
  return session.authState?.idTokenClaims.roles?.includes(role);
}

/**
 * Requires that the user posses all of the specified roles.
 * Will redirect to the login page if the user is not authenticated.
 * @throws {AppError} If the user does not have the required roles.
 */
export function requireAllRoles(
  session: AppSession,
  currentUrl: URL,
  roles: Role[] = [],
): asserts session is AuthenticatedSession {
  if (!session.authState) {
    log.debug('User is not authenticated; redirecting to login page');

    const { pathname, search } = currentUrl;
    throw redirect(`/auth/login?returnto=${pathname}${search}`);
  }

  const missingRoles = roles.filter((role) => !hasRole(session, role));

  if (missingRoles.length > 0) {
    throw new AppError(
      `User does not have the following required roles: [${missingRoles.join(', ')}]`,
      ErrorCodes.ACCESS_FORBIDDEN,
      { httpStatusCode: HttpStatusCodes.FORBIDDEN },
    );
  }
}

/**
 * Requires that the user possess at least one of the specified roles.
 * Will redirect to the login page if the user is not authenticated.
 * @throws {AppError} If the user does not have at least one of the required roles.
 */
export function requireAnyRole(
  session: AppSession,
  currentUrl: URL,
  roles: Role[] = [],
): asserts session is AuthenticatedSession {
  if (!session.authState) {
    log.debug('User is not authenticated; redirecting to login page');

    const { pathname, search } = currentUrl;
    throw redirect(`/auth/login?returnto=${pathname}${search}`);
  }

  const hasAnyRole = roles.some((role) => hasRole(session, role));

  if (!hasAnyRole) {
    throw new AppError(
      `User does not have any of the following required roles: [${roles.join(', ')}]`,
      ErrorCodes.ACCESS_FORBIDDEN,
      { httpStatusCode: HttpStatusCodes.FORBIDDEN },
    );
  }
}
