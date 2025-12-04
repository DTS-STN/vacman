import { describe, expect, it } from 'vitest';

import type { LookupModel } from '~/.server/domain/models';
import { filterExpiredLookups, isLookupExpired } from '~/utils/lookup-utils';

describe('lookup-utils', () => {
  describe('isLookupExpired', () => {
    it('should return false when item is null', () => {
      expect(isLookupExpired(null)).toBe(false);
    });

    it('should return false when item is undefined', () => {
      expect(isLookupExpired(undefined)).toBe(false);
    });

    it('should return false when expiryDate is null', () => {
      const item: LookupModel = {
        id: 1,
        code: 'TEST',
        nameEn: 'Test',
        nameFr: 'Test',
        expiryDate: null,
      };
      expect(isLookupExpired(item)).toBe(false);
    });

    it('should return false when expiryDate is undefined', () => {
      const item: LookupModel = {
        id: 1,
        code: 'TEST',
        nameEn: 'Test',
        nameFr: 'Test',
      };
      expect(isLookupExpired(item)).toBe(false);
    });

    it('should return true when expiryDate is in the past', () => {
      const item: LookupModel = {
        id: 1,
        code: 'TEST',
        nameEn: 'Test',
        nameFr: 'Test',
        expiryDate: '2020-01-01T00:00:00.000Z',
      };
      expect(isLookupExpired(item)).toBe(true);
    });

    it('should return false when expiryDate is in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const item: LookupModel = {
        id: 1,
        code: 'TEST',
        nameEn: 'Test',
        nameFr: 'Test',
        expiryDate: futureDate.toISOString(),
      };
      expect(isLookupExpired(item)).toBe(false);
    });

    it('should return true when expiryDate equals current time', () => {
      const now = new Date();
      const item: LookupModel = {
        id: 1,
        code: 'TEST',
        nameEn: 'Test',
        nameFr: 'Test',
        expiryDate: now.toISOString(),
      };
      // Since we're comparing with <=, equal time means expired
      expect(isLookupExpired(item)).toBe(true);
    });
  });

  describe('filterExpiredLookups', () => {
    it('should return empty array when given empty array', () => {
      expect(filterExpiredLookups([])).toEqual([]);
    });

    it('should filter out expired items', () => {
      const items: LookupModel[] = [
        {
          id: 1,
          code: 'ACTIVE',
          nameEn: 'Active',
          nameFr: 'Actif',
          expiryDate: null,
        },
        {
          id: 2,
          code: 'EXPIRED',
          nameEn: 'Expired',
          nameFr: 'Expiré',
          expiryDate: '2020-01-01T00:00:00.000Z',
        },
        {
          id: 3,
          code: 'FUTURE',
          nameEn: 'Future',
          nameFr: 'Futur',
          expiryDate: '2099-12-31T23:59:59.999Z',
        },
      ];

      const filtered = filterExpiredLookups(items);

      expect(filtered).toHaveLength(2);
      expect(filtered[0]?.code).toBe('ACTIVE');
      expect(filtered[1]?.code).toBe('FUTURE');
    });

    it('should keep all items when none are expired', () => {
      const items: LookupModel[] = [
        {
          id: 1,
          code: 'ACTIVE1',
          nameEn: 'Active 1',
          nameFr: 'Actif 1',
        },
        {
          id: 2,
          code: 'ACTIVE2',
          nameEn: 'Active 2',
          nameFr: 'Actif 2',
          expiryDate: null,
        },
      ];

      const filtered = filterExpiredLookups(items);

      expect(filtered).toHaveLength(2);
    });

    it('should return empty array when all items are expired', () => {
      const items: LookupModel[] = [
        {
          id: 1,
          code: 'EXPIRED1',
          nameEn: 'Expired 1',
          nameFr: 'Expiré 1',
          expiryDate: '2020-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          code: 'EXPIRED2',
          nameEn: 'Expired 2',
          nameFr: 'Expiré 2',
          expiryDate: '2021-06-15T12:00:00.000Z',
        },
      ];

      const filtered = filterExpiredLookups(items);

      expect(filtered).toHaveLength(0);
    });
  });
});
