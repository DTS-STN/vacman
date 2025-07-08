/**
 * Utility functions for handling profile access control.
 * This module provides functions to verify if users have access to view or modify profiles
 * based on their role and relationship to the profile owner.
 */
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the current request is for a profile route that requires access control.
 * Profile routes are those that match the pattern /en/employee/[id]/profile/* or /fr/employe/[id]/profil/*
 */
export function isProfileRoute(url: URL): boolean {
  log.debug(`Checking if ${url.pathname} is a profile route`);

  // Pattern for English: /en/employee/{id}/profile (and any subpaths)
  const englishPattern = /^\/en\/employee\/[^/]+\/profile(?:\/|$)/;

  // Pattern for French: /fr/employe/{id}/profil (and any subpaths)
  const frenchPattern = /^\/fr\/employe\/[^/]+\/profil(?:\/|$)/;

  const englishMatches = englishPattern.test(url.pathname);
  const frenchMatches = frenchPattern.test(url.pathname);

  log.debug(`Testing ${url.pathname} against English pattern: ${englishMatches}`);
  log.debug(`Testing ${url.pathname} against French pattern: ${frenchMatches}`);

  const result = englishMatches || frenchMatches;
  log.debug(`isProfileRoute result for ${url.pathname}: ${result}`);
  return result;
}

/**
 * Extracts the user ID from profile routes like /en/employee/[id]/profile/* or /fr/employe/[id]/profil/*
 * Returns null if the URL doesn't match the expected pattern or if no ID is found.
 */
export function extractUserIdFromProfileRoute(url: URL): string | null {
  log.debug(`Extracting user ID from profile route: ${url.pathname}`);

  // Pattern for English: /en/employee/{id}/profile
  const englishRegex = /^\/en\/employee\/([^/]+)\/profile(?:\/|$)/;
  const englishMatch = englishRegex.exec(url.pathname);
  if (englishMatch?.[1]) {
    const userId = englishMatch[1];
    log.debug(`Extracted user ID from English route: ${userId}`);
    return userId;
  }

  // Pattern for French: /fr/employe/{id}/profil
  const frenchRegex = /^\/fr\/employe\/([^/]+)\/profil(?:\/|$)/;
  const frenchMatch = frenchRegex.exec(url.pathname);
  if (frenchMatch?.[1]) {
    const userId = frenchMatch[1];
    log.debug(`Extracted user ID from French route: ${userId}`);
    return userId;
  }

  log.debug(`Could not extract user ID from ${url.pathname}`);
  return null;
}

/**
 * Checks if the authenticated user has access to view or modify a specific profile.
 * Access is granted if:
 * 1. The requester is accessing their own profile, OR
 * 2. The requester has the "hiring-manager" role
 *
 * @param session - The authenticated session containing the requester's information
 * @param targetUserId - The ID parameter from the route (the profile being accessed)
 * @throws {AppError} If the profile is not found or access is denied
 */
export async function requireProfileAccess(session: AuthenticatedSession, targetUserId: string): Promise<void> {
  const requesterId = session.authState.idTokenClaims.oid as string;

  log.debug(`Checking profile access for requester ${requesterId} accessing profile ${targetUserId}`);

  // First, check if the profile exists
  const profileService = getProfileService();
  const profileOption = await profileService.getProfile(targetUserId);

  if (profileOption.isNone()) {
    log.debug(`Profile not found for user ID: ${targetUserId}`);
    throw new AppError(`Profile not found for user ID: ${targetUserId}`, ErrorCodes.PROFILE_NOT_FOUND, {
      httpStatusCode: HttpStatusCodes.NOT_FOUND,
    });
  }

  // If the requester is accessing their own profile, grant access
  if (requesterId === targetUserId) {
    log.debug('User accessing their own profile, access granted');
    return;
  }

  // If not accessing own profile, check if requester has hiring-manager role
  const userService = getUserService();
  const requesterUser = await userService.getUserByActiveDirectoryId(requesterId);

  if (!requesterUser) {
    log.debug(`Requester user not found in system: ${requesterId}`);
    throw new AppError('Requester not found in system', ErrorCodes.ACCESS_FORBIDDEN, {
      httpStatusCode: HttpStatusCodes.FORBIDDEN,
    });
  }

  if (requesterUser.role === 'hiring-manager') {
    log.debug('User has hiring-manager role, access granted');
    return;
  }

  // Access denied - user is not accessing their own profile and doesn't have hiring-manager role
  log.debug(`Access denied for user ${requesterId} to profile ${targetUserId}. User role: ${requesterUser.role}`);
  throw new AppError(
    'Access denied. You can only access your own profile unless you have hiring-manager privileges.',
    ErrorCodes.ACCESS_FORBIDDEN,
    { httpStatusCode: HttpStatusCodes.FORBIDDEN },
  );
}

/**
 * Safely checks if a user has access to a profile without throwing errors.
 * This is useful for conditional UI rendering or when you want to handle access denial gracefully.
 *
 * @param session - The authenticated session containing the requester's information
 * @param targetUserId - The ID parameter from the route (the profile being accessed)
 * @returns Promise<boolean> - True if access is granted, false otherwise
 */
export async function hasProfileAccess(session: AuthenticatedSession, targetUserId: string): Promise<boolean> {
  try {
    await requireProfileAccess(session, targetUserId);
    return true;
  } catch (error) {
    if (error instanceof AppError) {
      log.debug(`Profile access check failed: ${error.message}`);
      return false;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Gets the profile if the user has access to it.
 * This is a convenience function that combines profile access checking with profile retrieval.
 *
 * @param session - The authenticated session containing the requester's information
 * @param targetUserId - The ID parameter from the route (the profile being accessed)
 * @returns The profile if access is granted
 * @throws {AppError} If the profile is not found or access is denied
 */
export async function getProfileWithAccess(session: AuthenticatedSession, targetUserId: string) {
  await requireProfileAccess(session, targetUserId);

  const profileService = getProfileService();
  const profileOption = await profileService.getProfile(targetUserId);

  // We already checked that the profile exists in requireProfileAccess,
  // so this should never be None, but we'll be defensive
  if (profileOption.isNone()) {
    throw new AppError(`Profile not found for user ID: ${targetUserId}`, ErrorCodes.PROFILE_NOT_FOUND, {
      httpStatusCode: HttpStatusCodes.NOT_FOUND,
    });
  }

  return profileOption.unwrap();
}

/**
 * Checks profile access for profile routes in the parent layout.
 * This function should be called in the layout loader to check if:
 * 1. The current route is a profile route (employee/[id]/profile/*)
 * 2. The authenticated user has access to view/modify the requested profile
 *
 * Access is granted if:
 * - The requester is accessing their own profile, OR
 * - The requester has the "hiring-manager" role
 *
 * @param session - The authenticated session
 * @param currentUrl - The current request URL
 * @throws {AppError} If the profile is not found or access is denied
 */
export async function checkProfileRouteAccess(session: AuthenticatedSession, currentUrl: URL): Promise<void> {
  log.debug(`Checking profile route access for URL: ${currentUrl.pathname}`);

  // Only check profile access for profile routes
  if (!isProfileRoute(currentUrl)) {
    log.debug(`URL ${currentUrl.pathname} is not a profile route, skipping access check`);
    return;
  }

  log.debug(`URL ${currentUrl.pathname} is a profile route, checking access`);

  // Extract the user ID from the URL
  const targetUserId = extractUserIdFromProfileRoute(currentUrl);
  if (!targetUserId) {
    log.debug('Could not extract user ID from profile route');
    throw new AppError('Invalid profile route - user ID not found', ErrorCodes.ROUTE_NOT_FOUND, {
      httpStatusCode: HttpStatusCodes.BAD_REQUEST,
    });
  }

  log.debug(`Extracted user ID: ${targetUserId} from URL: ${currentUrl.pathname}`);

  // Apply profile access requirement
  await requireProfileAccess(session, targetUserId);
}
