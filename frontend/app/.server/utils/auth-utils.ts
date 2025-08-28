/**
 * This module provides utility functions for handling user authentication and authorization.
 * It includes functions for checking user roles, enforcing required authentication, and redirecting
 * unauthenticated users to the login page. It also defines types for authenticated sessions
 * and utilizes the logging module for logging authentication-related events.
 */
import { redirect } from 'react-router';

import { LogFactory } from '~/.server/logging';
import { getRolesFromJWT } from '~/.server/utils/jwt-utils';
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
 * Requires that the user be authenticated but does not check for specific roles.
 * Will redirect to the login page if the user is not authenticated.
 */
export function requireAuthentication(
  session: AppSession,
  requestOrUrl: Request | URL,
): asserts session is AuthenticatedSession {
  // Parse URL once for potential reuse
  const url = requestOrUrl instanceof Request ? new URL(requestOrUrl.url) : requestOrUrl;
  const { pathname, search } = url;
  const returnToUrl = `/auth/login?returnto=${encodeURIComponent(pathname + search)}`;

  if (!session.authState) {
    log.debug('User is not authenticated; redirecting to login page');
    throw redirect(returnToUrl);
  }

  // Check if the JWT access token has expired, allowing for clock skew
  const { exp } = session.authState.accessTokenClaims;
  const currentTime = Math.floor(Date.now() / 1000);
  const clockSkewSeconds = 10;

  if (exp && currentTime - clockSkewSeconds >= exp) {
    log.debug('JWT access token has expired (with clock skew); redirecting to login page');
    throw redirect(returnToUrl);
  }
}

/**
 * Checks if the user session contains the specified role.
 */
export function hasRole(session: AppSession, role: Role): boolean {
  if (!session.authState) return false;

  const userRoles = getRolesFromJWT(session.authState.accessToken);
  return userRoles.includes(role);
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
  // First ensure the user is authenticated and JWT is not expired
  requireAuthentication(session, currentUrl);

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
  // First ensure the user is authenticated and JWT is not expired
  requireAuthentication(session, currentUrl);

  const hasAnyRole = roles.some((role) => hasRole(session, role));

  if (!hasAnyRole) {
    throw new AppError(
      `User does not have any of the following required roles: [${roles.join(', ')}]`,
      ErrorCodes.ACCESS_FORBIDDEN,
      { httpStatusCode: HttpStatusCodes.FORBIDDEN },
    );
  }
}
