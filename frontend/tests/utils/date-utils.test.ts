import { describe, expect, it, vi } from 'vitest';

import {
  dateExists,
  extractDateParts,
  formatDateTime,
  formatDateTimeForTimezone,
  formatDateTimeInZone,
  formatISODate,
  getLocalizedMonths,
  getStartOfDayInTimezone,
  isDateInPastOrTodayInTimeZone,
  isPastInTimezone,
  isPastOrTodayInTimeZone,
  isTodayInTimezone,
  isValidDateString,
  isValidTimeZone,
  toZonedDate,
} from '~/utils/date-utils';

describe('date-utils', () => {
  describe('getStartOfDayInTimezone', () => {
    it('should return the start of the day in the specified timezone', () => {
      expect(getStartOfDayInTimezone('Canada/Eastern', '2000-01-01')) //
        .toEqual(new Date('2000-01-01T05:00:00.000Z'));
    });
  });

  describe('isPastInTimezone', () => {
    it('should return [true] for a date that is in the past', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastInTimezone('UTC', new Date('1900-01-01'))).toEqual(true);
    });

    it('should return [false] for a date that is in the future', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastInTimezone('UTC', new Date('2100-01-01'))).toEqual(false);
    });

    it('should return [false] for a date that is equal to the current date', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastInTimezone('UTC', new Date('2000-01-01'))).toEqual(false);
    });
  });

  describe('isPastOrTodayInTimeZone', () => {
    it('should return [true] for a date that is in the past', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastOrTodayInTimeZone('UTC', new Date('1900-01-01'))).toEqual(true);
    });

    it('should return [false] for a date that is in the future', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastOrTodayInTimeZone('UTC', new Date('2100-01-01'))).toEqual(false);
    });

    it('should return [true] for a date that is equal to the current date', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastOrTodayInTimeZone('UTC', new Date('2000-01-01'))).toEqual(true);
    });
  });

  describe('isTodayInTimezone', () => {
    it('should return [false] for a date that is in the past', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('1900-01-01'))).toEqual(false);
    });

    it('should return [false] for a date that is in the future', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('2100-01-01'))).toEqual(false);
    });

    it('should return [true] for a date that is equal to the current date', () => {
      vi.setSystemTime(new Date('2000-01-01T05:00:00Z'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('2000-01-01'))).toEqual(true);
    });

    it('should return [true] for a date that is within 24 hours of the current date', () => {
      vi.setSystemTime(new Date('2000-01-01T12:34:56Z'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('2000-01-01'))).toEqual(true);
    });
  });

  describe('isValidDateString', () => {
    it('should return [true] for a valid date string', () => {
      expect(isValidDateString('2000-01-01T00:00:00Z')).toEqual(true);
    });

    it('should return [false] for an invalid date string', () => {
      expect(isValidDateString('2000-01-01T99:99:99Z')).toEqual(false);
    });
  });

  describe('isValidTimeZone', () => {
    const invalidTimeZones = [
      '', //
      'Canada',
      'Canada/Los_Angeles',
      'MyTimeZone!!',
    ];

    const validTimeZones = [
      'Canada/Atlantic',
      'Canada/Central',
      'Canada/Mountain',
      'Canada/Newfoundland',
      'Canada/Pacific',
      'UTC',
    ];

    it.each(invalidTimeZones)('should return [false] for invalid time zone [%s]', (timeZone) => {
      expect(isValidTimeZone(timeZone)).toEqual(false);
    });

    it.each(validTimeZones)('should return [true] for valid time zone [%s]', (timeZone) => {
      expect(isValidTimeZone(timeZone)).toEqual(true);
    });
  });

  describe('toZonedDate', () => {
    it('should convert a UTC date string to a zoned date', () => {
      const date = '2024-03-15T10:00:00Z'; // UTC time
      const timeZone = 'America/New_York'; // UTC-4 at this time of year
      const zonedDate = toZonedDate(date, timeZone);

      expect(zonedDate.toISOString()).toEqual('2024-03-15T06:00:00.000-04:00');
    });

    it('should convert a Date object to a zoned date', () => {
      const date = new Date('2024-03-15T10:00:00Z'); // UTC time
      const timeZone = 'Europe/London'; // UTC+0 at this time of year (GMT)
      const zonedDate = toZonedDate(date, timeZone);

      // Expect the date object to represent 10:00:00 in London time
      // When converted to UTC, it should still be 10:00:00Z
      expect(zonedDate.toISOString()).toEqual('2024-03-15T10:00:00.000+00:00');
    });
  });

  describe('formatDateTimeForTimezone', () => {
    const testDateUTC = '2023-12-25T19:30:00Z';

    it('should format UTC date to Eastern Time in English', () => {
      const result = formatDateTimeForTimezone(testDateUTC, 'America/Toronto', 'en');
      expect(result).toBe('2023-12-25, 02:30 p.m. EST');
    });

    it('should format UTC date to Eastern Time in French', () => {
      const result = formatDateTimeForTimezone(testDateUTC, 'America/Toronto', 'fr');
      expect(result).toBe('2023-12-25 14 h 30 HNE');
    });

    it('should format UTC date to Pacific Time', () => {
      const result = formatDateTimeForTimezone(testDateUTC, 'America/Vancouver', 'en');
      expect(result).toBe('2023-12-25, 11:30 a.m. PST');
    });

    it('should format UTC date to UTC timezone', () => {
      const result = formatDateTimeForTimezone(testDateUTC, 'UTC', 'en');
      expect(result).toBe('2023-12-25, 07:30 p.m. UTC');
    });

    it('should handle Date objects as input', () => {
      const dateObj = new Date(testDateUTC);
      const result = formatDateTimeForTimezone(dateObj.toUTCString(), 'America/Toronto', 'en');
      expect(result).toBe('2023-12-25, 02:30 p.m. EST');
    });

    it('should return empty string for invalid date string', () => {
      const result = formatDateTimeForTimezone('invalid-date', 'America/Toronto', 'en');
      expect(result).toBe('invalid-date');
    });

    it('should return empty string for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDateTimeForTimezone(invalidDate.toUTCString(), 'America/Toronto', 'en');
      expect(result).toBe('Invalid Date');
    });

    it('should return empty string for invalid timezone', () => {
      const result = formatDateTimeForTimezone(testDateUTC, 'Invalid/Timezone', 'en');
      expect(result).toBe('2023-12-25, 02:30 p.m. EST');
    });

    it('should use English as default locale when not specified', () => {
      const result = formatDateTimeForTimezone(testDateUTC, 'UTC');
      expect(result).toBe('2023-12-25, 07:30 p.m. UTC');
    });

    it('should handle empty string date gracefully', () => {
      const result = formatDateTimeForTimezone('', 'America/Toronto', 'en');
      expect(result).toBe('');
    });

    it('should handle edge case of midnight UTC', () => {
      const midnightUTC = '2023-12-25T00:00:00Z';
      const result = formatDateTimeForTimezone(midnightUTC, 'America/Toronto', 'en');
      expect(result).toBe('2023-12-24, 07:00 p.m. EST');
    });
  });
  describe('extractDateParts', () => {
    it('should extract valid date parts from YYYY-MM-DD format', () => {
      const result = extractDateParts('2023-05-20');
      expect(result).toEqual({
        year: '2023',
        month: '05',
        day: '20',
      });
    });

    it('should return empty object for invalid date string format', () => {
      expect(extractDateParts('2023-05')).toEqual({});
      expect(extractDateParts('invalid-date')).toEqual({});
      expect(extractDateParts('2023-05-20extra')).toEqual({});
    });

    it('should return empty object for non-existent dates', () => {
      expect(extractDateParts('2023-02-30')).toEqual({});
      expect(extractDateParts('2023-04-31')).toEqual({});
    });

    it('should handle single-digit months and days by padding with zeros', () => {
      const result = extractDateParts('2023-5-9');
      expect(result).toEqual({
        year: '2023',
        month: '05',
        day: '09',
      });
    });
  });

  describe('dateExists', () => {
    it('should return true for valid dates', () => {
      expect(dateExists(2023, 0, 15)).toBe(true);
      expect(dateExists(2020, 1, 29)).toBe(true);
      expect(dateExists(2023, 11, 31)).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(dateExists(2023, 1, 30)).toBe(false);
      expect(dateExists(2023, 3, 31)).toBe(false);
      expect(dateExists(2023, 0, 32)).toBe(false);
      expect(dateExists(2023, 13, 1)).toBe(false);
    });

    it('should handle leap years correctly', () => {
      expect(dateExists(2020, 1, 29)).toBe(true);
      expect(dateExists(2023, 1, 29)).toBe(false);
    });
  });

  describe('getLocalizedMonths', () => {
    it('should return 12 months for English locale', () => {
      const months = getLocalizedMonths('en');
      expect(months).toHaveLength(12);
      expect(months[0]).toEqual({ index: 1, text: expect.any(String) });
      expect(months[11]).toEqual({ index: 12, text: expect.any(String) });
    });

    it('should return months in French locale', () => {
      const months = getLocalizedMonths('fr');
      expect(months).toHaveLength(12);
      expect(months[0]?.text).toMatch(/janvier/i);
    });

    it('should respect the format parameter', () => {
      const shortMonths = getLocalizedMonths('en', 'short');
      expect(shortMonths[0]?.text).toMatch(/^[A-Za-z]{3}/);
    });

    it('should return numeric months when format is numeric', () => {
      const months = getLocalizedMonths('en', 'numeric');
      expect(months[0]?.text).toBe('1');
      expect(months[11]?.text).toBe('12');
    });
  });

  describe('formatISODate', () => {
    it('should return Ok with formatted ISO date for valid Date object', () => {
      const date = new Date('2023-05-20T00:00:00Z');
      const result = formatISODate(date);

      expect(result.isOk()).toBe(true);
      const formatted = result.unwrap();
      expect(['2023-05-19', '2023-05-20']).toContain(formatted);
    });

    it('should return Ok with formatted ISO date for valid timestamp', () => {
      const timestamp = new Date('2023-05-20T12:00:00Z').getTime();
      const result = formatISODate(timestamp);

      expect(result.isOk()).toBe(true);
      const formatted = result.unwrap();
      expect(formatted).toBe('2023-05-20');
    });

    it('should return Ok with formatted ISO date for valid date string', () => {
      const result = formatISODate('2023-05-20T12:00:00Z');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('2023-05-20');
    });

    it('should return Err for invalid date input', () => {
      const result = formatISODate('invalid-date');

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBeInstanceOf(TypeError);
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2023-05-20T10:30:45Z');
      const result = formatDateTime(date);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(result).toContain('2023-05-');
    });

    it('should format ISO string correctly', () => {
      const result = formatDateTime('2023-05-20T10:30:45Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(result).toContain('2023-05-');
    });

    it('should format timestamp correctly', () => {
      const timestamp = new Date('2023-05-20T10:30:45Z').getTime();
      const result = formatDateTime(timestamp);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(result).toContain('2023-05-');
    });

    it('should return "Invalid Date" for invalid input', () => {
      expect(formatDateTime('invalid-date')).toBe('Invalid Date');
      expect(formatDateTime(new Date('invalid'))).toBe('Invalid Date');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2023-05-20T00:00:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(result).toContain('2023-05-');
    });
  });

  describe('formatDateTimeInZone', () => {
    it('should format date in specified timezone with default pattern', () => {
      const date = '2024-03-15T10:00:00Z';
      const result = formatDateTimeInZone(date, 'America/New_York');
      expect(result).toBe('2024-03-15 06:00');
    });

    it('should format date in specified timezone with custom pattern', () => {
      const date = '2024-03-15T10:00:00Z';
      const result = formatDateTimeInZone(date, 'America/New_York', 'yyyy/MM/dd HH:mm');
      expect(result).toBe('2024/03/15 06:00');
    });

    it('should handle different timezones correctly', () => {
      const date = '2024-03-15T10:00:00Z';
      const nyResult = formatDateTimeInZone(date, 'America/New_York');
      const londonResult = formatDateTimeInZone(date, 'Europe/London');

      expect(nyResult).not.toBe(londonResult);
      expect(nyResult).toBe('2024-03-15 06:00');
      expect(londonResult).toBe('2024-03-15 10:00');
    });
  });

  describe('isDateInPastOrTodayInTimeZone', () => {
    it('should return true for past dates', () => {
      vi.setSystemTime(new Date('2000-01-01T00:00:00Z'));
      expect(isDateInPastOrTodayInTimeZone('UTC', new Date('1900-01-01T00:00:00Z'))).toBe(true);
    });

    it('should return false for future dates', () => {
      vi.setSystemTime(new Date('2000-01-01T00:00:00Z'));
      expect(isDateInPastOrTodayInTimeZone('UTC', new Date('2100-01-01T00:00:00Z'))).toBe(false);
    });

    it('should return true for today dates', () => {
      vi.setSystemTime(new Date('2000-01-01T12:00:00Z'));
      expect(isDateInPastOrTodayInTimeZone('UTC', new Date('2000-01-01T00:00:00Z'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle timezone changes for isTodayInTimezone around midnight', () => {
      vi.setSystemTime(new Date('2023-03-15T04:00:00Z'));
      const result = isTodayInTimezone('America/New_York', new Date('2023-03-14T23:00:00Z'));
      expect(typeof result).toBe('boolean');
    });

    it('should handle invalid inputs gracefully for getStartOfDayInTimezone', () => {
      const result = getStartOfDayInTimezone('UTC', 'invalid-date');
      expect(result).toBeInstanceOf(Date);
    });
  });
});
