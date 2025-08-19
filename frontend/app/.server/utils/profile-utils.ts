import type { Profile, ProfilePutModel, User, UserQueryParams } from '~/.server/domain/models';
import { getUserService } from '~/.server/domain/services/user-service';

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

    // If it passed all the checks, it's completed!
    completedCount++;
  }

  return completedCount;
}

/**
 * Counts the number of "completed" referral preference fields.
 * For referral preferences, completion rules are:
 * - Array fields (preferredLanguages, preferredClassifications, preferredCities, preferredEmploymentOpportunities):
 *   Must have at least one item to be considered complete
 * - Boolean fields (isAvailableForReferral, isInterestedInAlternation):
 *   Must be defined as true or false (not undefined)
 *
 * @param data The referral preferences object containing the fields to check.
 * @returns The number of completed referral preference fields.
 */
export function countReferralPreferencesCompleted(data: {
  preferredLanguages?: unknown[] | null;
  preferredClassifications?: unknown[] | null;
  preferredCities?: unknown[] | null;
  preferredEmploymentOpportunities?: unknown[] | null;
  isAvailableForReferral?: boolean | null;
  isInterestedInAlternation?: boolean | null;
}): number {
  let completed = 0;

  // Array fields - must have at least one item
  const arrayFields = [
    'preferredLanguages',
    'preferredClassifications',
    'preferredCities',
    'preferredEmploymentOpportunities',
  ] as const;
  for (const field of arrayFields) {
    const fieldValue = data[field];
    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
      completed++;
    }
  }

  // Boolean fields - must be defined (true or false)
  const booleanFields = ['isAvailableForReferral', 'isInterestedInAlternation'] as const;
  for (const field of booleanFields) {
    if (typeof data[field] === 'boolean') {
      completed++;
    }
  }

  return completed;
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

/**
 * Creates a new object by picking only the specified keys from a source object.
 * Always returns an object. If the source is null, it returns an empty object.
 * @param obj The source object to pick properties from.
 * @param keysToKeep The array of property keys to include in the new object.
 * @returns A new object with only the specified properties.
 */
export function pickObjectProperties<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  keysToKeep: K[],
): Pick<T, K> {
  // If the source object is null or undefined, return an empty object.
  if (!obj) {
    return {} as Pick<T, K>; //
  }

  const result = {} as Pick<T, K>;

  for (const key of keysToKeep) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

const userParams: UserQueryParams = {
  'user-type': 'hr-advisor',
};

// Function to get HR advisors that requires authentication
export async function getHrAdvisors(accessToken: string): Promise<User[]> {
  const result = await getUserService().getUsers(userParams, accessToken);

  if (result.isErr()) {
    throw result.unwrapErr();
  }
  return result.unwrap().content;
}

// TODO complete the function body
export function hasEmploymentDataChanged(oldData: Profile, newData: ProfilePutModel) {
  return false;
}

/**
 * Maps a Profile read model to a ProfilePutModel for updating via PUT endpoint.
 * This function extracts IDs from nested objects and ensures all fields are properly mapped
 * to prevent null value errors when calling the PUT /api/v1/profiles/{id} endpoint.
 *
 * @param profile The profile read model to convert
 * @returns A complete ProfilePutModel with all fields mapped from the source profile
 *
 * @example
 * ```typescript
 * // Basic usage - convert profile to put model format
 * const profile = await profileService.getProfileById(profileId, accessToken);
 * const putModel = mapProfileToPutModel(profile);
 * await profileService.updateProfileById(profileId, putModel, accessToken);
 * ```
 */
export function mapProfileToPutModel(profile: Profile): ProfilePutModel {
  return {
    additionalComment: profile.additionalComment,
    cityId: profile.substantiveCity?.id,
    classificationId: profile.substantiveClassification?.id,
    hasConsentedToPrivacyTerms: profile.hasConsentedToPrivacyTerms,
    hrAdvisorId: profile.hrAdvisorId,
    isAvailableForReferral: profile.isAvailableForReferral,
    isInterestedInAlternation: profile.isInterestedInAlternation,
    languageOfCorrespondenceId: profile.languageOfCorrespondence?.id,
    personalEmailAddress: profile.personalEmailAddress,
    personalPhoneNumber: profile.personalPhoneNumber,
    preferredCities: profile.preferredCities?.map((city) => city.id),
    preferredClassification: profile.preferredClassifications?.map((classification) => classification.id),
    preferredEmploymentOpportunities: profile.preferredEmploymentOpportunities?.map((opportunity) => opportunity.id),
    preferredLanguages: profile.preferredLanguages?.map((language) => language.id),
    wfaEndDate: profile.wfaEndDate,
    wfaStartDate: profile.wfaStartDate,
    wfaStatusId: profile.wfaStatus?.id,
    workUnitId: profile.substantiveWorkUnit?.id,
  };
}

/**
 * Maps a Profile read model to a ProfilePutModel with specific field overrides.
 * This is useful when you want to update only certain fields while preserving all others.
 *
 * @param profile The profile read model to convert
 * @param overrides Partial ProfilePutModel with fields to override
 * @returns A complete ProfilePutModel with overridden fields applied
 *
 * @example
 * ```typescript
 * // Update only privacy consent while preserving all other fields
 * const profile = await profileService.getProfileById(profileId, accessToken);
 * const putModel = mapProfileToPutModelWithOverrides(profile, {
 *   hasConsentedToPrivacyTerms: true,
 * });
 * await profileService.updateProfileById(profileId, putModel, accessToken);
 *
 * // Update multiple fields
 * const putModel = mapProfileToPutModelWithOverrides(profile, {
 *   personalEmailAddress: 'new@example.com',
 *   isAvailableForReferral: false,
 *   preferredCities: [1, 2, 3], // Array of city IDs
 * });
 * ```
 */
export function mapProfileToPutModelWithOverrides(profile: Profile, overrides: Partial<ProfilePutModel>): ProfilePutModel {
  const basePutModel = mapProfileToPutModel(profile);
  return { ...basePutModel, ...overrides };
}

export function hasReferralDataChanged(oldData: Profile, newData: ProfilePutModel): boolean {
  const normalizedOld = {
    preferredClassifications: oldData.preferredClassifications?.map((c) => c.id) ?? [],
    preferredCities: oldData.preferredCities?.map((c) => c.id) ?? [],
  };

  const normalizedNew = {
    preferredClassifications: newData.preferredClassification ?? [],
    preferredCities: newData.preferredCities ?? [],
  };

  return !deepEqual(normalizedOld, normalizedNew);
}

// TODO consider lodash instead
function deepEqual(x: unknown, y: unknown): boolean {
  if (x === y) return true;
  if (typeof x !== 'object' || x === null || typeof y !== 'object' || y === null) return false;
  const keysX = Object.keys(x);
  const keysY = Object.keys(y);
  if (keysX.length !== keysY.length) return false;
  for (const key of keysX) {
    if (!keysY.includes(key)) return false;
    if (!deepEqual((x as Record<string, unknown>)[key], (y as Record<string, unknown>)[key])) return false;
  }
  return true;
}
