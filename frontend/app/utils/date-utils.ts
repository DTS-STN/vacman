import { TZDate } from '@date-fns/tz';
import { format, formatISO, isBefore, isToday, isValid, parseISO, startOfDay } from 'date-fns';

import { padWithZero } from '~/utils/string-utils';

/**
 * Returns the start of the day in the specified timezone.
 *
 * This function takes a date (or timestamp) and a timezone, and returns a new Date object
 * representing the start of the day (midnight) in that timezone. If no date is provided,
 * the current date and time are used.
 *
 * @param timezone - The IANA timezone string (e.g., 'America/New_York', 'Europe/London').
 * @param date - Optional date or timestamp to use. If not provided, the current date and time are used.
 *               Can be a number (milliseconds since epoch), a string (parsable by `new Date()`), or a Date object.
 * @returns A new Date object representing the start of the day in the specified timezone.
 *
 * @example
 * ``` typescript
 * // Get the start of today in New York
 * const startOfTodayNY = getStartOfDayInTimezone('America/New_York');
 *
 * // Get the start of the day for a specific date in London
 * const specificDate = new Date('2024-03-15T10:00:00Z'); // UTC time
 * const startOfSpecificDayLondon = getStartOfDayInTimezone('Europe/London', specificDate);
 *
 * // Get the start of the day using a timestamp
 * const timestamp = 1700000000000; // Example timestamp
 * const startOfDayWithTimestamp = getStartOfDayInTimezone('America/Los_Angeles', timestamp);
 * ```
 */
export function getStartOfDayInTimezone(timezone: string, date?: number | string | Date): Date {
  const targetDate = new Date(date ?? Date.now());
  return startOfDay(
    TZDate.tz(
      timezone,
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      targetDate.getUTCHours(),
      targetDate.getUTCMinutes(),
      targetDate.getUTCSeconds(),
      targetDate.getUTCMilliseconds(),
    ),
  );
}

/**
 * Checks if a given date is in the past or present (today) within a specified timezone.
 *
 * This function determines whether the provided date falls on or before the current date
 * when considering the given timezone. It accepts the date as a number (Unix timestamp in milliseconds),
 * a string (parsable by the Date constructor), or a Date object.
 *
 * @param timeZone - The IANA time zone name (e.g., 'America/New_York', 'Europe/London').
 * @param date - The date to be validated. Can be a Unix timestamp (milliseconds),
 *               a date string, or a Date object.
 * @returns `true` if the date is in the past or today in the specified timezone, `false` otherwise.
 * @throws TypeError - If the input `date` is not a valid date representation that can be parsed,
 *         or if the `timezone` string is not a valid IANA time zone name.
 *
 * @example
 * ``` typescript
 * const validDateInPaste = "2023-05-20";
 * const invalidDateInFuture = "2078-05-20";
 * const timezone = 'Canada/Eastern';
 *
 * console.log(isPastOrTodayInTimeZone(timezone, validDateInPaste)); // true
 * console.log(isPastOrTodayInTimeZone(timezone, invalidDateInFuture)); // false
 * ```
 */
export function isPastOrTodayInTimeZone(timezone: string, date: number | string | Date): boolean {
  return isPastInTimezone(timezone, date) || isTodayInTimezone(timezone, date);
}

/**
 * Checks if a given date is in the past within a specified timezone.
 *
 * This function determines whether the provided date is before the start of the current day
 * in the given timezone. It accepts the date as a number (Unix timestamp in milliseconds),
 * a string (parsable by the Date constructor), or a Date object. It uses `getStartOfDayInTimezone`
 * to get the start of the current day in the specified timezone and `isBefore`
 * from date-fns library to perform the comparison.
 *
 * @param timezone - The IANA time zone name (e.g., 'America/New_York', 'Europe/London').
 * @param date - The date to be validated. Can be a Unix timestamp (milliseconds),
 *               a date string, or a Date object.
 * @returns `true` if the date is in the past in the specified timezone, `false` otherwise.
 * @throws TypeError - If the input `date` is not a valid date representation that can be parsed,
 *         or if the `timezone` string is not a valid IANA time zone name, or if `getStartOfDayInTimezone`
 *         or `isBefore` throw an error.
 *
 * @example
 * ``` typescript
 * const validDateInPaste = "2023-05-20";
 * const invalidDateInFuture = "2078-05-20";
 * const timezone = 'Canada/Eastern';
 *
 * console.log(isPastInTimezone(timezone, validDateInPaste)); // true
 * console.log(isPastInTimezone(timezone, invalidDateInFuture)); // false
 * ```
 */
export function isPastInTimezone(timezone: string, date: number | string | Date): boolean {
  return isBefore(date, getStartOfDayInTimezone(timezone));
}

/**
 * Checks if a given date is today's date within a specified timezone.
 *
 * This function determines whether the provided date falls on the current date
 * when considering the given timezone. It accepts the date as a number (Unix timestamp in milliseconds),
 * a string (parsable by the Date constructor), or a Date object. It uses `getStartOfDayInTimezone`
 * to get the start of the current day in the specified timezone and `isToday`
 * from date-fns library to perform the comparison.
 *
 * @param timezone - The IANA time zone name (e.g., 'America/New_York', 'Europe/London').
 * @param date - The date to be validated. Can be a Unix timestamp (milliseconds),
 *               a date string, or a Date object.
 * @returns `true` if the date is today in the specified timezone, `false` otherwise.
 * @throws TypeError - If the input `date` is not a valid date representation that can be parsed,
 *         or if the `timezone` string is not a valid IANA time zone name, or if `getStartOfDayInTimezone`
 *         or `isToday` throw an error.
 *
 * @example
 * ``` typescript
 * const validDate = new Date();
 * const invalidDateInFuture = "2078-05-20";
 * const timezone = 'Canada/Eastern';
 *
 * console.log(isTodayInTimezone(timezone, validDateInPaste)); // true
 * console.log(isTodayInTimezone(timezone, invalidDateInFuture)); // false
 * ```
 */
export function isTodayInTimezone(timezone: string, date: number | string | Date): boolean {
  return isToday(getStartOfDayInTimezone(timezone, date));
}

/**
 * Checks if a given date is in the past or present (today) within a specified timezone.
 *
 * This function determines whether the provided date falls on or before the current date
 * when considering the given timezone. It accepts the date as a number (Unix timestamp in milliseconds),
 * a string (parsable by the Date constructor), or a Date object.
 *
 * @param timeZone - The IANA time zone name (e.g., 'America/New_York', 'Europe/London').
 * @param date - The date to be validated. Can be a Unix timestamp (milliseconds),
 *               a date string, or a Date object.
 * @returns `true` if the date is in the past or today in the specified timezone, `false` otherwise.
 * @throws TypeError - If the input `date` is not a valid date representation that can be parsed,
 *         or if the `timezone` string is not a valid IANA time zone name.
 *
 * @example
 * ``` typescript
 * const validDateInPaste = "2023-05-20";
 * const invalidDateInFuture = "2078-05-20";
 * const timezone = 'Canada/Eastern';
 *
 * console.log(isDateInPastOrTodayInTimeZone(timezone, validDateInPaste)); // true
 * console.log(isDateInPastOrTodayInTimeZone(timezone, invalidDateInFuture)); // false
 * ```
 */
export function isDateInPastOrTodayInTimeZone(timezone: string, date: number | string | Date): boolean {
  return isPastInTimezone(timezone, date) || isTodayInTimezone(timezone, date);
}

/**
 * Checks if a given string is a valid date string in ISO 8601 format (YYYY-MM-DD).
 *
 * This function uses `parseISO` (presumably from a date/time library like date-fns)
 * to parse the input string and then `isValid` to check if the parsing was successful,
 * indicating a valid ISO 8601 date string.
 *
 * @param date - The date string to be validated.
 * @returns `true` if the string is a valid ISO 8601 date string (YYYY-MM-DD), `false` otherwise.
 * @throws TypeError - If the input `date` is not a string.
 *
 * @example
 * ``` typescript
 * const validDate = "2023-05-20";
 * const invalidDate = "20-05-2023";
 *
 * console.log(isValidDateString(validDate)); // true
 * console.log(isValidDateString(invalidDate)); // false
 * ```
 */
export function isValidDateString(date: string): boolean {
  return isValid(parseISO(date));
}

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

/**
 * Parses a date string in the format "YYYY-MM-DD" and returns an object with the parsed components.
 * @param date The date string to parse.
 * @returns An object containing the parsed components (year, month, day). Returns an empty object if parsing fails or if the date does not exist.
 */
export function extractDateParts(date: string): { year?: string; month?: string; day?: string } {
  const [yearStr, monthStr, dayStr] = date.split('-');

  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return {};
  if (!dateExists(year, month - 1, day)) return {};

  return {
    year: padWithZero(year, 4),
    month: padWithZero(month, 2),
    day: padWithZero(day, 2),
  };
}

/**
 * Validates a date (year, month, day) if it exist.
 * @param year - The year as number to validate.
 * @param month - The month as number to validate.
 * @param day - The day as number to validate.
 * @returns A boolean - true if the date exists or false if the date does not exist.
 */
export function dateExists(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

/**
 * Retrieve an array of months based on the provided locale and format.
 * @param locale - The locale to use for formatting the months.
 * @param format - The format for displaying the months.
 * @returns An array containing objects with month index and formatted month text.
 */
export function getLocalizedMonths(
  locale: string,
  format: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined = 'long',
): { index: number; text: string }[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format, timeZone: 'UTC' });

  return Array.from({ length: 12 }, (_, i) => ({
    index: i + 1, // month index (1-based)
    text: formatter.format(Date.UTC(0, i, 1)), // formatted month name
  }));
}

/**
 * Formats a date into an ISO8601 date string (YYYY-MM-DD).
 *
 * This function takes the year, month, and day as numerical inputs and
 * returns a string representing the date in the "YYYY-MM-DD" format.
 *
 * @param year - The year (e.g., 2023).
 * @param month - The month (1 for January, 12 for December).
 * @param day - The day of the month.
 * @returns An ISO 8601 date string in the format "YYYY-MM-DD".
 */
export function toISODateString(year: number, month: number, day: number): string {
  return formatISODate(`${year}-${month}-${day}`);
}

/**
 * Formats a date into an ISO8601 date string (YYYY-MM-DD).
 *
 * This function accepts a date as a number (Unix timestamp in milliseconds),
 * a string (parsable by the Date constructor), or a Date object and returns
 * a string representing the date in the "YYYY-MM-DD" format. It leverages
 * the `formatISO` function from date-fns library
 * with the `representation: 'date'` option.
 *
 * @param date - The date to be formatted. Can be a Unix timestamp (milliseconds), a date string, or a Date object.
 * @returns An ISO 8601 date string in the format "YYYY-MM-DD".
 * @throws {TypeError} If the input `date` is not a valid date representation that can be parsed by `formatISO`.
 */
export function formatISODate(date: number | string | Date): string {
  return formatISO(date, { representation: 'date' });
}

/**
 * Formats a date into a custom string with date and time (YYYY-MM-DD HH:MM).
 *
 * This function accepts a date as a string, a number (Unix timestamp in milliseconds),
 * or a Date object and returns a string representing the date and time in the
 * "YYYY-MM-DD HH:mm" format.
 *
 * @param date - The date to be formatted. Can be an ISO string, a Unix timestamp, or a Date object.
 * @returns A formatted string in the "YYYY-MM-DD HH:mm" format.
 */
export function formatDateTime(date: string | number | Date): string {
  // If the input is an ISO string like '2025-07-29T18:20:11.406Z',
  // it's best to parse it first to ensure correct handling.
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }

  return format(dateObj, 'yyyy-MM-dd HH:mm');
}

/** Convert any date to a Date object pinned to a specific IANA time zone */
export function toZonedDate(date: string | number | Date, timeZone: string): Date {
  return new TZDate(new Date(date)).withTimeZone(timeZone);
}

/** Format a date in a specific IANA time zone, default pattern: 'yyyy-MM-dd HH:mm' */
export function formatDateTimeInZone(date: string | number | Date, timeZone: string, pattern = 'yyyy-MM-dd HH:mm'): string {
  return format(toZonedDate(date, timeZone), pattern);
}

/**
 * Formats a UTC date/time string or Date object to a localized string for a specific timezone.
 *
 * @param date - The UTC date to format. Can be an ISO string, date string or Date.
 * @param targetTimeZone - The IANA timezone name (e.g., 'America/Toronto', 'Europe/London')
 * @param locale - The language locale for formatting. Defaults to 'en'
 *
 * @returns Formatted date string in the pattern "MM/DD/YYYY, HH:MM AM/PM TZ" (locale-specific) or original string if formatting fails.
 */
export function formatDateTimeForTimezone(date: string | Date, targetTimeZone: string, locale: Language = 'en'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatter = new Intl.DateTimeFormat(`${locale}-CA`, {
      timeZone: isValidTimeZone(targetTimeZone) ? targetTimeZone : 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short', // Displays the short timezone name (e.g., EST, EDT)
    });
    return formatter.format(dateObj);
  } catch {
    return String(date);
  }
}

export function isValidCalendarDate(date: string): boolean {
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return dateExists(year, month - 1, day);
}
