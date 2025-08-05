import type { UserEmploymentInformation } from '../domain/models';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { LogFactory } from '~/.server/logging';

const log = LogFactory.getLogger(import.meta.url);

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
    log.error(`Safe get profile failed for user ${activeDirectoryId}:`, error);
    return null;
  }
}

/**
 * Counts the number of "completed" items in a given data object.
 * A value is considered "completed" if it is not:
 * - null or undefined
 * - an empty string ('')
 * - an empty array ([])
 * - the number 0
 *
 * @param data The object containing the data fields.
 * @returns The number of completed fields.
 */
export function countCompletedItems<T extends object>(data: T): number {
  let completedCount = 0;

  for (const item of Object.values(data)) {
    // --- Define all INCOMPLETE conditions ---

    if (item === null) continue; // Skip null
    if (item === undefined) continue; // Skip undefined
    if (typeof item === 'string' && item.length === 0) continue; // Skip empty strings
    if (Array.isArray(item) && item.length === 0) continue; // Skip empty arrays
    if (typeof item === 'number' && item === 0) continue; // Skip the number 0

    // If it passed all the checks, it's completed!
    completedCount++;
  }

  return completedCount;
}

/**
 * Creates a new object by omitting the specified keys from the original object.
 * @param obj The object to remove properties from.
 * @param keys The array of property keys to omit.
 * @returns A new object without the specified properties.
 */
export function omitObjectProperties<T extends object, K extends keyof T>(obj: T, keysToOmit: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  const keysToOmitSet = new Set(keysToOmit);

  for (const key of Object.keys(obj) as (keyof T)[]) {
    // Check if the current key is not in the set of keys to omit.
    if (!keysToOmitSet.has(key as K)) {
      // Add this key and its value to the result object
      (result as T)[key] = obj[key];
    }
  }

  return result;
}

export function hasEmploymentDataChanged(oldData: UserEmploymentInformation, newData: UserEmploymentInformation) {
  const keysToCheck: (keyof UserEmploymentInformation)[] = [
    'substantivePosition',
    'wfaStatus',
    'wfaEffectiveDate',
    'wfaEndDate',
    'hrAdvisor',
  ];
  for (const key of keysToCheck) {
    if (newData[key] !== oldData[key]) return true;
  }
  return false;
}
