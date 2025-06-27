// Example of how to use the Profile Service
import { getProfileService } from '~/.server/domain/services/profile-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

/**
 * Example function showing how to get a user's profile
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
 * Example function showing how to register a new profile for a user
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
 * Example function that demonstrates a complete flow:
 * 1. Check if user has a profile
 * 2. If not, create one
 * 3. Return the profile
 */
export async function getOrCreateUserProfile(activeDirectoryId: string, session: AuthenticatedSession) {
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
