import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';

/**
 * Checks if a lookup model item is expired based on its expiryDate.
 * Note: This only works with LookupModel types that have expiryDate.
 * LocalizedLookupModel types don't include expiryDate, so they will always return false.
 * @param item - The lookup model item to check
 * @returns true if the item has an expiryDate in the past, false otherwise
 */
export function isLookupExpired(item: LookupModel | LocalizedLookupModel | null | undefined): boolean {
  if (!item) {
    return false;
  }

  // LocalizedLookupModel doesn't have expiryDate, so we can't check expiry
  // This is a type guard to check if the item has expiryDate property
  if (!('expiryDate' in item) || !item.expiryDate) {
    return false;
  }

  const expiryDate = new Date(item.expiryDate);
  const now = new Date();

  return expiryDate <= now;
}

/**
 * Filters out expired items from a lookup model array.
 * @param items - Array of lookup model items
 * @returns Array with only non-expired items
 */
export function filterExpiredLookups<T extends LookupModel>(items: T[]): T[] {
  return items.filter((item) => !isLookupExpired(item));
}
