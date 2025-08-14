import type { UserEmploymentInformation, UserReferralPreferences } from '~/.server/domain/models';

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

export function hasEmploymentDataChanged(oldData: UserEmploymentInformation, newData: UserEmploymentInformation) {
  const keysToCheck: (keyof UserEmploymentInformation)[] = [
    'substantivePosition',
    'wfaStatus',
    'wfaEffectiveDate',
    'wfaEndDate',
    'hrAdvisor',
  ];
  return keysToCheck.some((key) => newData[key] !== oldData[key]);
}

export function hasReferralDataChanged(oldData: UserReferralPreferences, newData: UserReferralPreferences) {
  const keysToCheck: (keyof UserReferralPreferences)[] = ['classificationIds', 'workLocationCitiesIds', 'workLocationProvince'];
  return keysToCheck.some((key) => newData[key] !== oldData[key]);
}
