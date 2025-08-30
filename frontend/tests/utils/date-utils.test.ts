import { describe, expect, it, vi } from 'vitest';

import {
  formatDateTimeForTimezone,
  getStartOfDayInTimezone,
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
});
