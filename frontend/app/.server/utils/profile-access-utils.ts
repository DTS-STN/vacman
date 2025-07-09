/**
 * Utility functions for handling profile access control.
 * This module provides functions to verify if users have access to view or modify profiles
 * based on their role and relationship to the profile owner.
 */
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { extractUserIdFromProfileRoute, isProfileRoute } from '~/.server/utils/route-matching-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Checks if the authenticated user has access to view or modify a specific profile.
 * Access is granted if:
 * 1. The requester is accessing their own profile, OR
 * 2. The requester has the "hiring-manager" role
 *
 * For users accessing their own profile, privacy consent is also checked.
 *
 * @param session - The authenticated session containing the requester's information
 * @param targetUserId - The ID parameter from the route (the profile being accessed)
 * @param currentUrl - The current request URL for redirect context (optional, used for privacy consent redirect)
 * @throws {AppError} If the profile is not found or access is denied
 * @throws {Response} Redirect if privacy consent is required
 */
export async function requireProfileAccess(
  session: AuthenticatedSession,
  targetUserId: string,
  currentUrl?: URL,
): Promise<void> {
  const requesterId = session.authState.idTokenClaims.oid as string;

  log.debug(`Profile access check: requester=${requesterId}, target=${targetUserId}`);

  // First, check if the profile exists
  const profileService = getProfileService();
  const profileOption = await profileService.getProfile(targetUserId);

  if (profileOption.isNone()) {
    log.debug(`Profile not found: ${targetUserId}`);
    throw new AppError(`Profile not found for user ID: ${targetUserId}`, ErrorCodes.PROFILE_NOT_FOUND, {
      httpStatusCode: HttpStatusCodes.NOT_FOUND,
    });
  }

  // If the requester is accessing their own profile, check privacy consent and grant access
  if (requesterId === targetUserId) {
    log.debug('Own profile access - checking privacy consent');
    if (currentUrl) {
      await requirePrivacyConsentForOwnProfile(session, targetUserId, currentUrl);
    }
    log.debug('Own profile access granted');
    return;
  }

  // If not accessing own profile, check if requester has hiring-manager role
  const userService = getUserService();
  const requesterUser = await userService.getUserByActiveDirectoryId(requesterId);

  if (!requesterUser) {
    log.debug(`Requester not found: ${requesterId}`);
    throw new AppError(`Requester not found in system: ${requesterId}`, ErrorCodes.ACCESS_FORBIDDEN, {
      httpStatusCode: HttpStatusCodes.FORBIDDEN,
    });
  }

  if (requesterUser.role === 'hiring-manager') {
    log.debug('Hiring manager access granted');
    return;
  }

  // Access denied - user is not accessing their own profile and doesn't have hiring-manager role
  log.debug(`Access denied: requester=${requesterId}, role=${requesterUser.role}`);
  throw new AppError(
    `Access denied. requester=${requesterId}, role=${requesterUser.role}. You can only access your own profile unless you have hiring-manager privileges.`,
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
 * @param currentUrl - The current request URL for redirect context (optional)
 * @returns Promise<boolean> - True if access is granted, false otherwise
 */
export async function hasProfileAccess(
  session: AuthenticatedSession,
  targetUserId: string,
  currentUrl?: URL,
): Promise<boolean> {
  try {
    await requireProfileAccess(session, targetUserId, currentUrl);
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
 * @param currentUrl - The current request URL for redirect context (optional)
 * @returns The profile if access is granted
 * @throws {AppError} If the profile is not found or access is denied
 */
export async function getProfileWithAccess(session: AuthenticatedSession, targetUserId: string, currentUrl?: URL) {
  await requireProfileAccess(session, targetUserId, currentUrl);

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
  // Only check profile access for profile routes
  if (!isProfileRoute(currentUrl)) {
    return;
  }

  // Extract the user ID from the URL
  const targetUserId = extractUserIdFromProfileRoute(currentUrl);
  if (!targetUserId) {
    log.debug('Invalid profile route - no user ID found');
    throw new AppError('Invalid profile route - user ID not found', ErrorCodes.ROUTE_NOT_FOUND, {
      httpStatusCode: HttpStatusCodes.BAD_REQUEST,
    });
  }

  // Apply profile access requirement
  await requireProfileAccess(session, targetUserId, currentUrl);
}
