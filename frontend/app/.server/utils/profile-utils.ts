import { getProfileService } from '~/.server/domain/services/profile-service';

/**
 * Utility function to get a user's profile by Active Directory ID
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns The user's profile or null if not found
 * @throws AppError if there's an issue fetching the profile
 */
export async function getUserProfile(activeDirectoryId: string) {
  const profileService = getProfileService();
  const profileOption = await profileService.getProfile(activeDirectoryId);
  return profileOption.isSome() ? profileOption.unwrap() : null;
}

/**
 * Utility function to register a new profile for a user
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns The newly created profile
 * @throws AppError if there's an issue creating the profile
 */
export async function createUserProfile(activeDirectoryId: string) {
  const profileService = getProfileService();
  const newProfile = await profileService.registerProfile(activeDirectoryId);
  return newProfile;
}

/**
 * Utility function that ensures a user has a profile
 * If the user doesn't have a profile, it creates one
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns The user's profile (existing or newly created)
 * @throws AppError if there's an issue with profile operations
 */
export async function ensureUserProfile(activeDirectoryId: string) {
  const profileService = getProfileService();

  // First, try to get existing profile
  const profileOption = await profileService.getProfile(activeDirectoryId);

  // If no profile exists, create one
  if (profileOption.isSome()) {
    return profileOption.unwrap();
  } else {
    return await profileService.registerProfile(activeDirectoryId);
  }
}

/**
 * Utility function to check if a user has a profile
 * @param activeDirectoryId - The user's Active Directory ID
 * @returns True if the user has a profile, false otherwise
 * @throws AppError if there's an issue fetching the profile
 */
export async function hasUserProfile(activeDirectoryId: string): Promise<boolean> {
  const profile = await getUserProfile(activeDirectoryId);
  return profile !== null;
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
