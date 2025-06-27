import { getProfileService } from '~/.server/domain/services/profile-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

/**
 * Utility function to get a user's profile by Active Directory ID
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns The user's profile or null if not found
 * @throws Error if there's an issue fetching the profile
 */
export async function getUserProfile(activeDirectoryId: string) {
  const profileService = getProfileService();

  try {
    const profile = await profileService.getProfile(activeDirectoryId);

    if (profile) {
      console.log(`Found profile for user ${activeDirectoryId}:`, profile);
      return profile;
    } else {
      console.log(`No profile found for user ${activeDirectoryId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching profile for user ${activeDirectoryId}:`, error);
    throw error;
  }
}

/**
 * Utility function to register a new profile for a user
 * @param activeDirectoryId - The user's Active Directory ID
 * @param session - The authenticated session
 * @returns The newly created profile
 * @throws Error if there's an issue creating the profile
 */
export async function createUserProfile(activeDirectoryId: string, session: AuthenticatedSession) {
  const profileService = getProfileService();

  try {
    const newProfile = await profileService.registerProfile(activeDirectoryId, session);
    console.log(`Successfully created profile for user ${activeDirectoryId}:`, newProfile);
    return newProfile;
  } catch (error) {
    console.error(`Error creating profile for user ${activeDirectoryId}:`, error);
    throw error;
  }
}

/**
 * Utility function that ensures a user has a profile
 * If the user doesn't have a profile, it creates one
 * @param activeDirectoryId - The user's Active Directory ID
 * @param session - The authenticated session
 * @returns The user's profile (existing or newly created)
 * @throws Error if there's an issue with profile operations
 */
export async function ensureUserProfile(activeDirectoryId: string, session: AuthenticatedSession) {
  const profileService = getProfileService();

  // First, try to get existing profile
  let profile = await profileService.getProfile(activeDirectoryId);

  if (!profile) {
    // If no profile exists, create one
    console.log(`No profile found for user ${activeDirectoryId}. Creating new profile...`);
    profile = await profileService.registerProfile(activeDirectoryId, session);
  }

  return profile;
}

/**
 * Utility function to check if a user has a profile
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns True if the user has a profile, false otherwise
 */
export async function hasUserProfile(activeDirectoryId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(activeDirectoryId);
    return profile !== null;
  } catch (error) {
    console.error(`Error checking if user ${activeDirectoryId} has a profile:`, error);
    return false;
  }
}

/**
 * Utility function to safely get a user's profile without throwing errors
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns The user's profile or null if not found or on error
 */
export async function safeGetUserProfile(activeDirectoryId: string) {
  try {
    return await getUserProfile(activeDirectoryId);
  } catch (error) {
    console.error(`Safe get profile failed for user ${activeDirectoryId}:`, error);
    return null;
  }
}
