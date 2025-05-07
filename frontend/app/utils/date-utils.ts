/**
 * Checks if a given string is a valid time zone.
 * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @param timeZone - The time zone string to validate.
 * @returns `true` if the time zone is valid, `false` if it is not
 */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch {
    return false;
  }

  return true;
}
